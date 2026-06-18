export type ProxyType = 'http' | 'socks5';

export interface ProxyConfig {
  enabled: boolean;
  type: ProxyType;
  host: string;
  port: number;
  username?: string;
  password?: string;
  /** ISO 3166-1 alpha-2 — usado como fallback se lookup de IP falhar */
  country?: string;
}

export interface GeoLookupResult {
  ip: string;
  country: string;
  countryCode: string;
  timezone: string;
  language: string;
  locale: string;
  lat: number;
  lon: number;
}
