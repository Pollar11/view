import { Module } from '@nestjs/common';
import { SourceRegistry } from './source-registry';

@Module({
  providers: [SourceRegistry],
  exports: [SourceRegistry],
})
export class SourcesModule {}
