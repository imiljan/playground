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
