import { app } from 'electron';
import { join } from 'path';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import type { AuthSession } from '@polaris/shared';

const SESSION_KEY = 'auth_session';

export class TokenStore {
  private get filePath(): string {
    const dir = join(app.getPath('userData'), 'data');
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    return join(dir, 'session.json');
  }

  save(session: AuthSession): void {
    writeFileSync(this.filePath, JSON.stringify(session), 'utf-8');
  }

  load(): AuthSession | null {
    if (!existsSync(this.filePath)) return null;
    try {
      const raw = readFileSync(this.filePath, 'utf-8');
      return JSON.parse(raw) as AuthSession;
    } catch {
      return null;
    }
  }

  clear(): void {
    if (existsSync(this.filePath)) {
      writeFileSync(this.filePath, '', 'utf-8');
    }
  }

  isExpired(session: AuthSession): boolean {
    return Date.now() >= session.expiresAt - 60_000;
  }
}

export const tokenStore = new TokenStore();
