import { Module } from '@nestjs/common';
import { IngestController } from './ingest.controller';
import { IngestService } from './ingest.service';
import { AdminGuard } from './admin.guard';
import { SourcesModule } from '../sources/sources.module';

@Module({
  imports: [SourcesModule],
  controllers: [IngestController],
  providers: [IngestService, AdminGuard],
  exports: [IngestService],
})
export class IngestModule {}
