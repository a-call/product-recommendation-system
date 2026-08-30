import { Body, Controller, Inject, Post, UseGuards } from "@nestjs/common";
import { ok } from "../common/api-response.js";
import { CurrentUser, type RequestUser } from "../common/current-user.js";
import { Public } from "../auth/auth.decorators.js";
import { JwtAuthGuard } from "../auth/jwt-auth.guard.js";
import { TrackEventDto } from "./dto.js";
import { EventsService } from "./events.service.js";

@Controller("events")
@UseGuards(JwtAuthGuard)
export class EventsController {
  constructor(@Inject(EventsService) private readonly events: EventsService) {}

  @Public()
  @Post()
  async track(@Body() dto: TrackEventDto, @CurrentUser() user?: RequestUser) {
    return ok(await this.events.track(dto, user));
  }
}
