// src/forums/forums.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Forum } from './forum.entity';  // Correct path
import { Post } from '../posts/post.entity';  // Correct path

@Injectable()
export class ForumService {
  constructor(
    @InjectRepository(Forum)
    private forumRepository: Repository<Forum>,
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
  ) {}

  async createForum(name: string): Promise<Forum> {
    const forum = this.forumRepository.create({ name });
    return this.forumRepository.save(forum);
  }

  async createPost(forumId: number, content: string): Promise<Post> {
    const forum = await this.forumRepository.findOneBy({ id: forumId });
    if (!forum) throw new Error('Forum not found');
    
    const post = this.postRepository.create({ content, forum });
    return this.postRepository.save(post);
  }
}
