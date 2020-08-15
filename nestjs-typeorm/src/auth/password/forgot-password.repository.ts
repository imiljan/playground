import { EntityRepository, Repository } from 'typeorm';

import { ForgotPasswordEntity } from './forgot-password.entity';

@EntityRepository(ForgotPasswordEntity)
export class ForgotPasswordRepository extends Repository<ForgotPasswordEntity> {}
