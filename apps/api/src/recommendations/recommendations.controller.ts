import { Controller, Get, Inject, Param, Query, UseGuards } from "@nestjs/common";
import { ok } from "../common/api-response.js";
import { CurrentUser, type RequestUser } from "../common/current-user.js";
import { Public } from "../auth/auth.decorators.js";
import { JwtAuthGuard } from "../auth/jwt-auth.guard.js";
import { RecommendationQueryDto } from "./dto.js";
import { RecommendationsService } from "./recommendations.service.js";

@Controller("recommendations")
@UseGuards(JwtAuthGuard)
export class RecommendationsController {
  constructor(@Inject(RecommendationsService) private readonly recommendations: RecommendationsService) {}

  @Public()
  @Get("home")
  async home(@Query() query: RecommendationQueryDto, @CurrentUser() user?: RequestUser) {
    return ok(await this.recommendations.getRecommendations("home", query, user));
  }

  @Public()
  @Get("for-you")
  async forYou(@Query() query: RecommendationQueryDto, @CurrentUser() user?: RequestUser) {
    return ok(await this.recommendations.getRecommendations("for-you", query, user));
  }

  @Public()
  @Get("similar/:productId")
  async similar(
    @Param("productId") productId: string,
    @Query() query: RecommendationQueryDto,
    @CurrentUser() user?: RequestUser,
  ) {
    return ok(await this.recommendations.getRecommendations("similar", query, user, productId));
  }

  @Public()
  @Get("popular")
  async popular(@Query() query: RecommendationQueryDto, @CurrentUser() user?: RequestUser) {
    return ok(await this.recommendations.getRecommendations("popular", query, user));
  }

  @Public()
  @Get("recent-related")
  async recentRelated(@Query() query: RecommendationQueryDto, @CurrentUser() user?: RequestUser) {
    return ok(await this.recommendations.getRecommendations("recent-related", query, user));
  }
}
