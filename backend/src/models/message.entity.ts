// src/models/message.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  room: string;

  @Column()
  userId: number;

  @Column()
  username: string;

  @Column()
  text: string;

  @CreateDateColumn()
  timestamp: Date;
}