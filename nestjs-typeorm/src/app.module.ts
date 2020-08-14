import { Module } from '@nestjs/common';
import { SharedModule } from './shared/shared.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { configServiceInstance } from './shared/config/config.service';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(configServiceInstance.typeorm),
    SharedModule,
    AuthModule,
  ],
})
export class AppModule {
}
