import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { ValidationPipe } from '@nestjs/common';
import { assertJwtSecretConfigured } from './auth/jwt-secret.util';

async function bootstrap() {
  try {
    assertJwtSecretConfigured();
  } catch (err) {
    console.error((err as Error).message);
    process.exit(1);
  }

  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.enableCors();
  app.setGlobalPrefix('api');
  app.enableShutdownHooks();
  await app.listen(process.env.PORT ?? 3005, '0.0.0.0');
}
bootstrap().catch(console.error);
