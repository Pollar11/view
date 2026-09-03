import { Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { AdminGuard } from './admin.guard';
import { IngestService } from './ingest.service';

@Controller('admin/ingest')
@UseGuards(AdminGuard)
export class IngestController {
  constructor(private readonly ingest: IngestService) {}

  /** Operator-triggered refresh. Returns the run summary (no source URLs). */
  @Post()
  @HttpCode(202)
  async trigger(): Promise<{ started: boolean; summary: unknown }> {
    const summary = await this.ingest.run();
    return { started: true, summary };
  }
}
