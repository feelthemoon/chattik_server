import {
  Column,
  PrimaryGeneratedColumn,
  Entity,
  CreateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';

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

  @Column({ type: 'date', default: new Date(), nullable: false })
  last_seen: Date;

  @Column({ type: 'varchar', nullable: true, select: false })
  @Exclude()
  refresh_hash: string;

  @CreateDateColumn()
  created_at: Date;
}
