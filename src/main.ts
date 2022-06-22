import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const PORT = process.env.APP_PORT || 8000;
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  await app.listen(PORT, () =>
    Logger.verbose(`APP HAS BEEN STARTED AT PORT ${PORT}`),
  );
}
bootstrap();
