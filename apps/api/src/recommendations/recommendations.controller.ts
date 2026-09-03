import { Controller, DefaultValuePipe, Get, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import type { Recommendation } from '@view/shared';
import { CurrentUser, JwtAuthGuard } from '../auth/guards';
import type { AuthUser } from '../auth/jwt.strategy';
import { RecommendationsService } from './recommendations.service';

@Controller('recommendations')
@UseGuards(JwtAuthGuard)
export class RecommendationsController {
  constructor(private readonly reco: RecommendationsService) {}

  @Get()
  forMe(
    @CurrentUser() user: AuthUser,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ): Promise<Recommendation[]> {
    return this.reco.forUser(user.id, Math.min(Math.max(limit, 1), 40));
  }
}
