import { Global, Module } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard.js";
import { RolesGuard } from "../auth/roles.guard.js";
import { PrismaService } from "./prisma.service.js";

@Global()
@Module({
  providers: [PrismaService, JwtAuthGuard, RolesGuard],
  exports: [PrismaService, JwtAuthGuard, RolesGuard]
})
export class CommonModule {}
