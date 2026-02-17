'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    MessageSquare,
    Plus,
    Eye,
    Clock,
    Pin,
    CheckCircle,
    Loader2,
    ArrowLeft,
} from 'lucide-react';
import { forumService } from '@/services/api.service';
import { Forum, ForumPost } from '@/types';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { getAvatarUrl } from '@/lib/utils';

export default function ForumDetailClient() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const forumId = Number(params.forumId);

    const [forum, setForum] = useState<Forum | null>(null);
    const [posts, setPosts] = useState<ForumPost[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [newPost, setNewPost] = useState({ title: '', content: '', tags: '' });
    const [total, setTotal] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [forumData, postsData] = await Promise.all([
                    forumService.getById(forumId),
                    forumService.getPosts(forumId, { limit: 20 }),
                ]);
                setForum(forumData);
                setPosts(postsData.posts);
                setTotal(postsData.total);
            } catch (error) {
                console.error('Failed to fetch forum data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (forumId) {
            fetchData();
        }
    }, [forumId]);

    const handleCreatePost = async () => {
        if (!newPost.title.trim() || !newPost.content.trim()) {
            toast.error('Please fill in all fields');
            return;
        }

        setIsCreating(true);
        try {
            const tags = newPost.tags.split(',').map((t) => t.trim()).filter(Boolean);
            const post = await forumService.createPost(forumId, {
                title: newPost.title,
                content: newPost.content,
                tags: tags.length > 0 ? tags : undefined,
            });
            setPosts((prev) => [post, ...prev]);
            setTotal((prev) => prev + 1);
            setNewPost({ title: '', content: '', tags: '' });
            setIsCreateDialogOpen(false);
            toast.success('Post created successfully');
        } catch (error) {
            toast.error('Failed to create post');
        } finally {
            setIsCreating(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!forum) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">Forum not found</p>
                <Button asChild className="mt-4">
                    <Link href="/forums">Back to Forums</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold tracking-tight">{forum.name}</h1>
                    {forum.description && (
                        <p className="text-muted-foreground">{forum.description}</p>
                    )}
                </div>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            New Post
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[525px]">
                        <DialogHeader>
                            <DialogTitle>Create New Post</DialogTitle>
                            <DialogDescription>
                                Share your question or discussion topic with the community.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Title</label>
                                <Input
                                    placeholder="Enter post title"
                                    value={newPost.title}
                                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Content</label>
                                <Textarea
                                    placeholder="Write your post content..."
                                    rows={5}
                                    value={newPost.content}
                                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Tags (comma separated)</label>
                                <Input
                                    placeholder="e.g., javascript, help, beginner"
                                    value={newPost.tags}
                                    onChange={(e) => setNewPost({ ...newPost, tags: e.target.value })}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleCreatePost} disabled={isCreating}>
                                {isCreating ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    'Create Post'
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="space-y-4">
                {posts.length > 0 ? (
                    posts.map((post) => (
                        <Link key={post.id} href={`/forums/${forumId}/posts/${post.id}`}>
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-start gap-4">
                                        <Avatar>
                                            <AvatarImage src={getAvatarUrl(post.author?.avatar)} />
                                            <AvatarFallback>
                                                {post.author?.firstName?.[0] || post.author?.email?.[0] || 'U'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                {post.isPinned && (
                                                    <Pin className="h-4 w-4 text-primary" />
                                                )}
                                                {post.isBestAnswer && (
                                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                                )}
                                                <h3 className="font-semibold truncate">{post.title}</h3>
                                            </div>
                                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                                {post.content}
                                            </p>
                                            <div className="flex items-center gap-4 mt-3 flex-wrap">
                                                <span className="text-xs text-muted-foreground">
                                                    by {post.author?.firstName || post.author?.email}
                                                </span>
                                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {new Date(post.createdAt).toLocaleDateString()}
                                                </span>
                                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <Eye className="h-3 w-3" />
                                                    {post.viewCount} views
                                                </span>
                                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <MessageSquare className="h-3 w-3" />
                                                    {post.comments?.length || 0} replies
                                                </span>
                                                {post.tags && post.tags.length > 0 && (
                                                    <div className="flex gap-1">
                                                        {post.tags.slice(0, 3).map((tag) => (
                                                            <Badge key={tag} variant="secondary" className="text-xs">
                                                                {tag}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))
                ) : (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
                            <p className="text-muted-foreground mb-4">
                                Be the first to start a discussion in this forum!
                            </p>
                            <Button onClick={() => setIsCreateDialogOpen(true)}>
                                <Plus className="mr-2 h-4 w-4" />
                                Create Post
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
