import { Inject, Injectable } from "@nestjs/common";
import { Prisma } from "@prs/db";
import { PrismaService } from "../common/prisma.service.js";
import { mapProduct } from "../products/product.mapper.js";
import { RecommendationsService } from "../recommendations/recommendations.service.js";
import type {
  CreateProductDto,
  UpdateProductDto,
  UpdateRecommendationConfigDto,
  UpsertDictionaryDto
} from "./dto.js";

@Injectable()
export class AdminService {
  constructor(
    @Inject(PrismaService)
    private readonly prisma: PrismaService,
    @Inject(RecommendationsService)
    private readonly recommendations: RecommendationsService,
  ) {}

  async dashboard() {
    const [
      users,
      products,
      orders,
      events,
      recommendationImpressions,
      recommendationClicks,
      recentEvents,
      recentImpressions,
      recentClicks
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.product.count(),
      this.prisma.order.count(),
      this.prisma.userEvent.count(),
      this.prisma.recommendationImpression.count(),
      this.prisma.recommendationClick.count(),
      this.prisma.userEvent.findMany({ select: { createdAt: true }, orderBy: { createdAt: "desc" }, take: 1000 }),
      this.prisma.recommendationImpression.findMany({ select: { createdAt: true }, orderBy: { createdAt: "desc" }, take: 1000 }),
      this.prisma.recommendationClick.findMany({ select: { createdAt: true }, orderBy: { createdAt: "desc" }, take: 1000 })
    ]);

