import type { FingerprintConfig, Profile } from '../types/profile';
import type { GeoLookupResult } from '../types/proxy';

export interface GeoSyncPatch {
  timezone: string;
  language: string;
  locale: string;
  fingerprint: Partial<FingerprintConfig>;
}

/** Aplica resultado de geo lookup ao perfil (timezone, language, geolocation). */
export function buildGeoSyncPatch(geo: GeoLookupResult): GeoSyncPatch {
  return {
    timezone: geo.timezone,
    language: geo.language,
    locale: geo.locale,
    fingerprint: {
      timezone: geo.timezone,
      language: geo.language,
      geolocation: {
        mode: 'allow',
        lat: geo.lat,
        lng: geo.lon,
        accuracy: 100,
      },
      webrtc: 'forward',
    },
  };
}

export function mergeGeoIntoProfile(profile: Profile, geo: GeoLookupResult): Profile {
  const patch = buildGeoSyncPatch(geo);
  return {
    ...profile,
    timezone: patch.timezone,
    language: patch.language,
    locale: patch.locale,
    fingerprint: {
      ...profile.fingerprint,
      ...patch.fingerprint,
    },
  };
}
