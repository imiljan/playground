import { EntityRepository, Repository } from 'typeorm';

import { MediaEntity } from './media.entity';

@EntityRepository(MediaEntity)
export class MediaRepository extends Repository<MediaEntity> {}
