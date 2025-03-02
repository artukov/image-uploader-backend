// src/upload/upload.controller.ts
import { Controller, Post, UseInterceptors, UploadedFile, Body, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
          return callback(new BadRequestException('Only image files are allowed!'), false);
        }
        callback(null, true);
      },
    })
  )
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Body('latitude') latitude: string,
    @Body('longitude') longitude: string,
    @Body('timestamp') timestamp: string,
  ) {
    if (!latitude || !longitude) {
      throw new BadRequestException('Geolocation data is required.');
    }
    return this.uploadService.handleUpload(file, {
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      timestamp,
    });
  }
}
