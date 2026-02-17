// src/forums/forums.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
} from "@nestjs/common";
import { ForumsService } from "./forums.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard, Roles } from "../auth/roles.guard";
import { UserRole } from "../users/users.entity";

@Controller("forums")
export class ForumsController {
  constructor(private readonly forumsService: ForumsService) {}

  // Forum endpoints
  @Get()
  async findAllForums() {
    return this.forumsService.findAllForums();
  }

  @Get(":id")
  async findForumById(@Param("id") id: number) {
    return this.forumsService.findForumById(+id);
  }

  @Get("course/:courseId")
  async findForumsByCourse(@Param("courseId") courseId: number) {
    return this.forumsService.findForumsByCourse(+courseId);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async createForum(
    @Body() body: { name: string; description?: string; courseId?: number },
  ) {
    return this.forumsService.createForum(
      body.name,
      body.description,
      body.courseId,
    );
  }

  // Post endpoints
  @Get(":forumId/posts")
  async findPostsByForum(
    @Param("forumId") forumId: number,
    @Query("limit") limit = 20,
    @Query("offset") offset = 0,
  ) {
    return this.forumsService.findPostsByForum(+forumId, +limit, +offset);
  }

  @Get("posts/search")
  async searchPosts(@Query("q") query: string) {
    return this.forumsService.searchPosts(query || "");
  }

  @Get("posts/:id")
  async findPostById(@Param("id") id: number) {
    return this.forumsService.findPostById(+id);
  }

  @Post(":forumId/posts")
  @UseGuards(JwtAuthGuard)
  async createPost(
    @Param("forumId") forumId: number,
    @Request() req: any,
    @Body() body: { title: string; content: string; tags?: string[] },
  ) {
    return this.forumsService.createPost(
      +forumId,
      req.user.id,
      body.title,
      body.content,
      body.tags,
    );
  }

  @Patch("posts/:id")
  @UseGuards(JwtAuthGuard)
  async updatePost(
    @Param("id") id: number,
    @Request() req: any,
    @Body() body: { title?: string; content?: string; tags?: string[] },
  ) {
    return this.forumsService.updatePost(+id, req.user.id, body);
  }

  @Delete("posts/:id")
  @UseGuards(JwtAuthGuard)
  async deletePost(@Param("id") id: number, @Request() req: any) {
    const isAdmin = req.user.role === UserRole.ADMIN;
    await this.forumsService.deletePost(+id, req.user.id, isAdmin);
    return { success: true };
  }

  @Patch("posts/:id/pin")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  async togglePinPost(@Param("id") id: number) {
    return this.forumsService.togglePinPost(+id);
  }

  @Patch("posts/:postId/best-answer/:commentId")
  @UseGuards(JwtAuthGuard)
  async markBestAnswer(
    @Param("postId") postId: number,
    @Param("commentId") commentId: number,
  ) {
    await this.forumsService.markBestAnswer(+postId, +commentId);
    return { success: true };
  }

  // Comment endpoints
  @Get("posts/:postId/comments")
  async findCommentsByPost(@Param("postId") postId: number) {
    return this.forumsService.findCommentsByPost(+postId);
  }

  @Post("posts/:postId/comments")
  @UseGuards(JwtAuthGuard)
  async createComment(
    @Param("postId") postId: number,
    @Request() req: any,
    @Body() body: { content: string },
  ) {
    return this.forumsService.createComment(+postId, req.user.id, body.content);
  }

  @Patch("comments/:id")
  @UseGuards(JwtAuthGuard)
  async updateComment(
    @Param("id") id: number,
    @Request() req: any,
    @Body() body: { content: string },
  ) {
    return this.forumsService.updateComment(+id, req.user.id, body.content);
  }

  @Delete("comments/:id")
  @UseGuards(JwtAuthGuard)
  async deleteComment(@Param("id") id: number, @Request() req: any) {
    const isAdmin = req.user.role === UserRole.ADMIN;
    await this.forumsService.deleteComment(+id, req.user.id, isAdmin);
    return { success: true };
  }

  @Post("comments/:id/upvote")
  @UseGuards(JwtAuthGuard)
  async upvoteComment(@Param("id") id: number) {
    return this.forumsService.upvoteComment(+id);
  }
}
