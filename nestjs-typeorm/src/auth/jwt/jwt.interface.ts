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
}

export interface JWTUser {
  id: string;
  email: string;
  role: UserRole;
}
