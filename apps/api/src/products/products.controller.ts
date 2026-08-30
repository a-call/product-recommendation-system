import { Controller, Get, Inject, Param, Query } from "@nestjs/common";
import { ok } from "../common/api-response.js";
import { ProductQueryDto } from "./dto.js";
import { ProductsService } from "./products.service.js";

@Controller()
export class ProductsController {
  constructor(@Inject(ProductsService) private readonly products: ProductsService) {}

  @Get("products")
  async list(@Query() query: ProductQueryDto) {
    return ok(await this.products.list(query));
  }

  @Get("products/:slug")
  async detail(@Param("slug") slug: string) {
    return ok(await this.products.findBySlug(slug));
  }

  @Get("categories")
  async categories() {
    return ok(await this.products.categories());
  }

  @Get("brands")
  async brands() {
    return ok(await this.products.brands());
  }
}
