import { IsInt, IsUUID, Min } from 'class-validator';

export class MoveCardDto {
  @IsUUID()
  toColumnId!: string;

  @IsInt()
  @Min(0)
  toIndex!: number;
}
