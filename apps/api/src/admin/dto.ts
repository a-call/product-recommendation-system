import { Type } from "class-transformer";
import {
  IsArray,
  IsIn,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Min
} from "class-validator";

export class CreateProductDto {
  @IsString()
  name!: string;

  @IsString()
  slug!: string;

  @IsString()
  description!: string;

  @IsString()
  shortDescription!: string;

  @IsString()
  categoryId!: string;

  @IsString()
  brandId!: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price!: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  originalPrice?: number;

  @IsString()
  @IsOptional()
  currency = "USD";

  @IsString()
  coverImage!: string;

  @IsArray()
  @IsOptional()
  images: string[] = [];

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  stock = 0;

  @IsIn(["DRAFT", "ACTIVE", "INACTIVE"])
  @IsOptional()
  status: "DRAFT" | "ACTIVE" | "INACTIVE" = "DRAFT";

  @IsArray()
  @IsOptional()
  tags: string[] = [];

  @IsObject()
  @IsOptional()
  attributes: Record<string, unknown> = {};
}

export class UpdateProductDto extends CreateProductDto {}

export class UpsertDictionaryDto {
  @IsString()
  name!: string;

  @IsString()
  slug!: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateRecommendationConfigDto {
  @IsObject()
  value!: Record<string, unknown>;
}
