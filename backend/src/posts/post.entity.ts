// src/posts/post.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Forum } from '../forums/forum.entity';  // Correct path
import { Comment } from '../comments/comment.entity';  // Correct path

@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  content: string;

  @ManyToOne(() => Forum, (forum) => forum.posts)
  forum: Forum;

  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];
}
