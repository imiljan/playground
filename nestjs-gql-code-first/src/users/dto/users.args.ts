import { ArgsType, Field, Int } from '@nestjs/graphql';
import { IsNumber, IsOptional } from 'class-validator';

@ArgsType()
export class UsersArgs {
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  age?: number;
}