    return {
      metrics: {
        users,
        products,
        orders,
        events,
        recommendationImpressions,
        recommendationClicks,
        recommendationCtr:
          recommendationImpressions === 0 ? 0 : recommendationClicks / recommendationImpressions
      },
      trends: {
        events: this.byDay(recentEvents),
        recommendationImpressions: this.byDay(recentImpressions),
        recommendationClicks: this.byDay(recentClicks)
      }
    };
  }

  async users() {
    return this.prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 100
    });
  }

  async userDetail(userId: string) {
    const [user, profile, events, favorites, orders, debugRecommendations] = await Promise.all([
      this.prisma.user.findUniqueOrThrow({
        where: { id: userId },
        select: { id: true, email: true, name: true, role: true, avatarUrl: true, createdAt: true }
      }),
      this.recommendations.profile(userId),
      this.prisma.userEvent.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 50 }),
      this.prisma.favorite.findMany({
        where: { userId },
        include: { product: { include: { category: true, brand: true, tags: true } } },
        take: 20
      }),
      this.prisma.order.findMany({ where: { userId }, include: { items: true }, take: 20 }),
      this.recommendations.getRecommendations("for-you", { limit: 10 }, { id: userId, email: "", role: "ADMIN" })
    ]);

    return {
      user,
      profile,
      events,
      favorites: favorites.map((item) => mapProduct(item.product)),
      orders,
      recommendationDebugger: debugRecommendations
    };
  }

  async products() {
    const rows = await this.prisma.product.findMany({
      include: { category: true, brand: true, tags: true },
      orderBy: { updatedAt: "desc" },
      take: 100
    });
    return rows.map(mapProduct);
  }

  async createProduct(dto: CreateProductDto) {
    const product = await this.prisma.product.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        description: dto.description,
        shortDescription: dto.shortDescription,
        categoryId: dto.categoryId,
        brandId: dto.brandId,
        price: dto.price,
        ...(dto.originalPrice ? { originalPrice: dto.originalPrice } : {}),
        currency: dto.currency,
        coverImage: dto.coverImage,
        images: dto.images,
        stock: dto.stock,
        status: dto.status,
        attributes: dto.attributes as Prisma.InputJsonValue,
        tags: { create: dto.tags.map((tag) => ({ name: tag, slug: tag.toLowerCase().replaceAll(" ", "-") })) }
      },
      include: { category: true, brand: true, tags: true }
    });
    return mapProduct(product);
  }

  async updateProduct(productId: string, dto: UpdateProductDto) {
    await this.prisma.productTag.deleteMany({ where: { productId } });
    const product = await this.prisma.product.update({
      where: { id: productId },
      data: {
        name: dto.name,
        slug: dto.slug,
        description: dto.description,
        shortDescription: dto.shortDescription,
        categoryId: dto.categoryId,
        brandId: dto.brandId,
        price: dto.price,
        ...(dto.originalPrice ? { originalPrice: dto.originalPrice } : {}),
        currency: dto.currency,
        coverImage: dto.coverImage,
        images: dto.images,
        stock: dto.stock,
        status: dto.status,
        attributes: dto.attributes as Prisma.InputJsonValue,
        tags: { create: dto.tags.map((tag) => ({ name: tag, slug: tag.toLowerCase().replaceAll(" ", "-") })) }
      },
      include: { category: true, brand: true, tags: true }
    });
    return mapProduct(product);
  }

  async deleteProduct(productId: string) {
    await this.prisma.product.delete({ where: { id: productId } });
    return { success: true };
  }

  async categories() {
    return this.prisma.category.findMany({ orderBy: { name: "asc" } });
  }

  async upsertCategory(dto: UpsertDictionaryDto) {
    return this.prisma.category.upsert({
      where: { slug: dto.slug },
      create: dto,
      update: dto
    });
  }

  async brands() {
    return this.prisma.brand.findMany({ orderBy: { name: "asc" } });
  }

  async upsertBrand(dto: UpsertDictionaryDto) {
    return this.prisma.brand.upsert({
      where: { slug: dto.slug },
      create: dto,
      update: dto
    });
  }

  async recommendationConfig() {
    return this.prisma.recommendationConfig.findUnique({ where: { key: "default" } });
  }

  async updateRecommendationConfig(dto: UpdateRecommendationConfigDto) {
    return this.prisma.recommendationConfig.upsert({
      where: { key: "default" },
      create: {
        key: "default",
        value: dto.value as Prisma.InputJsonValue,
        description: "Default explainable ranking config"
      },
      update: { value: dto.value as Prisma.InputJsonValue }
    });
  }

  async recommendationAnalytics() {
    const [impressions, clicks, byStrategy, topRecommended, topClicked] = await Promise.all([
      this.prisma.recommendationImpression.count(),
      this.prisma.recommendationClick.count(),
      this.strategyCtr(),
      this.topProducts("recommendationImpression"),
      this.topProducts("recommendationClick")
    ]);
    return {
      impressions,
      clicks,
      ctr: impressions === 0 ? 0 : clicks / impressions,
      byStrategy,
      topRecommended,
      topClicked
    };
  }

  async orders() {
    return this.prisma.order.findMany({
      include: { user: { select: { email: true, name: true } }, items: true },
      orderBy: { createdAt: "desc" },
      take: 100
    });
  }

  async events() {
    return this.prisma.userEvent.findMany({
      include: { user: { select: { email: true } }, product: { select: { name: true, slug: true } } },
      orderBy: { createdAt: "desc" },
      take: 200
    });
  }

  private async strategyCtr() {
    const [impressions, clicks] = await Promise.all([
      this.prisma.recommendationImpression.groupBy({ by: ["strategy"], _count: true }),
      this.prisma.recommendationClick.groupBy({ by: ["strategy"], _count: true })
    ]);
    return impressions.map((row) => {
      const clickCount = clicks.find((click) => click.strategy === row.strategy)?._count ?? 0;
      return {
        strategy: row.strategy,
        impressions: row._count,
        clicks: clickCount,
        ctr: row._count === 0 ? 0 : clickCount / row._count
      };
    });
  }

  private async topProducts(model: "recommendationImpression" | "recommendationClick") {
    const rows =
      model === "recommendationImpression"
        ? await this.prisma.recommendationImpression.groupBy({
            by: ["productId"],
            _count: true,
            orderBy: { _count: { productId: "desc" } },
            take: 10
          })
        : await this.prisma.recommendationClick.groupBy({
            by: ["productId"],
            _count: true,
            orderBy: { _count: { productId: "desc" } },
            take: 10
          });
    const products = await this.prisma.product.findMany({
      where: { id: { in: rows.map((row) => row.productId) } },
      include: { category: true, brand: true, tags: true }
    });
    const productById = new Map(products.map((product) => [product.id, product]));
    return rows.map((row) => ({
      count: row._count,
      product: productById.get(row.productId) ? mapProduct(productById.get(row.productId)!) : null
    }));
  }

  private byDay(rows: Array<{ createdAt: Date }>) {
    const bucket = new Map<string, number>();
    const today = new Date();
    for (let offset = 6; offset >= 0; offset -= 1) {
      const date = new Date(today.getTime() - offset * 86_400_000).toISOString().slice(0, 10);
      bucket.set(date, 0);
    }
    for (const row of rows) {
      const date = row.createdAt.toISOString().slice(0, 10);
      if (bucket.has(date)) {
        bucket.set(date, (bucket.get(date) ?? 0) + 1);
      }
    }
    return Array.from(bucket.entries()).map(([date, count]) => ({ date, count }));
  }
}
