import { Body, Controller, Delete, Get, Inject, Param, Post, UseGuards } from "@nestjs/common";
import { ok } from "../common/api-response.js";
import { CurrentUser, type RequestUser } from "../common/current-user.js";
import { JwtAuthGuard } from "../auth/jwt-auth.guard.js";
import { AddCartItemDto } from "./dto.js";
import { UsersService } from "./users.service.js";

@Controller("me")
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(@Inject(UsersService) private readonly users: UsersService) {}

  @Get("favorites")
  async favorites(@CurrentUser() user: RequestUser) {
    return ok(await this.users.favorites(user.id));
  }

  @Post("favorites/:productId")
  async addFavorite(@CurrentUser() user: RequestUser, @Param("productId") productId: string) {
    return ok(await this.users.addFavorite(user.id, productId));
  }

  @Delete("favorites/:productId")
  async removeFavorite(@CurrentUser() user: RequestUser, @Param("productId") productId: string) {
    return ok(await this.users.removeFavorite(user.id, productId));
  }

  @Get("cart")
  async cart(@CurrentUser() user: RequestUser) {
    return ok(await this.users.cart(user.id));
  }

  @Post("cart/:productId")
  async addCartItem(
    @CurrentUser() user: RequestUser,
    @Param("productId") productId: string,
    @Body() dto: AddCartItemDto,
  ) {
    return ok(await this.users.addCartItem(user.id, productId, dto.quantity));
  }

  @Delete("cart/:productId")
  async removeCartItem(@CurrentUser() user: RequestUser, @Param("productId") productId: string) {
    return ok(await this.users.removeCartItem(user.id, productId));
  }

  @Post("checkout")
  async checkout(@CurrentUser() user: RequestUser) {
    return ok(await this.users.checkout(user.id));
  }

  @Get("history")
  async history(@CurrentUser() user: RequestUser) {
    return ok(await this.users.history(user.id));
  }
}
