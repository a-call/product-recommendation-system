import { Type } from "class-transformer";
import { IsInt, Min } from "class-validator";

export class AddCartItemDto {
  @IsInt()
  @Min(1)
  @Type(() => Number)
  quantity = 1;
}
