import { Body, Controller, Get, Inject, Patch, Post, UseGuards } from "@nestjs/common";
import { ok } from "../common/api-response.js";
import { CurrentUser, type RequestUser } from "../common/current-user.js";
import { AuthService } from "./auth.service.js";
import { Public } from "./auth.decorators.js";
import { JwtAuthGuard } from "./jwt-auth.guard.js";
import { LoginDto, RegisterDto, UpdateProfileDto } from "./dto.js";

@Controller("auth")
@UseGuards(JwtAuthGuard)
export class AuthController {
  constructor(@Inject(AuthService) private readonly auth: AuthService) {}

  @Public()
  @Post("register")
  async register(@Body() dto: RegisterDto) {
    return ok(await this.auth.register(dto));
  }

  @Public()
  @Post("login")
  async login(@Body() dto: LoginDto) {
    return ok(await this.auth.login(dto));
  }

  @Post("logout")
  logout() {
    return ok({ success: true });
  }

  @Get("me")
  async me(@CurrentUser() user: RequestUser) {
    return ok(await this.auth.currentUser(user.id));
  }

  @Patch("me")
  async update(@CurrentUser() user: RequestUser, @Body() dto: UpdateProfileDto) {
    return ok(await this.auth.updateProfile(user.id, dto));
  }
}
