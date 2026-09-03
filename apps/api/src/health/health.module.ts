import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { IngestModule } from '../ingest/ingest.module';

@Module({
  imports: [IngestModule],
  controllers: [HealthController],
})
export class HealthModule {}
