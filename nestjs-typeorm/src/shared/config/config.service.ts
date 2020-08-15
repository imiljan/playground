import { Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { get as getConfig } from 'config';

import { DbConfig, JwtConfig, ServerConfig } from './config.types';

// Allow import from 'config' module only in this file
/* eslint no-restricted-imports: 0 */
@Injectable()
export class ConfigService {
  readonly server: ServerConfig;
  readonly db: DbConfig;
  readonly typeorm: TypeOrmModuleOptions;
  readonly jwt: JwtConfig;

  constructor() {
    this.server = getConfig('server');
    this.db = getConfig('db');
    this.jwt = getConfig('jwt');

    this.typeorm = {
      type: this.db.type,
      host: process.env.DB_HOST || this.db.host,
      port: +process.env.DB_PORT! || this.db.port,
      username: process.env.DB_USERNAME || this.db.username,
      password: process.env.DB_PASSWORD || this.db.password,
      database: process.env.DB_NAME || this.db.database,
      entities: [__dirname + '/../../**/*.entity.{js,ts}'],
      synchronize: this.db.synchronize,
      migrationsRun: this.db.migrationsRun,
      migrations: [__dirname + '../../../migrations/*.{ts,js}'],
      logging: process.env.NODE_ENV !== 'production',
      ssl:
        process.env.NODE_ENV === 'production'
          ? {
              rejectUnauthorized: true,
              ca: process.env.DB_CA,
            }
          : null,
    };
  }
}

export const configServiceInstance = new ConfigService();
