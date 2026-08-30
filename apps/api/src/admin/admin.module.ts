import { Module } from "@nestjs/common";
import { RecommendationsModule } from "../recommendations/recommendations.module.js";
import { AdminController } from "./admin.controller.js";
import { AdminService } from "./admin.service.js";

@Module({
  imports: [RecommendationsModule],
  controllers: [AdminController],
  providers: [AdminService]
})
export class AdminModule {}
