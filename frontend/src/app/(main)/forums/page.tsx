'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  MessageSquare,
  Search,
  Users,
  Clock,
  ChevronRight,
  Loader2,
  Plus,
} from 'lucide-react';
import { forumService } from '@/services/api.service';
import { Forum, ForumPost } from '@/types';

export default function ForumsPage() {
  const [forums, setForums] = useState<Forum[]>([]);
  const [recentPosts, setRecentPosts] = useState<ForumPost[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const forumsData = await forumService.getAll();
        setForums(forumsData);
      } catch (error) {
        console.error('Failed to fetch forums:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      const results = await forumService.searchPosts(searchQuery);
      setRecentPosts(results);
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Discussion Forums</h1>
          <p className="text-muted-foreground">
            Connect with fellow learners, ask questions, and share knowledge
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search discussions..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <Button onClick={handleSearch}>Search</Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {forums.length > 0 ? (
            forums.map((forum) => (
              <Link key={forum.id} href={`/forums/${forum.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <MessageSquare className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{forum.name}</CardTitle>
                          {forum.course && (
                            <Badge variant="secondary" className="mt-1">
                              {forum.course.title}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  {forum.description && (
                    <CardContent>
                      <CardDescription>{forum.description}</CardDescription>
                    </CardContent>
                  )}
                </Card>
              </Link>
            ))
          ) : (
            <Card className="md:col-span-2">
              <CardContent className="py-12 text-center">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No forums available</h3>
                <p className="text-muted-foreground">
                  Forums will appear here once they are created.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
