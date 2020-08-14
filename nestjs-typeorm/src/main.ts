import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, LogLevel } from '@nestjs/common';
import { configServiceInstance } from './shared/config/config.service';

async function bootstrap() {
  const LOGGER = new Logger('main.ts');

  let logger: LogLevel[] | undefined;
  if (process.env.NODE_ENV === 'production') {
    logger = ['log', 'error', 'warn'];
  }

  const app = await NestFactory.create(AppModule, {
    logger,
  });

  const serverConfig = configServiceInstance.server;

  app.enableCors({
    origin: serverConfig.origin || '*',
    credentials: true,
  });
  LOGGER.log(`>>> Accepting requests from origin: \n${serverConfig.origin.join('\n')}`);

  const port = process.env.PORT || serverConfig.port;

  await app.listen(port);
  LOGGER.log(`>>> Application listening on port ${port}`);
}

bootstrap();
