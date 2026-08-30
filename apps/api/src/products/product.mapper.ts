import type { Prisma } from "@prs/db";

type ProductWithRelations = Prisma.ProductGetPayload<{
  include: { category: true; brand: true; tags: true };
}>;

export function mapProduct(product: ProductWithRelations) {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    shortDescription: product.shortDescription,
    price: Number(product.price),
    originalPrice: product.originalPrice ? Number(product.originalPrice) : null,
    currency: product.currency,
    coverImage: product.coverImage,
    images: Array.isArray(product.images) ? product.images : [],
    stock: product.stock,
    status: product.status,
    attributes: product.attributes,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
    category: {
      id: product.category.id,
      name: product.category.name,
      slug: product.category.slug
    },
    brand: {
      id: product.brand.id,
      name: product.brand.name,
      slug: product.brand.slug
    },
    tags: product.tags.map((tag) => tag.name)
  };
}

export type ProductDto = ReturnType<typeof mapProduct>;
