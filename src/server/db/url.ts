/**
 * Database URLs for anything outside this machine always use TLS with a
 * verified certificate: a URL without `sslmode` would otherwise connect in
 * plain text. Local development and test databases are left as they are.
 */
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1', '[::1]']);

export function withRequiredTls(connectionString: string): string {
  let url: URL;
  try {
    url = new URL(connectionString);
  } catch {
    return connectionString;
  }
  if (LOCAL_HOSTS.has(url.hostname) || url.hostname.endsWith('.local')) return connectionString;
  const mode = url.searchParams.get('sslmode');
  if (mode === 'disable' || mode === 'allow' || mode === 'prefer' || !mode) url.searchParams.set('sslmode', 'verify-full');
  return url.toString();
}
