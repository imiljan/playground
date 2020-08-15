import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

@Entity()
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
