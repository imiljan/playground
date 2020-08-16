import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';

import { UserEntity } from '../user/user.entity';

@Entity('auth')
export class AuthEntity {
  @PrimaryColumn()
  token: string;

  @Column({ default: true })
  isValid: boolean;

  @Column('timestamp')
  expiresAt: Date;

  @ManyToOne(
    () => UserEntity,
    (user) => user.tokens,
    {
      primary: true,
    },
  )
  user: UserEntity;
}

// Expired and invalid tokens can be deleted in CRON job
