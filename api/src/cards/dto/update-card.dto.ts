import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateCardDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
