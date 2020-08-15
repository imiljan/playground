import { Module } from '@nestjs/common';

import { ConfigService, configServiceInstance } from './config/config.service';

@Module({
  providers: [
    {
      provide: ConfigService,
      useValue: configServiceInstance,
    },
  ],
  exports: [ConfigService],
})
export class SharedModule {}
