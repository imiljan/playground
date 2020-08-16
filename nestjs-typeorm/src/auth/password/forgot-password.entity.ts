import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

@Entity('forgot_password')
export class ForgotPasswordEntity {
  @PrimaryColumn()
  email: string;

  @Column()
  code: number;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamp' })
  expiresAt: Date;
}
