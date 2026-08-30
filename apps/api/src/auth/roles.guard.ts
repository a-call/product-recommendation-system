import { CanActivate, ExecutionContext, ForbiddenException, Inject, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "./auth.decorators.js";
import type { RequestUser } from "../common/current-user.js";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(@Inject(Reflector) private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<Array<RequestUser["role"]>>(ROLES_KEY, [
      context.getHandler(),
      context.getClass()
    ]);
    if (!roles || roles.length === 0) {
      return true;
    }
    const request = context.switchToHttp().getRequest<{ user?: RequestUser }>();
    const user = request.user;
    if (!user) {
      throw new ForbiddenException("Authentication required");
    }
    if (user.role === "SUPER_ADMIN" || roles.includes(user.role)) {
      return true;
    }
    throw new ForbiddenException("Insufficient permissions");
  }
}
