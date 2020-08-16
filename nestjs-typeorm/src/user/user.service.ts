import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(@InjectRepository(UserRepository) private readonly userRepository: UserRepository) {}

  getUser(userId: number) {
    return this.userRepository.findOneOrFail(userId).catch((e) => {
      this.logger.error(e);
      throw new NotFoundException();
    });
  }
}
