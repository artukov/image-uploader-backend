// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // Serve uploads if you want direct file access (optional):
  app.useStaticAssets(join(__dirname, '..', 'uploads'));

  // Start the server
  await app.listen(3000, () => {
    console.log('Nest server running on http://localhost:3000');
  });
}
bootstrap();
