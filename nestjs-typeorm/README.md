<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo_text.svg" width="320" alt="Nest Logo" /></a>
</p>

## Description

[Nest](https://github.com/nestjs/nest) demo API with TypeOrm.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ docker-compose up -d
```

## Logs

```bash
$ docker-compose logs -f api
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Debugging

1. Stop running container
```bash
$ docker-compose stop api
```
2. In docker-compose.yml change command:
   - From: _command: npm run start:dev_
   - To _command: npm run start:debug_
3. Start the api:
   ```bash
   docker-compose up -d api
   ```
4. Place breakpoints and start debugging. (If this fails wait a few seconds for container to start or check the logs)

**After finishing stop the containers and change back command to npm run start:dev*
## Stay in touch

- Author - [Miljan Ignjatovic](https://github.com/imiljan)

## License

  Nest is [MIT licensed](LICENSE).
