import type { GeoLookupResult } from '../types/proxy';

/** Mapeamento país → locale quando API não retorna idioma. */
const COUNTRY_LOCALE: Record<string, { language: string; locale: string }> = {
  US: { language: 'en-US', locale: 'en-US' },
  GB: { language: 'en-GB', locale: 'en-GB' },
  BR: { language: 'pt-BR', locale: 'pt-BR' },
  PT: { language: 'pt-PT', locale: 'pt-PT' },
  DE: { language: 'de-DE', locale: 'de-DE' },
  FR: { language: 'fr-FR', locale: 'fr-FR' },
  ES: { language: 'es-ES', locale: 'es-ES' },
  IT: { language: 'it-IT', locale: 'it-IT' },
  NL: { language: 'nl-NL', locale: 'nl-NL' },
  CA: { language: 'en-CA', locale: 'en-CA' },
  MX: { language: 'es-MX', locale: 'es-MX' },
  AR: { language: 'es-AR', locale: 'es-AR' },
  JP: { language: 'ja-JP', locale: 'ja-JP' },
  KR: { language: 'ko-KR', locale: 'ko-KR' },
  CN: { language: 'zh-CN', locale: 'zh-CN' },
  IN: { language: 'en-IN', locale: 'en-IN' },
  AU: { language: 'en-AU', locale: 'en-AU' },
  RU: { language: 'ru-RU', locale: 'ru-RU' },
  PL: { language: 'pl-PL', locale: 'pl-PL' },
  TR: { language: 'tr-TR', locale: 'tr-TR' },
};

const COUNTRY_TIMEZONE: Record<string, string> = {
  US: 'America/New_York',
  GB: 'Europe/London',
  BR: 'America/Sao_Paulo',
  PT: 'Europe/Lisbon',
  DE: 'Europe/Berlin',
  FR: 'Europe/Paris',
  ES: 'Europe/Madrid',
  IT: 'Europe/Rome',
  NL: 'Europe/Amsterdam',
  CA: 'America/Toronto',
  MX: 'America/Mexico_City',
  AR: 'America/Argentina/Buenos_Aires',
  JP: 'Asia/Tokyo',
  KR: 'Asia/Seoul',
  CN: 'Asia/Shanghai',
  IN: 'Asia/Kolkata',
  AU: 'Australia/Sydney',
  RU: 'Europe/Moscow',
  PL: 'Europe/Warsaw',
  TR: 'Europe/Istanbul',
};

const COUNTRY_COORDS: Record<string, { lat: number; lon: number }> = {
  US: { lat: 40.7128, lon: -74.006 },
  GB: { lat: 51.5074, lon: -0.1278 },
  BR: { lat: -23.5505, lon: -46.6333 },
  PT: { lat: 38.7223, lon: -9.1393 },
  DE: { lat: 52.52, lon: 13.405 },
  FR: { lat: 48.8566, lon: 2.3522 },
  ES: { lat: 40.4168, lon: -3.7038 },
  IT: { lat: 41.9028, lon: 12.4964 },
  NL: { lat: 52.3676, lon: 4.9041 },
  CA: { lat: 43.6532, lon: -79.3832 },
  MX: { lat: 19.4326, lon: -99.1332 },
  AR: { lat: -34.6037, lon: -58.3816 },
  JP: { lat: 35.6762, lon: 139.6503 },
  KR: { lat: 37.5665, lon: 126.978 },
  CN: { lat: 31.2304, lon: 121.4737 },
  IN: { lat: 28.6139, lon: 77.209 },
  AU: { lat: -33.8688, lon: 151.2093 },
  RU: { lat: 55.7558, lon: 37.6173 },
  PL: { lat: 52.2297, lon: 21.0122 },
  TR: { lat: 41.0082, lon: 28.9784 },
};

function localeFromCountry(countryCode: string): { language: string; locale: string } {
  return COUNTRY_LOCALE[countryCode] ?? { language: 'en-US', locale: 'en-US' };
}

export function geoFromCountryCode(countryCode: string): GeoLookupResult {
  const code = countryCode.toUpperCase();
  const { language, locale } = localeFromCountry(code);
  const coords = COUNTRY_COORDS[code] ?? { lat: 0, lon: 0 };
  return {
    ip: '',
    country: code,
    countryCode: code,
    timezone: COUNTRY_TIMEZONE[code] ?? 'UTC',
    language,
    locale,
    lat: coords.lat,
    lon: coords.lon,
  };
}

interface IpApiResponse {
  status: string;
  country?: string;
  countryCode?: string;
  timezone?: string;
  lat?: number;
  lon?: number;
  query?: string;
}

/** Parse resposta ip-api.com (ou compatível). */
export function parseIpApiResponse(data: IpApiResponse): GeoLookupResult | null {
  if (data.status !== 'success' || !data.countryCode) return null;
  const { language, locale } = localeFromCountry(data.countryCode);
  return {
    ip: data.query ?? '',
    country: data.country ?? data.countryCode,
    countryCode: data.countryCode,
    timezone: data.timezone ?? COUNTRY_TIMEZONE[data.countryCode] ?? 'UTC',
    language,
    locale,
    lat: data.lat ?? COUNTRY_COORDS[data.countryCode]?.lat ?? 0,
    lon: data.lon ?? COUNTRY_COORDS[data.countryCode]?.lon ?? 0,
  };
}

export function buildProxyUrl(
  proxy: Pick<import('../types/proxy').ProxyConfig, 'type' | 'host' | 'port' | 'username' | 'password'>,
): string {
  const scheme = proxy.type === 'socks5' ? 'socks5' : 'http';
  const auth =
    proxy.username && proxy.password
      ? `${encodeURIComponent(proxy.username)}:${encodeURIComponent(proxy.password)}@`
      : '';
  return `${scheme}://${auth}${proxy.host}:${proxy.port}`;
}

export function formatProxyServerArg(
  proxy: Pick<import('../types/proxy').ProxyConfig, 'type' | 'host' | 'port' | 'username' | 'password'>,
): string {
  return buildProxyUrl(proxy).replace(/^https?:\/\//, proxy.type === 'socks5' ? 'socks5://' : 'http://');
}
