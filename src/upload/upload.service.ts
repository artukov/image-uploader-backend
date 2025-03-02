// src/upload/upload.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Image } from '../entities/image.entity';

@Injectable()
export class UploadService {
  constructor(
    @InjectRepository(Image)
    private imageRepository: Repository<Image>,
  ) {}

  async handleUpload(
    file: Express.Multer.File,
    metadata: { latitude: number; longitude: number; timestamp: string },
  ): Promise<any> {
    // Additional validations can be implemented as needed

    // Save image record in database
    const image = this.imageRepository.create({
      filePath: file.path,
      latitude: metadata.latitude,
      longitude: metadata.longitude,
      status: 'uploaded',
    });
    await this.imageRepository.save(image);
    return { message: 'Upload successful', imageId: image.id };
  }
}
