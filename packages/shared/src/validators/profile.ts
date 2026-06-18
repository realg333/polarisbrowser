import { z } from 'zod';

const proxySchema = z.object({
  enabled: z.boolean(),
  type: z.enum(['http', 'socks5']),
  host: z.string().min(1),
  port: z.number().int().min(1).max(65535),
  username: z.string().optional(),
  password: z.string().optional(),
  country: z.string().length(2).optional(),
});

const fingerprintOsSchema = z.enum(['windows', 'macos', 'ios', 'android']);
const browserEngineSchema = z.enum(['chrome', 'sunbrowser', 'flowerbrowser']);

const fingerprintSchema = z.object({
  os: fingerprintOsSchema.default('windows'),
  presetId: z.string().optional(),
  userAgent: z.string().optional(),
  osVersion: z.string().optional(),
  browserVersion: z.string().optional(),
  browserKernel: z.enum(['chrome', 'firefox']).optional(),
  screenWidth: z.number().int().positive().optional(),
  screenHeight: z.number().int().positive().optional(),
  timezone: z.string().optional(),
  language: z.string().optional(),
  webrtc: z.enum(['real', 'disabled', 'fake', 'forward']).optional(),
  doNotTrack: z.boolean().optional(),
  portScanProtection: z.boolean().optional(),
  canvas: z.enum(['real', 'noise', 'block']).optional(),
  webgl: z.enum(['real', 'noise', 'mask']).optional(),
  webglVendor: z.string().optional(),
  webglRenderer: z.string().optional(),
  audioContext: z.enum(['real', 'noise']).optional(),
  hardwareConcurrency: z.number().int().positive().optional(),
  deviceMemory: z.number().int().positive().optional(),
  platform: z.string().optional(),
  clientRects: z.enum(['real', 'noise']).optional(),
  geolocation: z
    .object({
      mode: z.enum(['block', 'prompt', 'allow']),
      lat: z.number().optional(),
      lng: z.number().optional(),
      accuracy: z.number().optional(),
    })
    .optional(),
  fonts: z
    .object({
      mode: z.enum(['default', 'custom']),
      list: z.array(z.string()).optional(),
    })
    .optional(),
  mediaDevices: z.enum(['real', 'fake', 'block']).optional(),
});

export const createProfileSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100),
  description: z.string().max(500).optional(),
  startUrl: z
    .string()
    .default('about:blank')
    .refine((val) => val === 'about:blank' || z.string().url().safeParse(val).success, {
      message: 'URL inválida',
    }),
  language: z.string().default('pt-BR'),
  timezone: z.string().default('America/Sao_Paulo'),
  locale: z.string().default('pt-BR'),
  adBlocker: z.boolean().default(false),
  proxy: proxySchema.nullable().optional(),
  folderId: z.string().uuid().optional(),
  notes: z.string().max(1000).optional(),
  browserEngine: browserEngineSchema.default('sunbrowser'),
  fingerprint: fingerprintSchema.optional(),
  tagIds: z.array(z.string().uuid()).optional(),
});

export const updateProfileSchema = createProfileSchema.partial().extend({
  status: z.enum(['idle', 'running', 'archived']).optional(),
  folderId: z.string().uuid().nullable().optional(),
  tagIds: z.array(z.string().uuid()).optional(),
});

export const createFolderSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(80),
  parentId: z.string().uuid().nullable().optional(),
  color: z.string().default('#38BDF8'),
});

export const createTagSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(40),
  color: z.string().default('#0EA5E9'),
});

export type CreateProfileSchema = z.infer<typeof createProfileSchema>;
export type UpdateProfileSchema = z.infer<typeof updateProfileSchema>;
