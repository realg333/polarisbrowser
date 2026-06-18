import type { FingerprintConfig } from '../types/profile';

/** Stable numeric seed from profile id for consistent per-profile noise. */
export function fingerprintSeed(profileId: string): number {
  let hash = 0;
  for (let i = 0; i < profileId.length; i++) {
    hash = (hash << 5) - hash + profileId.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) || 1;
}

export function generateInjectionScript(config: FingerprintConfig, seed: number): string {
  const payload = JSON.stringify({
    doNotTrack: config.doNotTrack ?? true,
    hardwareConcurrency: config.hardwareConcurrency ?? 8,
    deviceMemory: config.deviceMemory ?? 8,
    platform: config.platform ?? 'Win32',
    language: config.language ?? 'pt-BR',
    canvas: config.canvas ?? 'noise',
    webgl: config.webgl ?? 'noise',
    webglVendor: config.webglVendor ?? 'Google Inc. (NVIDIA)',
    webglRenderer:
      config.webglRenderer ??
      'ANGLE (NVIDIA, NVIDIA GeForce GTX 1060 6GB Direct3D11 vs_5_0 ps_5_0, D3D11)',
    audioContext: config.audioContext ?? 'noise',
    clientRects: config.clientRects ?? 'noise',
    geolocation: config.geolocation ?? { mode: 'block' },
    fonts: config.fonts ?? { mode: 'default' },
    mediaDevices: config.mediaDevices ?? 'fake',
    seed,
  });

  return `(() => {
  'use strict';
  const CFG = ${payload};

  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const rand = mulberry32(CFG.seed);

  try {
    if (CFG.doNotTrack) {
      Object.defineProperty(navigator, 'doNotTrack', { get: () => '1', configurable: true });
      Object.defineProperty(window, 'doNotTrack', { get: () => '1', configurable: true });
    }

    if (CFG.hardwareConcurrency) {
      Object.defineProperty(navigator, 'hardwareConcurrency', {
        get: () => CFG.hardwareConcurrency,
        configurable: true,
      });
    }

    if (CFG.deviceMemory) {
      Object.defineProperty(navigator, 'deviceMemory', {
        get: () => CFG.deviceMemory,
        configurable: true,
      });
    }

    if (CFG.platform) {
      Object.defineProperty(navigator, 'platform', { get: () => CFG.platform, configurable: true });
    }

    if (CFG.language) {
      Object.defineProperty(navigator, 'language', { get: () => CFG.language, configurable: true });
      Object.defineProperty(navigator, 'languages', {
        get: () => [CFG.language, CFG.language.split('-')[0]],
        configurable: true,
      });
    }

    // Canvas fingerprint
    if (CFG.canvas === 'noise' || CFG.canvas === 'block') {
      const patchCanvas = (proto) => {
        const origToDataURL = proto.toDataURL;
        const origToBlob = proto.toBlob;
        const origGetImageData = proto.getImageData
          ? CanvasRenderingContext2D.prototype.getImageData
          : null;

        if (CFG.canvas === 'block') {
          proto.toDataURL = function () { return 'data:,'; };
          proto.toBlob = function (cb) { if (cb) cb(new Blob()); };
          if (origGetImageData) {
            CanvasRenderingContext2D.prototype.getImageData = function () {
              const imageData = origGetImageData.apply(this, arguments);
              imageData.data.fill(0);
              return imageData;
            };
          }
        } else if (origToDataURL) {
          proto.toDataURL = function () {
            const ctx = this.getContext && this.getContext('2d');
            if (ctx) {
              const w = this.width; const h = this.height;
              if (w && h) {
                const imageData = ctx.getImageData(0, 0, w, h);
                for (let i = 0; i < imageData.data.length; i += 4) {
                  imageData.data[i] ^= Math.floor(rand() * 3);
                }
                ctx.putImageData(imageData, 0, 0);
              }
            }
            return origToDataURL.apply(this, arguments);
          };
        }
      };
      patchCanvas(HTMLCanvasElement.prototype);
    }

    // WebGL fingerprint
    if (CFG.webgl === 'noise' || CFG.webgl === 'mask') {
      const patchWebGL = (Proto) => {
        if (!Proto) return;
        const origGetParameter = Proto.getParameter;
        Proto.getParameter = function (param) {
          const ext = this.getExtension('WEBGL_debug_renderer_info');
          if (ext) {
            if (param === ext.UNMASKED_VENDOR_WEBGL) return CFG.webglVendor;
            if (param === ext.UNMASKED_RENDERER_WEBGL) return CFG.webglRenderer;
          }
          const result = origGetParameter.apply(this, arguments);
          if (CFG.webgl === 'noise' && typeof result === 'number') {
            return result + Math.floor(rand() * 2);
          }
          return result;
        };
      };
      patchWebGL(WebGLRenderingContext?.prototype);
      patchWebGL(WebGL2RenderingContext?.prototype);
    }

    // AudioContext fingerprint
    if (CFG.audioContext === 'noise' && window.AudioContext) {
      const OrigAudioContext = window.AudioContext;
      const PatchedAudioContext = function (...args) {
        const ctx = new OrigAudioContext(...args);
        const origCreateAnalyser = ctx.createAnalyser.bind(ctx);
        ctx.createAnalyser = function () {
          const analyser = origCreateAnalyser();
          const origGetFloatFrequencyData = analyser.getFloatFrequencyData.bind(analyser);
          analyser.getFloatFrequencyData = function (array) {
            origGetFloatFrequencyData(array);
            for (let i = 0; i < array.length; i++) array[i] += rand() * 0.0001;
          };
          return analyser;
        };
        return ctx;
      };
      PatchedAudioContext.prototype = OrigAudioContext.prototype;
      window.AudioContext = PatchedAudioContext;
      if (window.webkitAudioContext) window.webkitAudioContext = PatchedAudioContext;
    }

    // ClientRects noise
    if (CFG.clientRects === 'noise') {
      const origGetBoundingClientRect = Element.prototype.getBoundingClientRect;
      Element.prototype.getBoundingClientRect = function () {
        const rect = origGetBoundingClientRect.apply(this, arguments);
        const noise = rand() * 0.00001;
        return new DOMRect(rect.x + noise, rect.y + noise, rect.width, rect.height);
      };
    }

    // Geolocation
    if (CFG.geolocation && CFG.geolocation.mode !== 'real') {
      const geo = navigator.geolocation;
      if (geo) {
        if (CFG.geolocation.mode === 'block') {
          geo.getCurrentPosition = function (_s, e) {
            if (e) e({ code: 1, message: 'User denied Geolocation', PERMISSION_DENIED: 1 });
          };
          geo.watchPosition = function (_s, e) {
            if (e) e({ code: 1, message: 'User denied Geolocation', PERMISSION_DENIED: 1 });
            return 0;
          };
        } else if (CFG.geolocation.mode === 'allow') {
          const pos = {
            coords: {
              latitude: CFG.geolocation.lat ?? -23.5505,
              longitude: CFG.geolocation.lng ?? -46.6333,
              accuracy: CFG.geolocation.accuracy ?? 50,
              altitude: null, altitudeAccuracy: null, heading: null, speed: null,
            },
            timestamp: Date.now(),
          };
          geo.getCurrentPosition = function (s) { if (s) s(pos); };
          geo.watchPosition = function (s) { if (s) s(pos); return 1; };
        }
      }
    }

    // Media devices
    if (CFG.mediaDevices === 'fake' && navigator.mediaDevices) {
      const fakeDevices = [
        { deviceId: 'default', kind: 'audioinput', label: 'Microphone (Realtek Audio)', groupId: 'g1' },
        { deviceId: 'default', kind: 'audiooutput', label: 'Speakers (Realtek Audio)', groupId: 'g1' },
        { deviceId: 'cam1', kind: 'videoinput', label: 'HD Webcam', groupId: 'g2' },
      ];
      navigator.mediaDevices.enumerateDevices = async () => fakeDevices;
    } else if (CFG.mediaDevices === 'block' && navigator.mediaDevices) {
      navigator.mediaDevices.enumerateDevices = async () => [];
      navigator.mediaDevices.getUserMedia = async () => {
        throw new DOMException('Permission denied', 'NotAllowedError');
      };
    }

    // Custom fonts list
    if (CFG.fonts && CFG.fonts.mode === 'custom' && CFG.fonts.list && document.fonts) {
      const customFonts = new Set(CFG.fonts.list.map((f) => f.toLowerCase()));
      const origCheck = document.fonts.check.bind(document.fonts);
      document.fonts.check = function (font, text) {
        const family = String(font).match(/['"]?([^'"]+)['"]?/)?.[1]?.toLowerCase();
        if (family && customFonts.has(family)) return true;
        return origCheck(font, text);
      };
    }
  } catch (e) {
    console.warn('[Polaris Fingerprint]', e);
  }
})();`;
}
