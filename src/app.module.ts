// src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UploadModule } from './upload/upload.module';
import { Image } from './entities/image.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres', // or your chosen relational DB
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'image_uploader_db',
      entities: [Image],
      synchronize: true, // enable only in development
    }),
    UploadModule,
  ],
})
export class AppModule {}
