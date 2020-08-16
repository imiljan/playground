import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  Redirect,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { PresignedWriteDto } from './dto/presigned-write.dto';
import { MediaService } from './media.service';

@Controller('medias')
export class MediaController {
  constructor(private mediaService: MediaService) {}

  @UseGuards(AuthGuard())
  @Get('upload')
  async getPresignedUrlForWrite(
    @Query(ValidationPipe) params: PresignedWriteDto,
  ): Promise<{ url: string; uuid: string }> {
    return { ...(await this.mediaService.getPresignedUrlForUpload(params)) };
  }

  @Get(':uuid')
  @Redirect('')
  async getPresignedUrlForRead(@Param('uuid', ParseUUIDPipe) uuid: string) {
    return { url: await this.mediaService.getPresignedUrlForDownload(uuid) };
  }
}
