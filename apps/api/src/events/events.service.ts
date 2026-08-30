import { Inject, Injectable } from "@nestjs/common";
import { Prisma } from "@prs/db";
import { PrismaService } from "../common/prisma.service.js";
import type { RequestUser } from "../common/current-user.js";
import type { TrackEventDto } from "./dto.js";

@Injectable()
export class EventsService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async track(dto: TrackEventDto, user?: RequestUser) {
    const userId = user?.id ?? dto.userId;
    const event = await this.prisma.userEvent.create({
      data: {
        sessionId: dto.sessionId,
        eventType: dto.type,
        ...(userId ? { userId } : {}),
        ...(dto.visitorId ? { visitorId: dto.visitorId } : {}),
        ...(dto.productId ? { productId: dto.productId } : {}),
        ...(dto.categoryId ? { categoryId: dto.categoryId } : {}),
        metadata: (dto.metadata ?? {}) as Prisma.InputJsonValue,
        ...(dto.source ? { source: dto.source } : {}),
        ...(dto.page ? { page: dto.page } : {}),
        ...(dto.recommendationId ? { recommendationId: dto.recommendationId } : {})
      }
    });

    if (dto.type === "SEARCH") {
      const query = typeof dto.metadata?.query === "string" ? dto.metadata.query : "";
      if (query) {
        await this.prisma.searchHistory.create({
          data: {
            sessionId: dto.sessionId,
            query,
            ...(userId ? { userId } : {}),
            ...(dto.visitorId ? { visitorId: dto.visitorId } : {}),
            resultCount:
              typeof dto.metadata?.resultCount === "number" ? dto.metadata.resultCount : 0
          }
        });
      }
    }

    if (dto.type === "RECOMMENDATION_CLICK" && dto.productId) {
      const impression = dto.recommendationId
        ? await this.prisma.recommendationImpression.findUnique({
            where: { id: dto.recommendationId }
          })
        : null;
      await this.prisma.recommendationClick.create({
        data: {
          productId: dto.productId,
          strategy: String(dto.metadata?.strategy ?? impression?.strategy ?? "unknown"),
          ...(impression?.id ? { impressionId: impression.id } : {}),
          ...(userId ? { userId } : {}),
          ...(dto.visitorId ? { visitorId: dto.visitorId } : {}),
          ...(typeof dto.metadata?.position === "number"
            ? { position: dto.metadata.position }
            : impression?.position
              ? { position: impression.position }
              : {})
        }
      });
    }

    return event;
  }
}
