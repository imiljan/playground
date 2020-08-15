import { IsNotEmpty, IsString } from 'class-validator';

export class PresignedWriteDto {
  @IsNotEmpty()
  @IsString()
  extension: string;

  @IsNotEmpty()
  @IsString()
  contentType: string;
}
