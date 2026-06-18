import { join } from 'path';
import { writeFileSync } from 'fs';
import type { BrowserEngine, FingerprintConfig, Profile } from '@polaris/shared';

export interface EngineLaunchConfig {
  chromiumArgs: string[];
  engineArgs: string[];
  env: Record<string, string>;
}

/**
 * Maps fingerprint config to Chromium flags and engine-specific parameters.
 * SunBrowser/Flower read polaris-fingerprint.json from the profile data dir when available.
 */
export class EngineFingerprintBridge {
  build(profile: Profile, profileDir: string): EngineLaunchConfig {
    const fp = profile.fingerprint;
    const chromiumArgs: string[] = [];
    const engineArgs: string[] = [];
    const env: Record<string, string> = {};

    this.writeEngineConfig(profile, profileDir);

    // Locale / timezone
    if (profile.language) {
      chromiumArgs.push(`--lang=${profile.language}`);
    }
    if (profile.timezone) {
      chromiumArgs.push(`--timezone=${profile.timezone}`);
      env.TZ = profile.timezone;
    }

    // WebRTC
    switch (fp.webrtc) {
      case 'disabled':
        chromiumArgs.push('--disable-webrtc');
        break;
      case 'fake':
      case 'forward':
        chromiumArgs.push('--force-webrtc-ip-handling-policy=disable_non_proxied_udp');
        chromiumArgs.push('--webrtc-ip-handling-policy=disable_non_proxied_udp');
        break;
      default:
        break;
    }

    if (fp.portScanProtection) {
      chromiumArgs.push('--disable-features=WebRtcHideLocalIpsWithMdns');
    }

    if (fp.doNotTrack) {
      chromiumArgs.push('--enable-do-not-track');
    }

    chromiumArgs.push('--disable-blink-features=AutomationControlled');

    // Engine-native integration
    const configPath = join(profileDir, 'polaris-fingerprint.json');
    switch (profile.browserEngine) {
      case 'sunbrowser':
        engineArgs.push(`--polaris-fingerprint=${configPath}`);
        env.POLARIS_FINGERPRINT_CONFIG = configPath;
        env.SUNBROWSER_FINGERPRINT = configPath;
        break;
      case 'flowerbrowser':
        engineArgs.push(`--polaris-fingerprint=${configPath}`);
        env.POLARIS_FINGERPRINT_CONFIG = configPath;
        env.FLOWER_FINGERPRINT = configPath;
        break;
      default:
        break;
    }

    return { chromiumArgs, engineArgs, env };
  }

  private writeEngineConfig(profile: Profile, profileDir: string): void {
    const fp = profile.fingerprint;
    const payload = {
      version: 1,
      engine: profile.browserEngine,
      profileId: profile.id,
      userAgent: fp.userAgent,
      os: fp.os,
      osVersion: fp.osVersion,
      browserVersion: fp.browserVersion,
      screen: { width: fp.screenWidth, height: fp.screenHeight },
      webrtc: fp.webrtc,
      doNotTrack: fp.doNotTrack,
      canvas: fp.canvas,
      webgl: { mode: fp.webgl, vendor: fp.webglVendor, renderer: fp.webglRenderer },
      audioContext: fp.audioContext,
      hardware: {
        concurrency: fp.hardwareConcurrency,
        memory: fp.deviceMemory,
        platform: fp.platform,
      },
      geolocation: fp.geolocation,
      fonts: fp.fonts,
      mediaDevices: fp.mediaDevices,
      timezone: profile.timezone,
      language: profile.language,
      locale: profile.locale,
    };

    writeFileSync(join(profileDir, 'polaris-fingerprint.json'), JSON.stringify(payload, null, 2), 'utf-8');
  }
}

export const engineFingerprintBridge = new EngineFingerprintBridge();
