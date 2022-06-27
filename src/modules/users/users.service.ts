import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersEntity } from '../../entities';
import { SignupDto } from '../authentication/authentication.dto';
import { Repository, UpdateResult } from 'typeorm';

type FindFieldType = 'email' | 'id' | 'username';
type UpdateFieldType =
  | 'username'
  | 'password'
  | 'email'
  | 'refresh_hash'
  | 'name'
  | 'avatar';
type AddSelectType = 'password' | 'refresh_hash';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersEntity)
    private readonly usersRepository: Repository<UsersEntity>,
  ) {}

  create(user: SignupDto): Promise<UsersEntity> {
    return this.usersRepository.save(user);
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

  updateOne(
    id: number,
    updatedFiled: UpdateFieldType,
    value: string,
  ): Promise<UpdateResult | null> {
    return this.usersRepository.update({ id }, { [updatedFiled]: value });
  }

  updateConfirmed(
    id: number,
    isConfirmed: boolean,
  ): Promise<UpdateResult | null> {
    return this.usersRepository.update({ id }, { confirmed: isConfirmed });
  }
}
