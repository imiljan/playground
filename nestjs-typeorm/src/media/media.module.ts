import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../auth/auth.module';
import { SharedModule } from '../shared/shared.module';
import { MediaController } from './media.controller';
import { MediaRepository } from './media.repository';
import { MediaService } from './media.service';

@Module({
  imports: [SharedModule, TypeOrmModule.forFeature([MediaRepository]), AuthModule],
  providers: [MediaService],
  controllers: [MediaController],
})
export class MediaModule {}
