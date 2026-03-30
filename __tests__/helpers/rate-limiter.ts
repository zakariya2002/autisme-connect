/**
 * Extracted rate limiting logic from middleware.ts
 * Pure function for testing rate limiting behavior.
 */

export interface RateLimitEntry {
  count: number;
  resetAt: number;
}

export class RateLimiter {
  private store = new Map<string, RateLimitEntry>();

  isRateLimited(key: string, max: number, windowMs: number, now: number = Date.now()): boolean {
    const entry = this.store.get(key);

    if (!entry || now > entry.resetAt) {
      this.store.set(key, { count: 1, resetAt: now + windowMs });
      return false;
    }

    entry.count++;
    if (entry.count > max) {
      return true;
    }
    return false;
  }

  getEntry(key: string): RateLimitEntry | undefined {
    return this.store.get(key);
  }

  clear(): void {
    this.store.clear();
  }
}

/**
 * Routes that should be blocked in production.
 */
export const BLOCKED_ROUTES = [
  '/debug',
  '/api/debug',
  '/api/test-',
  '/api/dev/',
  '/api/run-siret-migration',
  '/api/send-certification-emails',
];

/**
 * Check if a route should be blocked in production.
 */
export function isBlockedRoute(pathname: string): boolean {
  return BLOCKED_ROUTES.some(route => pathname.startsWith(route));
}

/**
 * Admin route checking logic from middleware.
 */
export const ADMIN_ROUTES = ['/admin', '/api/admin'];
export const ADMIN_ALLOWED = ['/admin', '/auth/login', '/auth/callback', '/api'];

export function isAdminRoute(pathname: string): boolean {
  return ADMIN_ROUTES.some(route => pathname.startsWith(route));
}

export function isAdminAllowedRoute(pathname: string): boolean {
  return ADMIN_ALLOWED.some(path => pathname.startsWith(path));
}
