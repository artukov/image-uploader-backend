// src/entities/image.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class Image {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  filePath: string;

  @Column({ nullable: true })
  userId: number;

  @CreateDateColumn()
  uploadedAt: Date;

  @Column('decimal', { precision: 10, scale: 6, nullable: true })
  latitude: number;

  @Column('decimal', { precision: 10, scale: 6, nullable: true })
  longitude: number;

  @Column({ default: 'uploaded' })
  status: string;

  @Column({ default: 0 })
  retryCount: number;
}
