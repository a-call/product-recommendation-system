import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  UseGuards
} from "@nestjs/common";
import { Roles } from "../auth/auth.decorators.js";
import { JwtAuthGuard } from "../auth/jwt-auth.guard.js";
import { RolesGuard } from "../auth/roles.guard.js";
import { ok } from "../common/api-response.js";
import { AdminService } from "./admin.service.js";
import {
  CreateProductDto,
  UpdateProductDto,
  UpdateRecommendationConfigDto,
  UpsertDictionaryDto
} from "./dto.js";

@Controller("admin")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("ADMIN", "SUPER_ADMIN")
export class AdminController {
  constructor(@Inject(AdminService) private readonly admin: AdminService) {}

  @Get("dashboard")
  async dashboard() {
    return ok(await this.admin.dashboard());
  }

  @Get("users")
  async users() {
    return ok(await this.admin.users());
  }

  @Get("users/:userId")
  async userDetail(@Param("userId") userId: string) {
    return ok(await this.admin.userDetail(userId));
  }

  @Get("products")
  async products() {
    return ok(await this.admin.products());
  }

  @Post("products")
  async createProduct(@Body() dto: CreateProductDto) {
    return ok(await this.admin.createProduct(dto));
  }

  @Patch("products/:productId")
  async updateProduct(@Param("productId") productId: string, @Body() dto: UpdateProductDto) {
    return ok(await this.admin.updateProduct(productId, dto));
  }

  @Delete("products/:productId")
  async deleteProduct(@Param("productId") productId: string) {
    return ok(await this.admin.deleteProduct(productId));
  }

  @Get("categories")
  async categories() {
    return ok(await this.admin.categories());
  }

  @Post("categories")
  async upsertCategory(@Body() dto: UpsertDictionaryDto) {
    return ok(await this.admin.upsertCategory(dto));
  }

  @Get("brands")
  async brands() {
    return ok(await this.admin.brands());
  }

  @Post("brands")
  async upsertBrand(@Body() dto: UpsertDictionaryDto) {
    return ok(await this.admin.upsertBrand(dto));
  }

  @Get("recommendation-config")
  async recommendationConfig() {
    return ok(await this.admin.recommendationConfig());
  }

  @Patch("recommendation-config")
  async updateRecommendationConfig(@Body() dto: UpdateRecommendationConfigDto) {
    return ok(await this.admin.updateRecommendationConfig(dto));
  }

  @Get("recommendation-analytics")
  async recommendationAnalytics() {
    return ok(await this.admin.recommendationAnalytics());
  }

  @Get("orders")
  async orders() {
    return ok(await this.admin.orders());
  }

  @Get("events")
  async events() {
    return ok(await this.admin.events());
  }
}
