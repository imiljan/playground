import { ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { UserEntity } from '../user/user.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { GetPostsDto } from './dto/get-posts.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostEntity } from './post.entity';
import { PostRepository } from './post.repository';

@Injectable()
export class PostService {
  private readonly logger = new Logger(PostService.name);

  constructor(
    @InjectRepository(PostRepository)
    private readonly postRepository: PostRepository,
  ) {}

  getAllPosts(getPostsDto: GetPostsDto) {
    const { take, skip } = getPostsDto;
    return this.postRepository.find({ take, skip, order: { createdAt: 'DESC' } });
  }

  getPost(postId: number) {
    return this.postRepository.findOneOrFail(postId).catch((e) => {
      this.logger.error(e);
      throw new NotFoundException('Post not found!');
    });
  }

  createPost(createPostDto: CreatePostDto, author: UserEntity) {
    const { title, body } = createPostDto;
    const post: PostEntity = this.postRepository.create({ title, body, author });
    return this.postRepository.save(post);
  }

  async deletePost(postId: number) {
    const res = await this.postRepository.delete(postId);
    if (res.affected === 0) {
      throw new NotFoundException('Post not found');
    }
  }

  async updatePost(postId: number, updatePostDto: UpdatePostDto, author: UserEntity) {
    const post = await this.postRepository.findOne(postId, { relations: ['author'] });
    if (post?.author.id !== author.id) {
      throw new ForbiddenException();
    }
    const { title, body } = updatePostDto;

    if (title) post.title = title;

    if (body) post.body = body;

    await this.postRepository.update(postId, post);
    return post;
  }
}
