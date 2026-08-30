import { IsIn, IsObject, IsOptional, IsString } from "class-validator";
import { userEventTypes, type UserEventType } from "@prs/shared";

export class TrackEventDto {
  @IsIn(userEventTypes)
  type!: UserEventType;

  @IsString()
  @IsOptional()
  userId?: string;

  @IsString()
  @IsOptional()
  visitorId?: string;

  @IsString()
  sessionId!: string;

  @IsString()
  @IsOptional()
  productId?: string;

  @IsString()
  @IsOptional()
  categoryId?: string;

  @IsString()
  @IsOptional()
  recommendationId?: string;

  @IsString()
  @IsOptional()
  source?: string;

  @IsString()
  @IsOptional()
  page?: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, unknown>;
}
