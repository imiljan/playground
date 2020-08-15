import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MailService {
  private logger = new Logger(MailService.name);

  constructor(private readonly mailerService: MailerService) {}

  sendForgotPasswordEmail(to: string, code: number) {
    this.mailerService
      .sendMail({
        to,
        subject: 'Reset password',
        template: 'forgot-password',
        context: {
          code,
        },
      })
      .then((r) => {
        this.logger.debug(r);
      })
      .catch((err) => {
        this.logger.error(err);
      });
  }
}
