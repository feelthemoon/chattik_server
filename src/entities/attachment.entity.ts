import {
  Column,
  PrimaryGeneratedColumn,
  Entity,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { MessageEntity } from './message.entity';
import { AttachmentType } from './types';

@Entity('attachments')
export class AttachmentEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: AttachmentType, nullable: false })
  type: AttachmentType;

  @Column({ type: 'varchar', nullable: false })
  title: string;

  @Column({ type: 'varchar', nullable: false })
  size: string;

  @Column({ type: 'varchar', nullable: false })
  src: string;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => MessageEntity, (message: MessageEntity) => message.attachments)
  @JoinColumn({ name: 'message_id' })
  message: MessageEntity;
}
