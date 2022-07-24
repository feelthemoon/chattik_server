import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersEntity } from '../../entities';
import { SignupDto } from '../authentication/authentication.dto';
import { Like, Repository } from 'typeorm';
import { hash } from 'bcrypt';
import { AddSelectType, FindFieldType, UpdateFieldType } from './types';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersEntity)
    private readonly usersRepository: Repository<UsersEntity>,
  ) {}

  create(user: SignupDto): Promise<UsersEntity> {
    return this.usersRepository.save({
      ...user,
      avatar: `gradient-${Math.floor(Math.random() * 8 + 1)}`,
    });
  }

  findBy(
    field: FindFieldType,
    value: string | number,
    addSelectField?: AddSelectType,
  ): Promise<UsersEntity | null> {
    if (addSelectField) {
      return this.usersRepository
        .createQueryBuilder('users')
        .addSelect(`users.${addSelectField}`)
        .where({ [field]: value })
        .getOne();
    }
    return this.usersRepository.findOneBy({ [field]: value });
  }

  findAllBy(field: FindFieldType, value: string | number): Promise<UsersEntity[]> {
    return this.usersRepository.find({
      where: { [field]: Like(`${value}%`), confirmed: true },
      cache: 1000 * 60 * 60,
    });
  }

  async updateOne(
    id: number,
    updatedFiled: UpdateFieldType,
    value: string,
  ): Promise<UsersEntity | null> {
    const user = await this.findBy('id', id);
    if (!user) {
      throw new NotFoundException({ message: [{ type: 'common_error', text: 'User not found' }] });
    }
    if (updatedFiled === 'password') {
      user.password = await hash(value, 10);
      return this.usersRepository.save(user);
    }
    user[updatedFiled] = value;
    return this.usersRepository.save(user);
  }

  async updateConfirmed(id: number, isConfirmed: boolean): Promise<UsersEntity | null> {
    const user = await this.findBy('id', id);
    if (!user) {
      throw new NotFoundException({ message: [{ type: 'common_error', text: 'User not found' }] });
    }
    user.confirmed = isConfirmed;
    return this.usersRepository.save(user);
  }
}
