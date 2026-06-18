export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  user: AuthUser;
}

export interface AuthState {
  isAuthenticated: boolean;
  session: AuthSession | null;
}
