import { Controller, Get, UseGuards } from '@nestjs/common';
import type { HomeFeed } from '@view/shared';
import { CurrentUser, OptionalJwtAuthGuard } from '../auth/guards';
import type { AuthUser } from '../auth/jwt.strategy';
import { HomeService } from './home.service';

@Controller('home')
export class HomeController {
  constructor(private readonly home: HomeService) {}

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  feed(@CurrentUser() user: AuthUser | undefined): Promise<HomeFeed> {
    return this.home.feed(user?.id);
  }
}
