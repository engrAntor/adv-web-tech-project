// src/posts/post.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Forum } from '../forums/forum.entity';
import { Comment } from '../comments/comment.entity';
import { User } from '../users/users.entity';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'text' })
  content: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  author: User;

  @Column()
  authorId: number;

  @ManyToOne(() => Forum, (forum) => forum.posts, { onDelete: 'CASCADE' })
  forum: Forum;

  @Column()
  forumId: number;

  @Column({ default: false })
  isPinned: boolean;

  @Column({ default: false })
  isLocked: boolean;

  @Column({ default: false })
  isBestAnswer: boolean;

  @Column({ default: 0 })
  viewCount: number;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];
}
