import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import type { Item, Paginated } from '@view/shared';
import { ItemsService } from './items.service';
import { ItemQueryDto, SearchQueryDto } from './dto/item-query.dto';
import { CurrentUser, JwtAuthGuard, OptionalJwtAuthGuard } from '../auth/guards';
import type { AuthUser } from '../auth/jwt.strategy';
import { InteractionsService } from '../interactions/interactions.service';

@Controller()
export class ItemsController {
  constructor(
    private readonly items: ItemsService,
    private readonly interactions: InteractionsService,
  ) {}

  @Get('items')
  @UseGuards(OptionalJwtAuthGuard)
  list(@Query() query: ItemQueryDto): Promise<Paginated<Item>> {
    return this.items.list(query);
  }

  @Get('search')
  search(@Query() query: SearchQueryDto): Promise<Paginated<Item>> {
    return this.items.search(query.q, query.page, query.limit);
  }

  @Get('items/upcoming')
  upcoming(): Promise<Item[]> {
    return this.items.upcomingSports();
  }

  @Get('items/:idOrSlug')
  @UseGuards(OptionalJwtAuthGuard)
  async detail(
    @Param('idOrSlug') idOrSlug: string,
    @CurrentUser() user: AuthUser | undefined,
  ): Promise<Item> {
    const item = await this.items.getByIdOrSlug(idOrSlug);
    // Passive view logging for signed-in users powers recommendations.
    if (user) void this.interactions.logView(user.id, item.id);
    return item;
  }

  /**
   * Returns the upstream page URL for the "Watch" button — auth required so it
   * is never exposed to anonymous clients or crawlers, and returned only at the
   * moment the user clicks.
   */
  @Get('items/:idOrSlug/source')
  @UseGuards(JwtAuthGuard)
  async source(@Param('idOrSlug') idOrSlug: string): Promise<{ url: string }> {
    return { url: await this.items.resolveSourceUrl(idOrSlug) };
  }
}
