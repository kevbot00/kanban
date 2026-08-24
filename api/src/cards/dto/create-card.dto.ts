import {
  IsOptional,
  IsString,
  IsNotEmpty,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateCardDto {
  @IsOptional()
  @IsUUID()
  id?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsUUID()
  columnId!: string;
}
