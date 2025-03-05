// src/upload/upload.controller.ts
import { 
  Controller, 
  Post, 
  UseInterceptors, 
  UploadedFile, 
  Body, 
  BadRequestException,
  ConflictException,
  Logger
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { existsSync, mkdirSync } from 'fs';

// Ensure uploads directory exists
const uploadDir = './uploads';
if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir);
}

@Controller('upload')
export class UploadController {
  private readonly logger = new Logger(UploadController.name);
  
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
    @Body('id') uniqueId: string, // Add uniqueId parameter
  ) {
    if (!latitude || !longitude) {
      throw new BadRequestException('Geolocation data is required.');
    }
    
    try {
      // If uniqueId is provided, check for duplicates first
      if (uniqueId) {
        const existingImage = await this.uploadService.findByUniqueId(uniqueId);
        if (existingImage) {
          this.logger.log(`Duplicate upload detected for image ID: ${uniqueId}`);
          return {
            success: true,
            message: 'Image already processed',
            duplicate: true,
            imageId: existingImage.id
          };
        }
      }
      
      // Continue with upload if no duplicate found
      return this.uploadService.handleUpload(file, {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        timestamp,
        uniqueId, // Pass uniqueId to service
      });
    } catch (error) {
      this.logger.error(`Upload error: ${error.message}`);
      
      // Handle database unique constraint violation
      if (error.code === '23505') { // PostgreSQL unique constraint error
        throw new ConflictException('This image has already been uploaded');
      }
      
      throw error;
    }
  }
}