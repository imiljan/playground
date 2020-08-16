import { UserRole } from 'aws-sdk/clients/workmail';

export interface AccessTokenPayload {
  email?: string;
  exp: number;
  iat: number;
  sub: string;
  role: UserRole;
}

export interface RefreshTokenPayload {
  exp: number;
  iat: number;
  sub: string;
  tokenVersion: number;
}

export interface JWTUser {
  id: number;
  email: string;
  role: UserRole;
}
