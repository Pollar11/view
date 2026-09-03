import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import type { PublicUser } from '@view/shared';
import { CurrentUser, JwtAuthGuard } from '../auth/guards';
import type { AuthUser } from '../auth/jwt.strategy';
import { UsersService } from './users.service';
import { UpdatePreferencesDto, UpdateProfileDto } from './dto/preferences.dto';

@Controller('users/me')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  me(@CurrentUser() user: AuthUser): Promise<PublicUser> {
    return this.users.getPublicUser(user.id);
  }

  @Patch()
  updateProfile(
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateProfileDto,
  ): Promise<PublicUser> {
    return this.users.updateProfile(user.id, dto);
  }

  @Patch('preferences')
  updatePreferences(
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdatePreferencesDto,
  ): Promise<PublicUser> {
    return this.users.updatePreferences(user.id, dto);
  }
}
