import type { FingerprintOS } from '../types/profile';

export interface FingerprintPresetTemplate {
  id: string;
  os: FingerprintOS;
  label: string;
  osVersion: string;
  browserVersion: string;
  userAgent: string;
  screenWidth: number;
  screenHeight: number;
  hardwareConcurrency: number;
  deviceMemory: number;
  platform: string;
  webglVendor: string;
  webglRenderer: string;
  fonts: string[];
}

const V149 = '149.0.7827.102';
const V148 = '148.0.7743.82';
const V147 = '147.0.7670.95';
const V150 = '150.0.7900.60';
const V146 = '146.0.7595.94';

const WIN_FONTS = [
  'Arial',
  'Calibri',
  'Cambria',
  'Consolas',
  'Segoe UI',
  'Tahoma',
  'Times New Roman',
  'Verdana',
] as const;

const MAC_FONTS = ['Arial', 'Helvetica', 'Helvetica Neue', 'Menlo', 'Monaco', 'SF Pro Text', 'Times'] as const;

const ANDROID_FONTS = ['Roboto', 'Noto Sans', 'Droid Sans'] as const;

const IOS_FONTS = ['Helvetica', 'Helvetica Neue', 'SF Pro Text', 'Times'] as const;

function winUa(version: string): string {
  return `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${version} Safari/537.36`;
}

function macUa(version: string): string {
  return `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${version} Safari/537.36`;
}

function androidUa(version: string, android: string, model: string): string {
  return `Mozilla/5.0 (Linux; Android ${android}; ${model}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${version} Mobile Safari/537.36`;
}

function iosUa(osVersion: string, device: 'iPhone' | 'iPad'): string {
  const os = osVersion.replace('.', '_');
  return `Mozilla/5.0 (${device}; CPU ${device} OS ${os} like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/${osVersion.split('.')[0]}.0 Mobile/15E148 Safari/604.1`;
}

function win(
  id: string,
  label: string,
  osVersion: '10' | '11',
  browserVersion: string,
  screen: [number, number],
  cores: number,
  memory: number,
  webgl: { vendor: string; renderer: string },
): FingerprintPresetTemplate {
  return {
    id,
    os: 'windows',
    label,
    osVersion,
    browserVersion,
    userAgent: winUa(browserVersion),
    screenWidth: screen[0],
    screenHeight: screen[1],
    hardwareConcurrency: cores,
    deviceMemory: memory,
    platform: 'Win32',
    webglVendor: webgl.vendor,
    webglRenderer: webgl.renderer,
    fonts: [...WIN_FONTS],
  };
}

function mac(
  id: string,
  label: string,
  osVersion: string,
  browserVersion: string,
  screen: [number, number],
  cores: number,
  memory: number,
  webgl: { vendor: string; renderer: string },
): FingerprintPresetTemplate {
  return {
    id,
    os: 'macos',
    label,
    osVersion,
    browserVersion,
    userAgent: macUa(browserVersion),
    screenWidth: screen[0],
    screenHeight: screen[1],
    hardwareConcurrency: cores,
    deviceMemory: memory,
    platform: 'MacIntel',
    webglVendor: webgl.vendor,
    webglRenderer: webgl.renderer,
    fonts: [...MAC_FONTS],
  };
}

function android(
  id: string,
  label: string,
  osVersion: string,
  browserVersion: string,
  model: string,
  screen: [number, number],
  cores: number,
  memory: number,
  renderer: string,
  fonts: string[] = [...ANDROID_FONTS],
): FingerprintPresetTemplate {
  return {
    id,
    os: 'android',
    label,
    osVersion,
    browserVersion,
    userAgent: androidUa(browserVersion, osVersion, model),
    screenWidth: screen[0],
    screenHeight: screen[1],
    hardwareConcurrency: cores,
    deviceMemory: memory,
    platform: 'Linux armv8l',
    webglVendor: 'Qualcomm',
    webglRenderer: renderer,
    fonts,
  };
}

