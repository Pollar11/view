/**
 * One-shot ingest from the CLI (no HTTP server):
 *
 *   npm run ingest            (from apps/api)
 *
 * Reads SOURCE_n_URL from the environment, pulls + sanitises metadata, and
 * writes it to the database. Prints a summary with NO source URLs.
 */
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from '../app.module';
import { IngestService } from '../ingest/ingest.service';

async function run(): Promise<void> {
  const logger = new Logger('ingest-cli');
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn', 'log'] });
  try {
    const summary = await app.get(IngestService).run();
    logger.log(JSON.stringify(summary, null, 2));
  } finally {
    await app.close();
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
