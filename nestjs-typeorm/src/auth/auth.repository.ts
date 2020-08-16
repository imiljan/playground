import { EntityRepository, Repository } from 'typeorm';

import { AuthEntity } from './auth.entity';

@EntityRepository(AuthEntity)
export class AuthRepository extends Repository<AuthEntity> {}
