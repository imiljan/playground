export interface ServerConfig {
  origin: string[];
  port: number;
}

export interface DbConfig {
  type: any;
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  synchronize: boolean;
  migrationsRun: boolean;
}

export interface JwtConfig {
  secret: string;
  expiresIn: number;
  refreshExpiresIn: string;
}

interface MailAuth {
  user: string;
  pass: string;
}

export interface MailConfig {
  host: string;
  port: number;
  ignoreTLS: boolean;
  secure: boolean;
  auth: MailAuth;
}
