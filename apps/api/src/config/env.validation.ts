import { Logger } from '@nestjs/common';

/**
 * Light-touch env validation. We do not hard-fail on missing source URLs —
 * the API is designed to boot and serve its (possibly empty) catalogue so the
 * app and tests can run before the operator wires real sources in.
 */
export function validateEnv(env: Record<string, unknown>): Record<string, unknown> {
  const log = new Logger('Config');
  const isProd = env.NODE_ENV === 'production';

  const weakSecret = (v: unknown) => !v || String(v).length < 24 || String(v).includes('change-me');
  if (isProd && (weakSecret(env.JWT_ACCESS_SECRET) || weakSecret(env.JWT_REFRESH_SECRET))) {
    throw new Error(
      'JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must each be set to a strong (24+ char) value in production.',
    );
  }
  if (!isProd && (weakSecret(env.JWT_ACCESS_SECRET) || weakSecret(env.JWT_REFRESH_SECRET))) {
    log.warn('Using development JWT secrets. Set JWT_ACCESS_SECRET / JWT_REFRESH_SECRET before deploying.');
  }

  const configured = [1, 2, 3].filter((i) => env[`SOURCE_${i}_URL`]);
  if (configured.length === 0) {
    log.warn('No SOURCE_n_URL configured — the API will serve demo data via the seed script.');
  } else {
    for (const i of configured) {
      try {
        // eslint-disable-next-line no-new
        new URL(String(env[`SOURCE_${i}_URL`]));
      } catch {
        throw new Error(`SOURCE_${i}_URL is not a valid URL.`);
      }
    }
    log.log(`${configured.length} content source(s) configured.`);
  }

  if (!env.DATABASE_URL) {
    env.DATABASE_URL = 'file:./dev.db';
    log.warn('DATABASE_URL not set — defaulting to SQLite file:./dev.db');
  }

  return env;
}
