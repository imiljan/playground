import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { JWTUser } from '../auth/jwt/jwt.interface';
import { GetUser } from '../auth/jwt/user.decorator';
import { Roles } from '../auth/roles/roles.decorator';
import { RolesGuard } from '../auth/roles/roles.guard';
import { UserRole } from '../user/user.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { GetPostsDto } from './dto/get-posts.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostService } from './post.service';

@Controller('posts')
@UseGuards(AuthGuard())
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get()
  getAllPosts(@Query(new ValidationPipe({ transform: true })) getPostsDto: GetPostsDto) {
    return this.postService.getAllPosts(getPostsDto);
  }

  @Get(':id')
  getPost(@Param('id', ParseIntPipe) postId: number) {
    return this.postService.getPost(postId);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.USER)
  createPost(@Body(ValidationPipe) createPostDto: CreatePostDto, @GetUser() user: JWTUser) {
    return this.postService.createPost(createPostDto, user);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  deletePost(@Param('id', ParseIntPipe) postId: number) {
    return this.postService.deletePost(postId);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.USER)
  updatePost(
    @Param('id', ParseIntPipe) postId: number,
    @Body(ValidationPipe) updatePostDto: UpdatePostDto,
    @GetUser() user: JWTUser,
  ) {
    return this.postService.updatePost(postId, updatePostDto, user);
  }
}
