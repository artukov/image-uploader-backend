// src/upload/upload.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Image } from '../entities/image.entity';

interface UploadMetadata {
  latitude: number;
  longitude: number;
  timestamp: string;
  uniqueId?: string;
}

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  
  constructor(
    @InjectRepository(Image)
    private imageRepository: Repository<Image>,
  ) {}

  async handleUpload(
    file: Express.Multer.File,
    metadata: UploadMetadata,
  ): Promise<any> {
    // Create image record
    const image = this.imageRepository.create({
      filePath: file.path,
      latitude: metadata.latitude,
      longitude: metadata.longitude,
      status: 'uploaded',
      uniqueId: metadata.uniqueId, // Save the uniqueId if provided
    });
    
    try {
      // Save to database
      await this.imageRepository.save(image);
      this.logger.log(`Image saved with ID: ${image.id}, uniqueId: ${metadata.uniqueId || 'none'}`);
      return { 
        success: true,
        message: 'Upload successful', 
        imageId: image.id,
        filePath: file.path
      };
    } catch (error) {
      this.logger.error(`Failed to save image: ${error.message}`);
      throw error; // Let the controller handle specific error types
    }
  }

  /**
   * Find an image by its uniqueId
   */
  async findByUniqueId(uniqueId: string): Promise<Image | null> {
    if (!uniqueId) return null;
    
    try {
      return await this.imageRepository.findOne({ where: { uniqueId } });
    } catch (error) {
      this.logger.error(`Error finding image by uniqueId: ${error.message}`);
      return null;
    }
  }
}