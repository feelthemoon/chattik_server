import {
  Column,
  PrimaryGeneratedColumn,
  Entity,
  CreateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { MessageEntity } from './message.entity';
import { DialogEntity } from './dialog.entity';

@Entity('users')
export class UsersEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', unique: true, nullable: false, length: 255 })
  email: string;

  @Column({ type: 'varchar', unique: true, nullable: false, length: 25 })
  username: string;

  @Column({ type: 'varchar', nullable: false, length: 255, select: false })
  password: string;

  @Column({ type: 'varchar', nullable: true, length: 255 })
  name: string;

  @Column({ type: 'varchar', nullable: true })
  avatar: string;

  @Column({ type: 'boolean', nullable: false, default: false })
  confirmed: boolean;

  @Column({ type: 'timestamp', default: new Date(), nullable: false })
  last_seen: Date;

  @Column({ type: 'varchar', nullable: true, select: false })
  @Exclude()
  refresh_hash: string;

  @CreateDateColumn()
  created_at: Date;

  @OneToMany(() => MessageEntity, (message: MessageEntity) => message.user, { cascade: true })
  messages: MessageEntity[];

  @ManyToMany(() => DialogEntity, (dialog: DialogEntity) => dialog.users, { cascade: true })
  @JoinTable({
    name: 'user_dialogs',
    inverseJoinColumn: { name: 'dialog_id' },
    joinColumn: { name: 'user_id' },
  })
  dialogs: DialogEntity[];
}
