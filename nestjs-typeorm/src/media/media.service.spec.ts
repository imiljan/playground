import { Test, TestingModule } from '@nestjs/testing';

import { ConfigService } from '../shared/config/config.service';
import { MediaRepository } from './media.repository';
import { MediaService } from './media.service';

const mockMediaRepository = () => ({
  findOne: jest.fn(),
});

describe('MediaService', () => {
  let service: MediaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MediaService,
        {
          provide: ConfigService,
          useFactory: () => ({
            awsConfig: { accessKeyId: '', secretAccessKey: '', endpoint: '', bucketName: '' },
          }),
        },
        { provide: MediaRepository, useFactory: mockMediaRepository },
      ],
    }).compile();

    service = module.get<MediaService>(MediaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
