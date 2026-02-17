'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { forumService } from '@/services/api.service';
import { ForumPost, Comment, UserRole } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  ArrowLeft,
  MessageSquare,
  Eye,
  Pin,
  CheckCircle2,
  ThumbsUp,
  Send,
  Loader2,
  Award,
  Clock,
  User,
  MoreVertical,
  Trash2,
  Edit,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import Link from 'next/link';
import { getAvatarUrl } from '@/lib/utils';

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const forumId = params.forumId as string;
  const postId = params.postId as string;

  const [post, setPost] = useState<ForumPost | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<number | null>(null);

  const isInstructor = user?.role === UserRole.INSTRUCTOR || user?.role === UserRole.ADMIN || user?.role === UserRole.ADVISOR;
  const isPostAuthor = user?.id === post?.authorId;

  const fetchPost = async () => {
    try {
      const data = await forumService.getPost(parseInt(postId));
      setPost(data);
      if (data.comments) {
        setComments(data.comments);
      }
    } catch (error) {
      toast.error('Failed to load post');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const data = await forumService.getComments(parseInt(postId));
      setComments(data);
    } catch (error) {
      console.error('Failed to load comments:', error);
    }
  };

  useEffect(() => {
    if (postId) {
      fetchPost();
    }
  }, [postId]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      await forumService.createComment(parseInt(postId), newComment);
      setNewComment('');
      fetchComments();
      toast.success('Reply posted successfully');
    } catch (error) {
      toast.error('Failed to post reply');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpvote = async (commentId: number) => {
    try {
      await forumService.upvoteComment(commentId);
      fetchComments();
    } catch (error) {
      toast.error('Failed to upvote');
      console.error(error);
    }
  };

  const handleMarkBestAnswer = async (commentId: number) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/forums/posts/${postId}/best-answer/${commentId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to mark best answer');
      fetchPost();
      fetchComments();
      toast.success('Best answer marked');
    } catch (error) {
      toast.error('Failed to mark best answer');
      console.error(error);
    }
  };

  const handleDeleteComment = async () => {
    if (!commentToDelete) return;
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/forums/comments/${commentToDelete}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to delete comment');
      fetchComments();
      toast.success('Comment deleted');
    } catch (error) {
      toast.error('Failed to delete comment');
      console.error(error);
    } finally {
      setDeleteDialogOpen(false);
      setCommentToDelete(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getInitials = (author?: { firstName?: string; lastName?: string; email?: string }) => {
    if (!author) return 'U';
    if (author.firstName) {
      return `${author.firstName[0]}${author.lastName?.[0] || ''}`.toUpperCase();
    }
    return author.email?.[0].toUpperCase() || 'U';
  };

  const getAuthorName = (author?: { firstName?: string; lastName?: string; email?: string }) => {
    if (!author) return 'Unknown User';
    if (author.firstName) {
      return `${author.firstName} ${author.lastName || ''}`.trim();
    }
    return author.email?.split('@')[0] || 'Unknown User';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold">Post not found</h2>
        <Button onClick={() => router.back()} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back Button */}
      <Button variant="ghost" asChild>
        <Link href={`/forums/${forumId}`}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Forum
        </Link>
      </Button>

      {/* Post Content */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {post.isPinned && (
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    <Pin className="h-3 w-3 mr-1" /> Pinned
                  </Badge>
                )}
                {post.isBestAnswer && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <CheckCircle2 className="h-3 w-3 mr-1" /> Answered
                  </Badge>
                )}
                {post.isLocked && (
                  <Badge variant="secondary">Locked</Badge>
                )}
              </div>
              <CardTitle className="text-2xl">{post.title}</CardTitle>
            </div>
          </div>

          {/* Author Info */}
          <div className="flex items-center gap-3 mt-4 pt-4 border-t">
            <Avatar className="h-10 w-10">
              <AvatarImage src={getAvatarUrl(post.author?.avatar)} />
              <AvatarFallback>{getInitials(post.author)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{getAuthorName(post.author)}</p>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Clock className="h-3 w-3" />
                {formatDate(post.createdAt)}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Post Content */}
          <div className="prose dark:prose-invert max-w-none mb-6">
            <p className="whitespace-pre-wrap">{post.content}</p>
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag, index) => (
                <Badge key={index} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Post Stats */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground pt-4 border-t">
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" /> {post.viewCount} views
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" /> {comments.length} replies
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Replies Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Replies ({comments.length})
        </h2>

        {comments.length > 0 ? (
          <div className="space-y-4">
            {comments.map((comment) => (
              <Card
                key={comment.id}
                className={comment.isBestAnswer ? 'border-green-500 border-2 bg-green-50/50 dark:bg-green-950/20' : ''}
              >
                <CardContent className="pt-4">
                  {/* Best Answer Badge */}
                  {comment.isBestAnswer && (
                    <div className="flex items-center gap-2 mb-3 text-green-600">
                      <Award className="h-5 w-5" />
                      <span className="font-semibold">Best Answer</span>
                    </div>
                  )}

                  {/* Comment Author */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={getAvatarUrl(comment.author?.avatar)} />
                        <AvatarFallback>{getInitials(comment.author)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{getAuthorName(comment.author)}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(comment.createdAt)}
                        </p>
                      </div>
                    </div>

                    {/* Actions Dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {(isPostAuthor || isInstructor) && !comment.isBestAnswer && (
                          <DropdownMenuItem onClick={() => handleMarkBestAnswer(comment.id)}>
                            <Award className="h-4 w-4 mr-2" />
                            Mark as Best Answer
                          </DropdownMenuItem>
                        )}
                        {(user?.id === comment.authorId || isInstructor) && (
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => {
                              setCommentToDelete(comment.id);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Comment Content */}
                  <p className="whitespace-pre-wrap text-sm mb-3">{comment.content}</p>

                  {/* Comment Actions */}
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleUpvote(comment.id)}
                      className="text-muted-foreground hover:text-primary"
                    >
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      {comment.upvotes || 0}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No replies yet. Be the first to reply!</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Reply Form */}
      {!post.isLocked && user && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Post a Reply</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitComment} className="space-y-4">
              <Textarea
                placeholder="Write your reply..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={4}
                className="resize-none"
              />
              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting || !newComment.trim()}>
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Post Reply
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {post.isLocked && (
        <Card>
          <CardContent className="py-4 text-center text-muted-foreground">
            This discussion has been locked. No new replies can be posted.
          </CardContent>
        </Card>
      )}

      {!user && (
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-muted-foreground mb-2">You must be logged in to reply.</p>
            <Button asChild>
              <Link href="/login">Login to Reply</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Comment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this comment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteComment} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
