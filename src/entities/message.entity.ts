import { Column, PrimaryGeneratedColumn, Entity, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { UsersEntity } from './users.entity';
import { AttachmentEntity } from './attachment.entity';
import { DialogEntity } from './dialog.entity';
import { MessageType } from './types';


@Entity('messages')
export class MessageEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: true })
  text_content: string;

  @Column({ type: 'enum', enum: MessageType, nullable: false, default: MessageType.TEXT})
  type: MessageType;

  @Column({ type: 'boolean', default: false })
  is_read: boolean;

  @OneToMany(() => AttachmentEntity, (attachment: AttachmentEntity) => attachment.message, { cascade: true })
  attachments: AttachmentEntity[];

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => UsersEntity, (user: UsersEntity) => user.messages, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: UsersEntity;

  @ManyToOne(() => DialogEntity, (dialog: DialogEntity) => dialog.messages, { nullable: false })
  @JoinColumn({ name: 'dialog_id' })
  dialog: DialogEntity;
}
