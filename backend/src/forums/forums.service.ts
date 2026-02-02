// src/forums/forums.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Forum } from './forum.entity';
import { Post } from '../posts/post.entity';
import { Comment } from '../comments/comment.entity';
import { User } from '../users/users.entity';
import { EmailService } from '../email/email.service';

@Injectable()
export class ForumsService {
  constructor(
    @InjectRepository(Forum)
    private forumRepository: Repository<Forum>,
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private emailService: EmailService,
  ) {}

  // Forum methods
  async createForum(name: string, description?: string, courseId?: number): Promise<Forum> {
    const forum = this.forumRepository.create({ name, description, courseId });
    return this.forumRepository.save(forum);
  }

  async findAllForums(): Promise<Forum[]> {
    return this.forumRepository.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  async findForumById(id: number): Promise<Forum | null> {
    return this.forumRepository.findOne({
      where: { id },
      relations: ['course'],
    });
  }

  async findForumsByCourse(courseId: number): Promise<Forum[]> {
    return this.forumRepository.find({
      where: { courseId, isActive: true },
      order: { sortOrder: 'ASC' },
    });
  }

  // Post methods
  async createPost(
    forumId: number,
    authorId: number,
    title: string,
    content: string,
    tags?: string[],
  ): Promise<Post> {
    const forum = await this.forumRepository.findOneBy({ id: forumId });
    if (!forum) throw new NotFoundException('Forum not found');

    const post = this.postRepository.create({
      forumId,
      authorId,
      title,
      content,
      tags,
    });
    return this.postRepository.save(post);
  }

  async findPostsByForum(
    forumId: number,
    limit = 20,
    offset = 0,
  ): Promise<{ posts: Post[]; total: number }> {
    const [posts, total] = await this.postRepository.findAndCount({
      where: { forumId },
      relations: ['author', 'comments'],
      order: { isPinned: 'DESC', createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });

    return { posts, total };
  }

  async findPostById(id: number): Promise<Post | null> {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['author', 'forum', 'comments', 'comments.author'],
    });

    if (post) {
      await this.postRepository.increment({ id }, 'viewCount', 1);
    }

    return post;
  }

  async searchPosts(query: string, limit = 20): Promise<Post[]> {
    return this.postRepository.find({
      where: [
        { title: Like(`%${query}%`) },
        { content: Like(`%${query}%`) },
      ],
      relations: ['author', 'forum'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async updatePost(id: number, authorId: number, data: Partial<Post>): Promise<Post | null> {
    const post = await this.postRepository.findOneBy({ id, authorId });
    if (!post) return null;

    await this.postRepository.update(id, data);
    return this.postRepository.findOneBy({ id });
  }

  async deletePost(id: number, authorId: number, isAdmin = false): Promise<void> {
    const where: any = { id };
    if (!isAdmin) where.authorId = authorId;

    await this.postRepository.delete(where);
  }

  async togglePinPost(id: number): Promise<Post | null> {
    const post = await this.postRepository.findOneBy({ id });
    if (!post) return null;

    await this.postRepository.update(id, { isPinned: !post.isPinned });
    return this.postRepository.findOneBy({ id });
  }

  async markBestAnswer(postId: number, commentId: number): Promise<void> {
    // First, unmark any existing best answer
    await this.commentRepository.update({ postId, isBestAnswer: true }, { isBestAnswer: false });
    // Then mark the new best answer
    await this.commentRepository.update(commentId, { isBestAnswer: true });
    await this.postRepository.update(postId, { isBestAnswer: true });
  }

  // Comment methods
  async createComment(postId: number, authorId: number, content: string): Promise<Comment> {
    const post = await this.postRepository.findOne({
      where: { id: postId },
      relations: ['author'],
    });
    if (!post) throw new NotFoundException('Post not found');

    const comment = this.commentRepository.create({
      postId,
      authorId,
      content,
    });
    const savedComment = await this.commentRepository.save(comment);

    // Send email notification to post author if it's not their own reply
    if (post.authorId !== authorId && post.author?.email) {
      const commenter = await this.userRepository.findOneBy({ id: authorId });
      const commenterName = commenter?.firstName
        ? `${commenter.firstName} ${commenter.lastName || ''}`.trim()
        : commenter?.email || 'Someone';

      // Send email notification asynchronously (don't wait for it)
      this.emailService.sendForumReplyNotification(
        post.author.email,
        commenterName,
        post.title,
        content,
      ).catch(err => console.error('Failed to send forum reply notification:', err));
    }

    return savedComment;
  }

  async findCommentsByPost(postId: number): Promise<Comment[]> {
    return this.commentRepository.find({
      where: { postId },
      relations: ['author'],
      order: { isBestAnswer: 'DESC', createdAt: 'ASC' },
    });
  }

  async updateComment(id: number, authorId: number, content: string): Promise<Comment | null> {
    await this.commentRepository.update({ id, authorId }, { content });
    return this.commentRepository.findOneBy({ id });
  }

  async deleteComment(id: number, authorId: number, isAdmin = false): Promise<void> {
    const where: any = { id };
    if (!isAdmin) where.authorId = authorId;

    await this.commentRepository.delete(where);
  }

  async upvoteComment(id: number): Promise<Comment | null> {
    await this.commentRepository.increment({ id }, 'upvotes', 1);
    return this.commentRepository.findOneBy({ id });
  }
}
