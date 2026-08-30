import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prs/db";
import { pagination } from "../common/api-response.js";
import { PrismaService } from "../common/prisma.service.js";
import type { ProductQueryDto } from "./dto.js";
import { mapProduct } from "./product.mapper.js";

@Injectable()
export class ProductsService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async list(query: ProductQueryDto) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 24);
    const where: Prisma.ProductWhereInput = {
      status: "ACTIVE",
      ...(query.q
        ? {
            OR: [
              { name: { contains: query.q, mode: "insensitive" } },
              { description: { contains: query.q, mode: "insensitive" } },
              { shortDescription: { contains: query.q, mode: "insensitive" } },
              { tags: { some: { name: { contains: query.q, mode: "insensitive" } } } }
            ]
          }
        : {}),
      ...(query.category ? { category: { slug: query.category } } : {}),
      ...(query.brand ? { brand: { slug: query.brand } } : {}),
      ...(query.minPrice || query.maxPrice
        ? {
            price: {
              ...(query.minPrice ? { gte: query.minPrice } : {}),
              ...(query.maxPrice ? { lte: query.maxPrice } : {})
            }
          }
        : {})
    };

    const orderBy: Prisma.ProductOrderByWithRelationInput =
      query.sort === "price-asc"
        ? { price: "asc" }
        : query.sort === "price-desc"
          ? { price: "desc" }
          : { createdAt: "desc" };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        include: { category: true, brand: true, tags: true },
        orderBy,
        skip: (page - 1) * limit,
        take: limit
      }),
      this.prisma.product.count({ where })
    ]);

    return {
      items: items.map(mapProduct),
      pagination: pagination(page, limit, total)
    };
  }

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findFirst({
      where: { slug, status: "ACTIVE" },
      include: { category: true, brand: true, tags: true }
    });
    if (!product) {
      throw new NotFoundException("Product not found");
    }
    return mapProduct(product);
  }

  async categories() {
    return this.prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true, description: true }
    });
  }

  async brands() {
    return this.prisma.brand.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true, description: true, logoUrl: true }
    });
  }
}
