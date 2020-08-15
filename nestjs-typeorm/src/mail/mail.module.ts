import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Module } from '@nestjs/common';
import path from 'path';

import { configServiceInstance } from '../shared/config/config.service';
import { SharedModule } from '../shared/shared.module';
import { MailService } from './mail.service';

const mailConfig = configServiceInstance.mailConfig;

@Module({
  imports: [
    SharedModule,
    MailerModule.forRoot({
      transport: {
        host: mailConfig.host,
        port: mailConfig.port,
        ignoreTLS: mailConfig.ignoreTLS,
        secure: mailConfig.secure,
        auth: {
          user: mailConfig.auth.user,
          pass: process.env.MAIL_PASS || mailConfig.auth.pass,
        },
      },
      defaults: {
        from: `"no-replay" <${mailConfig.auth.user}>`,
      },
      template: {
        dir: path.join(__dirname, 'templates/pages'),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
      options: {
        partials: {
          dir: path.join(__dirname, 'templates/partials'),
          options: {
            strict: true,
          },
        },
      },
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
