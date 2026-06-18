import type { AuthSession, AuthState, AuthUser, LoginInput, RegisterInput } from '@polaris/shared';
import { tokenStore } from './TokenStore';

interface SupabaseAuthResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: {
    id: string;
    email?: string;
    user_metadata?: { name?: string };
  };
}

function getSupabaseConfig(): { url: string; anonKey: string } | null {
  const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  return { url, anonKey };
}

export class AuthService {
  private session: AuthSession | null = tokenStore.load();

  getState(): AuthState {
    return {
      isAuthenticated: this.session !== null && !tokenStore.isExpired(this.session),
      session: this.session,
    };
  }

  getAccessToken(): string | null {
    if (!this.session) return null;
    if (tokenStore.isExpired(this.session)) return null;
    return this.session.accessToken;
  }

  async login(input: LoginInput): Promise<{ session?: AuthSession; error?: string }> {
    const config = getSupabaseConfig();
    if (!config) return { error: 'Supabase não configurado' };

    const response = await fetch(`${config.url}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: config.anonKey,
      },
      body: JSON.stringify({ email: input.email, password: input.password }),
    });

    if (!response.ok) {
      const err = (await response.json().catch(() => ({}))) as { error_description?: string };
      return { error: err.error_description ?? 'Credenciais inválidas' };
    }

    const data = (await response.json()) as SupabaseAuthResponse;
    const session = this.mapSession(data);
    this.persist(session);
    return { session };
  }

  async register(input: RegisterInput): Promise<{ session?: AuthSession; error?: string }> {
    const config = getSupabaseConfig();
    if (!config) return { error: 'Supabase não configurado' };

    const response = await fetch(`${config.url}/auth/v1/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: config.anonKey,
      },
      body: JSON.stringify({
        email: input.email,
        password: input.password,
        data: { name: input.name },
      }),
    });

    if (!response.ok) {
      const err = (await response.json().catch(() => ({}))) as { error_description?: string; msg?: string };
      return { error: err.error_description ?? err.msg ?? 'Falha no registro' };
    }

    const data = (await response.json()) as SupabaseAuthResponse;
    if (!data.access_token) {
      return { error: 'Verifique seu e-mail para confirmar a conta' };
    }

    const session = this.mapSession(data);
    this.persist(session);
    return { session };
  }

  async refresh(): Promise<{ session?: AuthSession; error?: string }> {
    if (!this.session?.refreshToken) {
      return { error: 'Sessão não encontrada' };
    }

    const config = getSupabaseConfig();
    if (!config) return { error: 'Supabase não configurado' };

    const response = await fetch(`${config.url}/auth/v1/token?grant_type=refresh_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: config.anonKey,
      },
      body: JSON.stringify({ refresh_token: this.session.refreshToken }),
    });

    if (!response.ok) {
      this.logout();
      return { error: 'Sessão expirada — faça login novamente' };
    }

    const data = (await response.json()) as SupabaseAuthResponse;
    const session = this.mapSession(data);
    this.persist(session);
    return { session };
  }

  async getValidAccessToken(): Promise<string | null> {
    if (!this.session) return null;
    if (!tokenStore.isExpired(this.session)) {
      return this.session.accessToken;
    }
    const result = await this.refresh();
    return result.session?.accessToken ?? null;
  }

  logout(): void {
    this.session = null;
    tokenStore.clear();
  }

  private mapSession(data: SupabaseAuthResponse): AuthSession {
    const user: AuthUser = {
      id: data.user.id,
      email: data.user.email ?? '',
      name: data.user.user_metadata?.name ?? null,
    };

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: Date.now() + data.expires_in * 1000,
      user,
    };
  }

  private persist(session: AuthSession): void {
    this.session = session;
    tokenStore.save(session);
  }
}

export const authService = new AuthService();
