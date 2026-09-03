import { Transform } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min, MaxLength } from 'class-validator';
import { CATEGORIES } from '@view/shared';

const toInt = ({ value }: { value: unknown }) =>
  value === undefined || value === '' ? undefined : Number.parseInt(String(value), 10);

export class ItemQueryDto {
  @IsOptional()
  @IsIn(CATEGORIES as unknown as string[])
  category?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  @Transform(({ value }) => String(value ?? '').trim().toLowerCase() || undefined)
  genre?: string;

  @IsOptional()
  @Transform(toInt)
  @IsInt()
  @Min(1900)
  @Max(2100)
  year?: number;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  @Transform(({ value }) => String(value ?? '').trim() || undefined)
  q?: string;

  @IsOptional()
  @IsIn(['newest', 'popular', 'rating', 'title'])
  sort?: 'newest' | 'popular' | 'rating' | 'title';

  @IsOptional()
  @Transform(toInt)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Transform(toInt)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;
}

export class SearchQueryDto {
  @IsString()
  @MaxLength(120)
  @Transform(({ value }) => String(value ?? '').trim())
  q!: string;

  @IsOptional()
  @Transform(toInt)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Transform(toInt)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;
}