function ios(
  id: string,
  label: string,
  osVersion: string,
  device: 'iPhone' | 'iPad',
  screen: [number, number],
  cores: number,
  memory: number,
  fonts: string[] = [...IOS_FONTS],
): FingerprintPresetTemplate {
  return {
    id,
    os: 'ios',
    label,
    osVersion,
    browserVersion: osVersion.split('.')[0] ?? osVersion,
    userAgent: iosUa(osVersion, device),
    screenWidth: screen[0],
    screenHeight: screen[1],
    hardwareConcurrency: cores,
    deviceMemory: memory,
    platform: device,
    webglVendor: 'Apple Inc.',
    webglRenderer: 'Apple GPU',
    fonts,
  };
}

const NVIDIA_1060 = {
  vendor: 'Google Inc. (NVIDIA)',
  renderer: 'ANGLE (NVIDIA, NVIDIA GeForce GTX 1060 6GB Direct3D11 vs_5_0 ps_5_0, D3D11)',
};
const NVIDIA_1660 = {
  vendor: 'Google Inc. (NVIDIA)',
  renderer: 'ANGLE (NVIDIA, NVIDIA GeForce GTX 1660 SUPER Direct3D11 vs_5_0 ps_5_0, D3D11)',
};
const NVIDIA_2070 = {
  vendor: 'Google Inc. (NVIDIA)',
  renderer: 'ANGLE (NVIDIA, NVIDIA GeForce RTX 2070 SUPER Direct3D11 vs_5_0 ps_5_0, D3D11)',
};
const NVIDIA_3060 = {
  vendor: 'Google Inc. (NVIDIA)',
  renderer: 'ANGLE (NVIDIA, NVIDIA GeForce RTX 3060 Direct3D11 vs_5_0 ps_5_0, D3D11)',
};
const NVIDIA_4060 = {
  vendor: 'Google Inc. (NVIDIA)',
  renderer: 'ANGLE (NVIDIA, NVIDIA GeForce RTX 4060 Direct3D11 vs_5_0 ps_5_0, D3D11)',
};
const INTEL_UHD630 = {
  vendor: 'Google Inc. (Intel)',
  renderer: 'ANGLE (Intel, Intel(R) UHD Graphics 630 Direct3D11 vs_5_0 ps_5_0, D3D11)',
};
const INTEL_IRIS_XE = {
  vendor: 'Google Inc. (Intel)',
  renderer: 'ANGLE (Intel, Intel(R) Iris(R) Xe Graphics Direct3D11 vs_5_0 ps_5_0, D3D11)',
};
const INTEL_HD620 = {
  vendor: 'Google Inc. (Intel)',
  renderer: 'ANGLE (Intel, Intel(R) HD Graphics 620 Direct3D11 vs_5_0 ps_5_0, D3D11)',
};
const AMD_RADEON = {
  vendor: 'Google Inc. (AMD)',
  renderer: 'ANGLE (AMD, AMD Radeon(TM) Graphics Direct3D11 vs_5_0 ps_5_0, D3D11)',
};
const AMD_RX580 = {
  vendor: 'Google Inc. (AMD)',
  renderer: 'ANGLE (AMD, AMD Radeon RX 580 Series Direct3D11 vs_5_0 ps_5_0, D3D11)',
};

