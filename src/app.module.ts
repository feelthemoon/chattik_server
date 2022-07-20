import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthenticationModule } from './modules/authentication/authentication.module';
import { UsersModule } from './modules/users/users.module';
import { AttachmentEntity, DialogEntity, MessageEntity, UsersEntity } from './entities';
import { RedisModule } from 'nestjs-redis';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailModule } from './modules/mail/mail.module';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { GoogleRecaptchaModule, GoogleRecaptchaNetwork } from '@nestlab/google-recaptcha';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      port: parseInt(process.env.PG_PORT),
      username: process.env.PG_USER,
      password: process.env.PG_PASSWORD,
      database: process.env.PG_DATABASE,
      host: process.env.PG_HOST,
      entities: [UsersEntity, DialogEntity, MessageEntity, AttachmentEntity],
      synchronize: true,
      logger: 'file',
      logging: true,
    }),
    RedisModule.register({
      name: 'revoked_tokens',
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT),
      db: parseInt(process.env.REDIS_DB),
    }),
    MailerModule.forRoot({
      transport: {
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false, // upgrade later with STARTTLS
        auth: {
          user: process.env.MAIL_USERNAME,
          pass: process.env.MAIL_PASSWORD,
        },
      },
      defaults: {
        from: '"nest-modules" <modules@nestjs.com>',
      },
      template: {
        dir: './src/modules/mail/templates',
        adapter: new HandlebarsAdapter(undefined, {
          inlineCssEnabled: true,
          inlineCssOptions: { url: ' ', preserveMediaQueries: true },
        }),
        options: {
          strict: true,
        },
      },
    }),
    GoogleRecaptchaModule.forRoot({
      secretKey: process.env.GOOGLE_RECAPTCHA_SECRET_KEY,
      response: (req) => req.body.recaptchaToken,
      // skipIf: process.env.NODE_ENV !== 'production',
      network: GoogleRecaptchaNetwork.Recaptcha,
      actions: ['signin', 'signup', 'recoverPassword', 'newPassword'],
      score: 0.8,
    }),
    AuthenticationModule,
    UsersModule,
    MailModule.register(),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
