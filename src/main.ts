import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const PORT = process.env.APP_PORT || 8000;
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.enableCors({
    origin: 'http://localhost:8000/',
    credentials: true,
    allowedHeaders: 'Origin, Content-Type, X-Auth-Token',
    methods: 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
    optionsSuccessStatus: 200
  });
  await app.listen(PORT, () =>
    Logger.verbose(`APP HAS BEEN STARTED AT PORT ${PORT}`),
  );
}
bootstrap();
