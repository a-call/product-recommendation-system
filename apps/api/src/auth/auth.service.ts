import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Prisma } from "@prs/db";
import bcrypt from "bcryptjs";
import { PrismaService } from "../common/prisma.service.js";
import type { LoginDto, RegisterDto, UpdateProfileDto } from "./dto.js";

@Injectable()
export class AuthService {
  constructor(
    @Inject(PrismaService)
    private readonly prisma: PrismaService,
    @Inject(JwtService)
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException("Email is already registered");
    }
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        ...(dto.name ? { name: dto.name } : {}),
        passwordHash: await bcrypt.hash(dto.password, 12),
        cart: { create: {} }
      }
    });
    await this.mergeVisitor(dto.visitorId, user.id);
    return this.session(user.id);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException("Invalid email or password");
    }
    await this.mergeVisitor(dto.visitorId, user.id);
    return this.session(user.id);
  }

  async currentUser(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true, avatarUrl: true, createdAt: true }
    });
    return user;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.name ? { name: dto.name } : {}),
        ...(dto.avatarUrl ? { avatarUrl: dto.avatarUrl } : {})
      },
      select: { id: true, email: true, name: true, role: true, avatarUrl: true, updatedAt: true }
    });
  }

  private async session(userId: string) {
    const user = await this.currentUser(userId);
    const accessToken = await this.jwt.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role
    });
    return { accessToken, user };
  }

  private async mergeVisitor(visitorId: string | undefined, userId: string) {
    if (!visitorId) {
      return;
    }
    await this.prisma.$transaction([
      this.prisma.userEvent.updateMany({ where: { visitorId, userId: null }, data: { userId } }),
      this.prisma.searchHistory.updateMany({ where: { visitorId, userId: null }, data: { userId } }),
      this.prisma.recommendationImpression.updateMany({
        where: { visitorId, userId: null },
        data: { userId }
      }),
      this.prisma.recommendationClick.updateMany({
        where: { visitorId, userId: null },
        data: { userId }
      })
    ] as Prisma.PrismaPromise<unknown>[]);
  }
}
