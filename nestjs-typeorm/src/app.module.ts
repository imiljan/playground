import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from './auth/auth.module';
import { configServiceInstance } from './shared/config/config.service';
import { SharedModule } from './shared/shared.module';

@Module({
  imports: [TypeOrmModule.forRoot(configServiceInstance.typeorm), SharedModule, AuthModule],
})
export class AppModule {}
