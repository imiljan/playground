import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';

import { configServiceInstance } from './shared/config/config.service';
import { SharedModule } from './shared/shared.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    SharedModule,
    TypeOrmModule.forRoot(configServiceInstance.typeorm),
    SharedModule,
    GraphQLModule.forRoot({
      debug: process.env.NODE_ENV !== 'production',
      playground: process.env.NODE_ENV !== 'production',
      autoSchemaFile: 'schema.gql',
      sortSchema: true,
    }),
    UsersModule,
  ],
})
export class AppModule {}
