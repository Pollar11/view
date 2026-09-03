import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import configuration from './config/configuration';
import { validateEnv } from './config/env.validation';
import { PrismaModule } from './common/prisma/prisma.module';
import { CommonModule } from './common/common.module';
import { MediaModule } from './media/media.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ItemsModule } from './items/items.module';
import { InteractionsModule } from './interactions/interactions.module';
import { RecommendationsModule } from './recommendations/recommendations.module';
import { HomeModule } from './home/home.module';
import { SourcesModule } from './sources/sources.module';
import { IngestModule } from './ingest/ingest.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [configuration],
      validate: validateEnv,
    }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        ttl: (config.get<number>('cacheTtlSeconds') ?? 60) * 1000,
        max: 2000,
      }),
    }),
    PrismaModule,
    CommonModule,
    MediaModule,
    AuthModule,
    UsersModule,
    ItemsModule,
    InteractionsModule,
    RecommendationsModule,
    HomeModule,
    SourcesModule,
    IngestModule,
    HealthModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
