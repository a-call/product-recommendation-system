import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../common/prisma.service.js";
import { mapProduct } from "../products/product.mapper.js";

@Injectable()
export class UsersService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async favorites(userId: string) {
    const rows = await this.prisma.favorite.findMany({
      where: { userId },
      include: { product: { include: { category: true, brand: true, tags: true } } },
      orderBy: { createdAt: "desc" }
    });
    return rows.map((row) => mapProduct(row.product));
  }

  async addFavorite(userId: string, productId: string) {
    await this.ensureProduct(productId);
    return this.prisma.favorite.upsert({
      where: { userId_productId: { userId, productId } },
      create: { userId, productId },
      update: {}
    });
  }

  async removeFavorite(userId: string, productId: string) {
    await this.prisma.favorite.deleteMany({ where: { userId, productId } });
    return { success: true };
  }

  async cart(userId: string) {
    const cart = await this.prisma.cart.upsert({
      where: { userId },
      create: { userId },
      update: {},
      include: { items: { include: { product: { include: { category: true, brand: true, tags: true } } } } }
    });
    return {
      id: cart.id,
      items: cart.items.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        product: mapProduct(item.product)
      })),
      total: cart.items.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0)
    };
  }

  async addCartItem(userId: string, productId: string, quantity: number) {
    const cart = await this.prisma.cart.upsert({ where: { userId }, create: { userId }, update: {} });
    await this.ensureProduct(productId);
    return this.prisma.cartItem.upsert({
      where: { cartId_productId: { cartId: cart.id, productId } },
      create: { cartId: cart.id, productId, quantity },
      update: { quantity: { increment: quantity } }
    });
  }

  async removeCartItem(userId: string, productId: string) {
    const cart = await this.prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      return { success: true };
    }
    await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id, productId } });
    return { success: true };
  }

  async checkout(userId: string) {
    const cart = await this.cart(userId);
    if (cart.items.length === 0) {
      throw new NotFoundException("Cart is empty");
    }
    const order = await this.prisma.order.create({
      data: {
        userId,
        status: "PAID",
        total: cart.total,
        items: {
          create: cart.items.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
            price: item.product.price
          }))
        }
      }
    });
    await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    return order;
  }

  async history(userId: string) {
    const rows = await this.prisma.userEvent.findMany({
      where: { userId, eventType: { in: ["PRODUCT_VIEW", "PRODUCT_CLICK"] } },
      include: { product: { include: { category: true, brand: true, tags: true } } },
      orderBy: { createdAt: "desc" },
      take: 80
    });
    return rows.filter((row) => row.product).map((row) => ({
      eventId: row.id,
      eventType: row.eventType,
      createdAt: row.createdAt,
      product: mapProduct(row.product!)
    }));
  }

  private async ensureProduct(productId: string) {
    const exists = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!exists) {
      throw new NotFoundException("Product not found");
    }
  }
}
