import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SharedModule } from './shared/shared.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { configServiceInstance } from './shared/config/config.service';

@Module({
  imports: [
    TypeOrmModule.forRoot(configServiceInstance.typeorm),
    SharedModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
}
