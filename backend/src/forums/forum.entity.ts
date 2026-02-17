// src/forums/forum.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Post } from "../posts/post.entity";
import { Course } from "../courses/courses.entity";

@Entity("forums")
export class Forum {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @ManyToOne(() => Course, { onDelete: "CASCADE", nullable: true })
  course: Course;

  @Column({ nullable: true })
  courseId: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 0 })
  sortOrder: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Post, (post) => post.forum)
  posts: Post[];
}
