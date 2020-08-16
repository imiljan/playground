import { Transform } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';

export class GetPostsDto {
  @IsOptional()
  @IsNumber()
  @Transform((value) => parseInt(value))
  take: number;

  @IsOptional()
  @IsNumber()
  @Transform((value) => parseInt(value))
  skip: number;
}
