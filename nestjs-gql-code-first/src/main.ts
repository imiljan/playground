import { Logger, LogLevel, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { configServiceInstance } from './shared/config/config.service';

async function bootstrap() {
  const LOGGER = new Logger('main.ts');

  let logger: LogLevel[] | undefined;
  if (process.env.NODE_ENV === 'production') {
    logger = ['log', 'error', 'warn'];
  }

  const app = await NestFactory.create(AppModule, { logger });
  app.useGlobalPipes(new ValidationPipe());

  const serverConfig = configServiceInstance.server;

  const port = process.env.PORT || serverConfig.port;

  await app.listen(port);
  LOGGER.log(`>>> Application is running on: http://localhost:${port}/graphql`);
}
bootstrap();
