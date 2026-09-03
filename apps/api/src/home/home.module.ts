import { Module } from '@nestjs/common';
import { HomeController } from './home.controller';
import { HomeService } from './home.service';
import { RecommendationsModule } from '../recommendations/recommendations.module';

@Module({
  imports: [RecommendationsModule],
  controllers: [HomeController],
  providers: [HomeService],
})
export class HomeModule {}
