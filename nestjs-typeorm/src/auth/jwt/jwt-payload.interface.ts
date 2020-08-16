export interface AccessTokenPayload {
  id: number;
  email: string;
}

export interface RefreshTokenPayload {
  id: number;
  tokenVersion: number;
}
