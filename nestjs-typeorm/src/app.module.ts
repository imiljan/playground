import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from './auth/auth.module';
import { MailModule } from './mail/mail.module';
import { MediaModule } from './media/media.module';
import { PostModule } from './post/post.module';
import { configServiceInstance } from './shared/config/config.service';
import { SharedModule } from './shared/shared.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(configServiceInstance.typeorm),
    SharedModule,
    AuthModule,
    UserModule,
    PostModule,
    MailModule,
    MediaModule,
  ],
})
export class AppModule {}
