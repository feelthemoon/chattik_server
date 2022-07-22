import { PrimaryGeneratedColumn, Entity, CreateDateColumn, OneToMany, ManyToMany } from 'typeorm';
import { UsersEntity } from './users.entity';
import { MessageEntity } from './message.entity';

@Entity('dialogs')
export class DialogEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToMany(() => UsersEntity, (user: UsersEntity) => user.dialogs)
  users: UsersEntity[];

  @OneToMany(() => MessageEntity, (message: MessageEntity) => message.dialog, { cascade: true })
  messages: MessageEntity[];

  @CreateDateColumn()
  created_at: Date;
}
