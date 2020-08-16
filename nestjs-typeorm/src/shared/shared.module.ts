import { Global, Module } from '@nestjs/common';

import { ConfigService, configServiceInstance } from './config/config.service';

@Global()
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
