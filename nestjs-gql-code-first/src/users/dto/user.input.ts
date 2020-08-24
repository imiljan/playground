import { Field, InputType, Int } from '@nestjs/graphql';
import { IsEmail, IsNumber, IsPositive } from 'class-validator';

@InputType()
export class UserInput {
  @Field()
  @IsEmail()
  email: string;

  @Field(() => Int)
  @IsPositive()
  @IsNumber()
  age: number;
}
