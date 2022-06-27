import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

interface ITemplateData {
  to: string;
  subject: string;
  context?: {
    [name: string]: any;
  };
}
interface ITemplate {
  name: string;
  data: ITemplateData;
}

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly config: ConfigService,
  ) {}

  public async sendEmail(templateData: ITemplate): Promise<void> {
    return this.mailerService.sendMail({
      to: templateData.data.to,
      from: this.config.get<string>('MAIL_USERNAME'),
      subject: templateData.data.subject,
      template: templateData.name,
      context: templateData.data.context,
    });
  }
}
