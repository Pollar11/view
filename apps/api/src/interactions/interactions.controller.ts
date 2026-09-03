import { Body, Controller, Get, HttpCode, Post, Query, UseGuards } from '@nestjs/common';
import type { Interaction, Item } from '@view/shared';
import { CurrentUser, JwtAuthGuard } from '../auth/guards';
import type { AuthUser } from '../auth/jwt.strategy';
import { InteractionsService } from './interactions.service';
import { CreateInteractionDto, HistoryQueryDto } from './dto/interaction.dto';

@Controller('interactions')
@UseGuards(JwtAuthGuard)
export class InteractionsController {
  constructor(private readonly interactions: InteractionsService) {}

  @Post()
  @HttpCode(201)
  record(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateInteractionDto,
  ): Promise<Interaction> {
    return this.interactions.record(user.id, dto);
  }

  @Get('favorites')
  favorites(@CurrentUser() user: AuthUser): Promise<Item[]> {
    return this.interactions.favorites(user.id);
  }

  @Get('history')
  history(
    @CurrentUser() user: AuthUser,
    @Query() query: HistoryQueryDto,
  ): Promise<(Interaction & { item: Item })[]> {
    return this.interactions.history(user.id, query.type);
  }
}