/** 52+ agentes coerentes — UA, GPU, resolução e hardware alinhados por OS. */
export const FINGERPRINT_PRESET_LIBRARY: FingerprintPresetTemplate[] = [
  // Windows 10 (12)
  win('win10-fhd-nvidia', 'Windows 10 · Full HD · GTX 1060', '10', V149, [1920, 1080], 8, 8, NVIDIA_1060),
  win('win10-qhd-intel', 'Windows 10 · QHD · Intel UHD 630', '10', V148, [2560, 1440], 12, 16, INTEL_UHD630),
  win('win10-laptop-amd', 'Windows 10 · Laptop · AMD Radeon', '10', V147, [1366, 768], 6, 8, AMD_RADEON),
  win('win10-hd-intel', 'Windows 10 · HD · Intel HD 620', '10', V146, [1366, 768], 4, 4, INTEL_HD620),
  win('win10-fhd-1660', 'Windows 10 · Full HD · GTX 1660', '10', V149, [1920, 1080], 6, 8, NVIDIA_1660),
  win('win10-qhd-rtx2070', 'Windows 10 · QHD · RTX 2070', '10', V148, [2560, 1440], 8, 16, NVIDIA_2070),
  win('win10-wxga-amd', 'Windows 10 · WXGA+ · AMD RX 580', '10', V147, [1600, 900], 8, 8, AMD_RX580),
  win('win10-fhd-iris', 'Windows 10 · Full HD · Iris Xe', '10', V149, [1920, 1080], 8, 8, INTEL_IRIS_XE),
  win('win10-4k-rtx3060', 'Windows 10 · 4K · RTX 3060', '10', V150, [3840, 2160], 12, 16, NVIDIA_3060),
  win('win10-fhd-uhd', 'Windows 10 · Full HD · UHD 630 office', '10', V148, [1920, 1080], 4, 8, INTEL_UHD630),
  win('win10-ultrawide-nvidia', 'Windows 10 · Ultrawide · GTX 1060', '10', V149, [2560, 1080], 8, 16, NVIDIA_1060),
  win('win10-laptop-iris', 'Windows 10 · Laptop · Iris Xe', '10', V147, [1920, 1080], 8, 8, INTEL_IRIS_XE),

  // Windows 11 (12)
  win('win11-fhd-rtx3060', 'Windows 11 · Full HD · RTX 3060', '11', V149, [1920, 1080], 16, 16, NVIDIA_3060),
  win('win11-4k-iris', 'Windows 11 · 4K · Iris Xe', '11', V150, [3840, 2160], 8, 16, INTEL_IRIS_XE),
  win('win11-qhd-rtx4060', 'Windows 11 · QHD · RTX 4060', '11', V149, [2560, 1440], 12, 16, NVIDIA_4060),
  win('win11-fhd-amd', 'Windows 11 · Full HD · AMD Radeon', '11', V148, [1920, 1080], 8, 8, AMD_RADEON),
  win('win11-laptop-uhd', 'Windows 11 · Laptop · UHD 630', '11', V147, [1366, 768], 6, 8, INTEL_UHD630),
  win('win11-fhd-1660', 'Windows 11 · Full HD · GTX 1660', '11', V149, [1920, 1080], 6, 8, NVIDIA_1660),
  win('win11-ultrawide-rtx', 'Windows 11 · Ultrawide · RTX 3060', '11', V150, [3440, 1440], 16, 32, NVIDIA_3060),
  win('win11-hd-intel', 'Windows 11 · HD · Intel HD 620', '11', V146, [1366, 768], 4, 4, INTEL_HD620),
  win('win11-qhd-nvidia', 'Windows 11 · QHD · GTX 1060', '11', V148, [2560, 1440], 8, 16, NVIDIA_1060),
  win('win11-4k-rtx4060', 'Windows 11 · 4K · RTX 4060', '11', V149, [3840, 2160], 16, 32, NVIDIA_4060),
  win('win11-fhd-rx580', 'Windows 11 · Full HD · RX 580', '11', V147, [1920, 1080], 8, 8, AMD_RX580),
  win('win11-wxga-iris', 'Windows 11 · WXGA+ · Iris Xe', '11', V149, [1600, 900], 8, 8, INTEL_IRIS_XE),

  // macOS (10)
  mac('macos-m1-air', 'macOS Sonoma · MacBook Air M1', '14.0', V149, [1440, 900], 8, 8, {
    vendor: 'Apple Inc.',
    renderer: 'Apple M1',
  }),
  mac('macos-m2-pro', 'macOS Sonoma · MacBook Pro M2', '14.0', V149, [1512, 982], 10, 16, {
    vendor: 'Apple Inc.',
    renderer: 'Apple M2',
  }),
  mac('macos-m3-air', 'macOS Sequoia · MacBook Air M3', '15.0', V150, [1470, 956], 8, 8, {
    vendor: 'Apple Inc.',
    renderer: 'Apple M3',
  }),
  mac('macos-intel-ventura', 'macOS Ventura · MacBook Pro Intel', '13.0', V148, [1680, 1050], 8, 16, {
    vendor: 'Intel Inc.',
    renderer: 'Intel Iris Plus Graphics 655',
  }),
  mac('macos-m1-imac', 'macOS Sonoma · iMac 24" M1', '14.0', V149, [2240, 1260], 8, 8, {
    vendor: 'Apple Inc.',
    renderer: 'Apple M1',
  }),
  mac('macos-m2-studio', 'macOS Sonoma · Mac Studio M2', '14.0', V149, [1920, 1080], 12, 32, {
    vendor: 'Apple Inc.',
    renderer: 'Apple M2',
  }),
  mac('macos-m3-pro', 'macOS Sequoia · MacBook Pro M3 Pro', '15.0', V150, [1512, 982], 12, 18, {
    vendor: 'Apple Inc.',
    renderer: 'Apple M3',
  }),
  mac('macos-intel-monterey', 'macOS Monterey · MacBook Air Intel', '12.0', V147, [1440, 900], 4, 8, {
    vendor: 'Intel Inc.',
    renderer: 'Intel Iris Plus Graphics 645',
  }),
  mac('macos-m2-min', 'macOS Ventura · Mac mini M2', '13.0', V148, [1920, 1080], 8, 8, {
    vendor: 'Apple Inc.',
    renderer: 'Apple M2',
  }),
  mac('macos-m1-pro-16', 'macOS Sonoma · MacBook Pro 16" M1 Pro', '14.0', V149, [1728, 1117], 10, 16, {
    vendor: 'Apple Inc.',
    renderer: 'Apple M1 Pro',
  }),

  // Android (10)
  android('android-pixel8', 'Android 14 · Pixel 8', '14', V149, 'Pixel 8', [412, 915], 8, 8, 'Adreno (TM) 740'),
  android('android-pixel8pro', 'Android 14 · Pixel 8 Pro', '14', V149, 'Pixel 8 Pro', [448, 998], 8, 12, 'Adreno (TM) 740'),
  android('android-s23', 'Android 13 · Galaxy S23', '13', V148, 'SM-S911B', [360, 780], 8, 8, 'Adreno (TM) 740', [
    'Roboto',
    'Samsung Sans',
    'Noto Sans',
  ]),
  android('android-s24', 'Android 14 · Galaxy S24', '14', V149, 'SM-S921B', [360, 780], 8, 8, 'Adreno (TM) 750', [
    'Roboto',
    'Samsung Sans',
    'Noto Sans',
  ]),
  android('android-pixel7', 'Android 13 · Pixel 7', '13', V147, 'Pixel 7', [412, 915], 8, 8, 'Mali-G710'),
  android('android-oneplus12', 'Android 14 · OnePlus 12', '14', V149, 'CPH2581', [412, 919], 8, 12, 'Adreno (TM) 750'),
  android('android-xiaomi14', 'Android 14 · Xiaomi 14', '14', V148, '23127PN0CC', [393, 873], 8, 12, 'Adreno (TM) 750'),
  android('android-s22', 'Android 13 · Galaxy S22', '13', V146, 'SM-S901B', [360, 780], 8, 8, 'Xclipse 920', [
    'Roboto',
    'Samsung Sans',
    'Noto Sans',
  ]),
  android('android-pixel6a', 'Android 13 · Pixel 6a', '13', V147, 'Pixel 6a', [412, 915], 8, 6, 'Mali-G78'),
  android('android-motorola', 'Android 14 · Motorola Edge 40', '14', V148, 'XT2303-2', [393, 873], 8, 8, 'Mali-G710'),

  // iOS (8)
  ios('ios-iphone15', 'iOS 17 · iPhone 15', '17.0', 'iPhone', [393, 852], 6, 6),
  ios('ios-iphone15pro', 'iOS 17 · iPhone 15 Pro', '17.0', 'iPhone', [393, 852], 6, 8),
  ios('ios-iphone16', 'iOS 18 · iPhone 16', '18.0', 'iPhone', [393, 852], 6, 8),
  ios('ios-iphone16pro', 'iOS 18 · iPhone 16 Pro', '18.0', 'iPhone', [402, 874], 6, 8),
  ios('ios-ipad-pro', 'iOS 17 · iPad Pro 11"', '17.0', 'iPad', [834, 1194], 8, 8),
  ios('ios-ipad-air', 'iOS 17 · iPad Air', '17.0', 'iPad', [820, 1180], 8, 8, [
    'Helvetica',
    'Helvetica Neue',
    'SF Pro Text',
  ]),
  ios('ios-iphone14', 'iOS 17 · iPhone 14', '17.0', 'iPhone', [390, 844], 6, 6),
  ios('ios-ipad-pro-13', 'iOS 18 · iPad Pro 13"', '18.0', 'iPad', [1032, 1376], 8, 8),
];
