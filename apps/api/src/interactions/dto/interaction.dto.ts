import { IsIn, IsNumber, IsOptional, IsString, Max, Min, ValidateIf } from 'class-validator';
import { INTERACTION_TYPES } from '@view/shared';

export class CreateInteractionDto {
  @IsString()
  itemId!: string;

  @IsIn(INTERACTION_TYPES as unknown as string[])
  type!: string;

  @ValidateIf((o) => o.type === 'rating')
  @IsNumber()
  @Min(1)
  @Max(5)
  value?: number;
}

export class HistoryQueryDto {
  @IsOptional()
  @IsIn(['view', 'favorite', 'rating'])
  type?: string;
}
