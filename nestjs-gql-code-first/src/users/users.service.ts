import { Injectable } from '@nestjs/common';

import { UserInput } from './dto/user.input';
import { UsersArgs } from './dto/users.args';
import { User } from './model/user.model';

@Injectable()
export class UsersService {
  async create(data: UserInput): Promise<User> {
    const u = new User();
    u.age = data.age;
    u.email = data.email;
    u.id = '123-123-123';

    return u;
  }

  async findOneById(id: string): Promise<User> {
    const u = new User();
    u.age = 24;
    u.email = 'test@test.com';
    u.id = id;

    return u;
  }

  async findAll(usersArgs: UsersArgs): Promise<User[]> {
    const u = new User();
    u.age = usersArgs.age;
    u.email = 'test@test.com';
    u.id = '123-123-123';
    return [u] as User[];
  }

  async remove(id: string): Promise<boolean> {
    return id === '123-123-123';
  }
}
