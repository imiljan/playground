import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import S3, { CreateBucketRequest } from 'aws-sdk/clients/s3';
import { v4 as uuidv4 } from 'uuid';

import { ConfigService } from '../shared/config/config.service';
import { MediaRepository } from './media.repository';
import { PresignedUrlParamsUpload, PresignedUrlResponse } from './media.types';

@Injectable()
export class MediaService {
  private logger = new Logger(MediaService.name);

  private s3: S3;

  constructor(
    private configService: ConfigService,
    @InjectRepository(MediaRepository)
    private mediaRepository: MediaRepository,
  ) {
    this.s3 = new S3({
      // region: this.configService.awsConfig.region,
      accessKeyId: this.configService.awsConfig.accessKeyId,
      secretAccessKey: this.configService.awsConfig.secretAccessKey,
      endpoint: this.configService.awsConfig.endpoint,
      s3ForcePathStyle: true, // needed with minio?
      signatureVersion: 'v4',
      sslEnabled: false,
    });

    if (process.env.NODE_ENV === 'production') {
      // CARE FOR BUCKET NAME
      const bucketName = this.configService.awsConfig.s3BucketName;
      this.s3
        .listBuckets()
        .promise()
        .then((data) => {
          this.logger.debug(data);
          if (data.Buckets?.findIndex((b) => b.Name === bucketName) == -1) {
            const params: CreateBucketRequest = {
              Bucket: bucketName,
            };
            this.s3
              .createBucket(params)
              .promise()
              .then((data) => {
                this.logger.log(`Bucket ${bucketName} Created`);
                if (data && data.Location) {
                  this.logger.log(data.Location);
                }
              });
          }
        })
        .catch((err) => {
          if (err.statusCode == 409) {
            this.logger.log(`Bucket ${bucketName} has been created already`);
          } else this.logger.error(err);
        });
    }
  }

  async getPresignedUrlForUpload(params: PresignedUrlParamsUpload): Promise<PresignedUrlResponse> {
    const { extension, contentType } = params;

    const key = new Date().toISOString().split('T')[0];
    const uuid = uuidv4();
    const signedUrl = await this.s3.getSignedUrlPromise('putObject', {
      Bucket: this.configService.awsConfig.s3BucketName,
      Key: `${key}/${uuid}.${extension}`,
      ContentType: contentType,
      Expires: 60 * 5,
    });
    await this.mediaRepository.save({ uuid, key: '' + key, extension });

    return { url: signedUrl, uuid };
  }

  async getPresignedUrlForDownload(uuid: string): Promise<string> {
    const media = await this.mediaRepository.findOne(uuid);

    if (!media) {
      throw new NotFoundException('Image not found.');
    }

    return this.s3.getSignedUrlPromise('getObject', {
      Bucket: this.configService.awsConfig.s3BucketName,
      Key: media.fileName,
      Expires: 60 * 5,
    });
  }
}
