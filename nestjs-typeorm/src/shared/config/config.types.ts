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
  accessSecret: string;
  refreshSecret: string;
  expiresIn: string;
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

export interface AWSConfig {
  s3BucketName: string;
  accessKeyId: string;
  secretAccessKey: string;
  endpoint: string;
  region: string;
}
