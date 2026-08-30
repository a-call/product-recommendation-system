import { Type } from "class-transformer";
import {
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min
} from "class-validator";

export class ProductQueryDto {
  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  page = 1;

  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  @IsOptional()
  limit = 24;

  @IsString()
  @IsOptional()
  q?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  brand?: string;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  minPrice?: number;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  maxPrice?: number;

  @IsIn(["newest", "price-asc", "price-desc", "popular"])
  @IsOptional()
  sort: "newest" | "price-asc" | "price-desc" | "popular" = "newest";
}
