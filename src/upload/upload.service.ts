// src/upload/upload.service.ts
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Image } from '../entities/image.entity';

interface UploadMetadata {
  latitude: number;
  longitude: number;
  timestamp: string;
  uniqueId?: string;
  retryCount?: number;
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
      retryCount: metadata.retryCount || 0 // Track retry count
    });
    
    try {
      // Save to database
      await this.imageRepository.save(image);
      this.logger.log(`Image saved with ID: ${image.id}, uniqueId: ${metadata.uniqueId || 'none'}, retry count: ${image.retryCount}`);
      return { 
        success: true,
        message: 'Upload successful', 
        imageId: image.id,
        filePath: file.path,
        retryCount: image.retryCount
      };
    } catch (error) {
      this.logger.error(`Failed to save image: ${error.message}`);
      throw error; // Let the controller handle specific error types
    }
  }

  /**
   * Update an existing image record
   */
  async updateImage(image: Image): Promise<Image> {
    return this.imageRepository.save(image);
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

  /**
   * Find an image by ID
   */
  async findById(id: number): Promise<Image | null> {
    try {
      const image = await this.imageRepository.findOne({ where: { id: id } });
      if (!image) {
        throw new NotFoundException(`Image with ID ${id} not found`);
      }
      return image;
    } catch (error) {
      this.logger.error(`Error finding image by ID: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get all images with pagination
   */
  async findAll(page: number = 1, limit: number = 20): Promise<[Image[], number]> {
    try {
      const [images, total] = await this.imageRepository.findAndCount({
        order: { uploadedAt: 'DESC' },
        skip: (page - 1) * limit,
        take: limit,
      });
      
      return [images, total];
    } catch (error) {
      this.logger.error(`Error finding all images: ${error.message}`);
      throw error;
    }
  }
}