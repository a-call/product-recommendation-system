import { Module } from "@nestjs/common";
import { JwtModule, type JwtSignOptions } from "@nestjs/jwt";
import { loadConfig } from "@prs/config";
import { AdminModule } from "./admin/admin.module.js";
import { AuthModule } from "./auth/auth.module.js";
import { EventsModule } from "./events/events.module.js";
import { ProductsModule } from "./products/products.module.js";
import { RecommendationsModule } from "./recommendations/recommendations.module.js";
import { UsersModule } from "./users/users.module.js";
import { CommonModule } from "./common/common.module.js";
import { HealthController } from "./health.controller.js";

const config = loadConfig();
const signOptions: JwtSignOptions = config.jwtExpiresIn
  ? { expiresIn: config.jwtExpiresIn as NonNullable<JwtSignOptions["expiresIn"]> }
  : {};

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: config.jwtSecret,
      signOptions
    }),
    CommonModule,
    AuthModule,
    ProductsModule,
    EventsModule,
    RecommendationsModule,
    AdminModule,
    UsersModule
  ],
  controllers: [HealthController]
})
export class AppModule {}
