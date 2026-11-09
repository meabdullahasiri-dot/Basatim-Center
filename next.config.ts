import type { NextConfig } from 'next';

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
];

const PRIVATE = ['/dashboard', '/invoices/:p*', '/agreements/:p*', '/finance', '/bookings', '/team', '/users', '/settings', '/print/:p*', '/login', '/setup'];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  serverExternalPackages: ['@node-rs/argon2', 'pg'],
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      // صفحات النظام لا تُفهرس في محركات البحث
      ...PRIVATE.map((source) => ({ source, headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] })),
    ];
  },
};

export default nextConfig;
