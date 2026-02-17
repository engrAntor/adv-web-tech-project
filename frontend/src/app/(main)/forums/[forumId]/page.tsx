import { forumService } from '@/services/api.service';
import ForumDetailClient from '@/components/forums/ForumDetailClient';

export async function generateStaticParams() {
  try {
    const forums = await forumService.getAll();
    return forums.map((forum) => ({
      forumId: forum.id.toString(),
    }));
  } catch (error) {
    console.error('Error generating static params for forums:', error);
    return [];
  }
}

export default function ForumDetailPage() {
  return <ForumDetailClient />;
}
