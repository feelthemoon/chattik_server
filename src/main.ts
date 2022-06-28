import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { HttpExceptionFilter, TokenExceptionFilter } from './common/filters';
import { GoogleRecaptchaFilter } from './common/filters/grecaptcha-exception.filter';

async function bootstrap() {
  const PORT = process.env.APP_PORT || 8000;
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.enableCors({
    origin: process.env.CLIENT_URL,
    credentials: true,
    allowedHeaders: 'Origin, Content-Type, X-Auth-Token',
    methods: 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
    optionsSuccessStatus: 200,
  });
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useGlobalFilters(
    new TokenExceptionFilter(),
    new HttpExceptionFilter(),
    new GoogleRecaptchaFilter(),
  );
  await app.listen(PORT, () => Logger.verbose(`APP HAS BEEN STARTED AT PORT ${PORT}`));
}
bootstrap();
