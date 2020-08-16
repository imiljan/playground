import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@ObjectType({ description: 'User type' })
@Entity()
export class User {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field({
    description: 'User email',
  })
  @Column()
  email: string;

  @Field({ nullable: true })
  @Column()
  age?: number;
}
