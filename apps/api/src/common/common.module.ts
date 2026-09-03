import { Global, Module } from '@nestjs/common';
import { TextSanitizer } from './text/sanitize';

@Global()
@Module({
  providers: [TextSanitizer],
  exports: [TextSanitizer],
})
export class CommonModule {}
