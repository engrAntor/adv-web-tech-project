// src/forums/forums.module.ts
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Forum } from "./forum.entity";
import { Post } from "../posts/post.entity";
import { Comment } from "../comments/comment.entity";
import { User } from "../users/users.entity";
import { ForumsService } from "./forums.service";
import { ForumsController } from "./forums.controller";
import { EmailModule } from "../email/email.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Forum, Post, Comment, User]),
    EmailModule,
  ],
  providers: [ForumsService],
  controllers: [ForumsController],
  exports: [ForumsService],
})
export class ForumsModule {}
