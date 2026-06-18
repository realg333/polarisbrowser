import { execFile } from 'child_process';
import { promisify } from 'util';
import type { GeoLookupResult, ProxyConfig } from '@polaris/shared';
import { buildProxyUrl, geoFromCountryCode, parseIpApiResponse } from '@polaris/shared';

const execFileAsync = promisify(execFile);

const IP_API_FIELDS = 'status,country,countryCode,timezone,lat,lon,query';
const IP_API_URL = `http://ip-api.com/json/?fields=${IP_API_FIELDS}`;

export class ProxyGeoService {
  /** Resolve geo pelo IP de saída do proxy. */
  async resolveFromProxy(proxy: ProxyConfig): Promise<GeoLookupResult> {
    if (!proxy.enabled || !proxy.host) {
      throw new Error('Proxy não configurado');
    }

    try {
      const proxyUrl = buildProxyUrl(proxy);
      const { stdout } = await execFileAsync(
        'curl',
        ['-s', '--max-time', '20', '-x', proxyUrl, IP_API_URL],
        { windowsHide: true },
      );
      const data = JSON.parse(stdout) as Parameters<typeof parseIpApiResponse>[0];
      const parsed = parseIpApiResponse(data);
      if (parsed) return parsed;
    } catch {
      // fallback abaixo
    }

    if (proxy.country) {
      return geoFromCountryCode(proxy.country);
    }

    throw new Error(
      'Não foi possível resolver geo do proxy. Verifique host/porta ou defina o país.',
    );
  }

  /** Resolve geo a partir de um IP público (sem proxy). */
  async resolveFromIp(ip: string): Promise<GeoLookupResult> {
    const { stdout } = await execFileAsync(
      'curl',
      ['-s', '--max-time', '15', `http://ip-api.com/json/${ip}?fields=${IP_API_FIELDS}`],
      { windowsHide: true },
    );
    const data = JSON.parse(stdout) as Parameters<typeof parseIpApiResponse>[0];
    const parsed = parseIpApiResponse(data);
    if (!parsed) throw new Error('IP não encontrado');
    return parsed;
  }
}

export const proxyGeoService = new ProxyGeoService();
