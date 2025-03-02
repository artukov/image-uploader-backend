// src/upload/upload.module.ts
import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Image } from '../entities/image.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Image])],
  controllers: [UploadController],
  providers: [UploadService],
})
export class UploadModule {}
