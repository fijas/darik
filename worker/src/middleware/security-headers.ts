/**
 * Security Headers Middleware
 * Adds security-related HTTP headers to all responses
 */

import type { Context, Next } from 'hono';

/**
 * Security headers middleware
 * Adds recommended security headers to protect against common attacks
 */
export async function securityHeaders(c: Context, next: Next) {
  await next();

  // Content Security Policy
  // Restricts sources of content to prevent XSS attacks
  c.header(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Next.js requires unsafe-eval in dev
      "style-src 'self' 'unsafe-inline'", // Tailwind requires unsafe-inline
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://*.darik-finance.pages.dev https://*.workers.dev",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ')
  );

  // Prevent clickjacking attacks
  c.header('X-Frame-Options', 'DENY');

  // Prevent MIME type sniffing
  c.header('X-Content-Type-Options', 'nosniff');

  // Enable browser XSS protection
  c.header('X-XSS-Protection', '1; mode=block');

  // Referrer policy - don't send origin on cross-origin requests
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions policy - disable unnecessary features
  c.header(
    'Permissions-Policy',
    [
      'camera=()',
      'microphone=(self)', // Allow for voice input
      'geolocation=(self)', // Allow for location tracking
      'payment=()',
      'usb=()',
      'magnetometer=()',
      'gyroscope=()',
      'accelerometer=()',
    ].join(', ')
  );

  // HSTS - Force HTTPS (only in production)
  if (c.env?.ENVIRONMENT === 'production') {
    c.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
}