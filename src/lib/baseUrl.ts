const LOCAL = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/?$/i;

export function apiBaseUrl(): string {
  const configurada = import.meta.env.VITE_API_URL as string | undefined;
  if (configurada && !LOCAL.test(configurada)) {
    return configurada.replace(/\/$/, "");
  }

  const { protocol, hostname } = window.location;
  return `${protocol}//${hostname}:3000`;
}
