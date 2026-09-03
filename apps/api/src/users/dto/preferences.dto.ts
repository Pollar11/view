import { IsArray, IsBoolean, IsIn, IsOptional, IsString, ArrayMaxSize } from 'class-validator';
import { CATEGORIES } from '@view/shared';

export class UpdatePreferencesDto {
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(3)
  @IsIn(CATEGORIES as unknown as string[], { each: true })
  favoriteCategories?: string[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  favoriteGenres?: string[];

  @IsOptional()
  @IsBoolean()
  matchNotifications?: boolean;
}

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  displayName?: string;
}
