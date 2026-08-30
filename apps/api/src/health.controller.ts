import { Controller, Get } from "@nestjs/common";
import { ok } from "./common/api-response.js";

@Controller()
export class HealthController {
  @Get()
  health() {
    return ok({
      service: "product-recommendation-api",
      status: "ok",
      timestamp: new Date().toISOString()
    });
  }
}
