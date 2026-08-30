import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { RecommendationEngine, type BehaviorEvent, type ProductCandidate } from "@prs/recommendation";
import type { RecommendationStrategy } from "@prs/shared";
import { Prisma } from "@prs/db";
import type { RequestUser } from "../common/current-user.js";
import { PrismaService } from "../common/prisma.service.js";
import { mapProduct } from "../products/product.mapper.js";
import type { RecommendationQueryDto } from "./dto.js";

type ProductWithRelations = Prisma.ProductGetPayload<{
  include: { category: true; brand: true; tags: true };
}>;

@Injectable()
export class RecommendationsService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async getRecommendations(
    strategy: RecommendationStrategy,
    query: RecommendationQueryDto,
    user?: RequestUser,
    productId?: string,
  ) {
    const [config, candidates, events, impressions] = await Promise.all([
      this.loadConfig(),
      this.loadCandidates(),
      this.loadEvents(user?.id, query.visitorId),
      this.loadImpressions(user?.id, query.visitorId)
    ]);

    const similarTo =
      strategy === "similar" && productId
        ? candidates.find((candidate) => candidate.id === productId)
        : undefined;
    if (strategy === "similar" && !similarTo) {
      throw new NotFoundException("Product not found for similar recommendations");
    }

    const engine = new RecommendationEngine(config);
    const ranked = engine.recommend({
      candidates: candidates.map(this.toCandidate),
      events: events.map(this.toBehaviorEvent),
      impressions,
      strategy,
      limit: Number(query.limit ?? 12),
      excludeProductIds: this.parseExclude(query.excludeProductIds),
      ...(similarTo ? { similarTo: this.toCandidate(similarTo) } : {})
    });

    const productById = new Map(candidates.map((product) => [product.id, product]));
    const saved = await Promise.all(
      ranked.map(async (item, index) => {
        const impression = await this.prisma.recommendationImpression.create({
          data: {
            productId: item.product.id,
            strategy,
            position: index + 1,
            score: item.score,
            reason: item.reason as Prisma.InputJsonValue,
            ...(user?.id ? { userId: user.id } : {}),
            ...(query.visitorId ? { visitorId: query.visitorId } : {})
          }
        });
        await this.prisma.userEvent.create({
          data: {
            sessionId: query.sessionId ?? "unknown-session",
            eventType: "RECOMMENDATION_IMPRESSION",
            productId: item.product.id,
            metadata: { strategy, position: index + 1, score: item.score } as Prisma.InputJsonValue,
            source: "recommendation-api",
            page: strategy,
            recommendationId: impression.id,
            ...(user?.id ? { userId: user.id } : {}),
            ...(query.visitorId ? { visitorId: query.visitorId } : {})
          }
        });
        const product = productById.get(item.product.id);
        if (!product) {
          return null;
        }
        return {
          recommendationId: impression.id,
          product: mapProduct(product),
          score: item.score,
          reason: item.reason,
          strategy,
          explanation: item.explanation
        };
      })
    );

    return saved.filter((item): item is NonNullable<typeof item> => Boolean(item));
  }

  async profile(userId: string) {
    const config = await this.loadConfig();
    const events = await this.loadEvents(userId, undefined);
    return new RecommendationEngine(config).buildProfile({ events: events.map(this.toBehaviorEvent) });
  }

  private async loadConfig() {
    const row = await this.prisma.recommendationConfig.findUnique({ where: { key: "default" } });
    return row?.value as Partial<import("@prs/recommendation").RecommendationConfig> | undefined;
  }

  private async loadCandidates(): Promise<ProductWithRelations[]> {
    return this.prisma.product.findMany({
      where: { status: "ACTIVE" },
      include: { category: true, brand: true, tags: true },
      orderBy: { createdAt: "desc" },
      take: 300
    });
  }

  private async loadEvents(userId?: string, visitorId?: string) {
    if (!userId && !visitorId) {
      return [];
    }
    return this.prisma.userEvent.findMany({
      where: {
        OR: [
          ...(userId ? [{ userId }] : []),
          ...(visitorId ? [{ visitorId }] : [])
        ]
      },
      include: { product: { include: { category: true, brand: true, tags: true } }, category: true },
      orderBy: { createdAt: "desc" },
      take: 500
    });
  }

  private async loadImpressions(userId?: string, visitorId?: string) {
    if (!userId && !visitorId) {
      return [];
    }
    return this.prisma.recommendationImpression.findMany({
      where: {
        OR: [
          ...(userId ? [{ userId }] : []),
          ...(visitorId ? [{ visitorId }] : [])
        ]
      },
      select: { productId: true, strategy: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 300
    });
  }

  private toCandidate(product: ProductWithRelations): ProductCandidate {
    return {
      id: product.id,
      name: product.name,
      categoryId: product.categoryId,
      categorySlug: product.category.slug,
      brandId: product.brandId,
      brandSlug: product.brand.slug,
      tags: product.tags.map((tag) => tag.slug),
      price: Number(product.price),
      createdAt: product.createdAt,
      popularity: product.stock + Math.max(0, 100 - product.createdAt.getTime() / 86_400_000_000)
    };
  }

  private toBehaviorEvent(event: Awaited<ReturnType<RecommendationsService["loadEvents"]>>[number]): BehaviorEvent {
    const categorySlug = event.product?.category.slug ?? event.category?.slug;
    return {
      eventType: event.eventType,
      tags: event.product?.tags.map((tag) => tag.slug) ?? [],
      metadata: typeof event.metadata === "object" && event.metadata ? event.metadata as Record<string, unknown> : {},
      createdAt: event.createdAt,
      ...(event.productId ? { productId: event.productId } : {}),
      ...(event.categoryId ? { categoryId: event.categoryId } : {}),
      ...(categorySlug ? { categorySlug } : {}),
      ...(event.product?.brandId ? { brandId: event.product.brandId } : {}),
      ...(event.product?.brand.slug ? { brandSlug: event.product.brand.slug } : {}),
      ...(event.product ? { price: Number(event.product.price) } : {})
    };
  }

  private parseExclude(excludeProductIds?: string) {
    return excludeProductIds?.split(",").map((id) => id.trim()).filter(Boolean) ?? [];
  }
}
