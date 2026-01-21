import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Announcement } from '@/types';
import { Pin, Calendar, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface AnnouncementCardProps {
  announcements: Announcement[];
}

export default function AnnouncementCard({ announcements }: AnnouncementCardProps) {
  const navigate = useNavigate();
  
  const sortedAnnouncements = [...announcements].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <Card className="border-border/50">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-heading">Announcements</CardTitle>
        <Button variant="ghost" size="sm" className="text-primary" onClick={() => navigate('/announcements')}>
          View all
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {sortedAnnouncements.slice(0, 3).map((announcement, index) => (
          <div
            key={announcement.id}
            className="p-4 rounded-lg bg-muted/50 border border-border/50 hover:border-primary/30 transition-colors animate-fade-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-start gap-3">
              {announcement.isPinned && (
                <Pin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              )}
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-medium text-foreground">
                    {announcement.title}
                  </h4>
                  {announcement.isPinned && (
                    <Badge variant="secondary" className="shrink-0">
                      Pinned
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {announcement.content}
                </p>
                {announcement.deadline && (
                  <div className="flex items-center gap-1.5 text-sm text-primary">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Due: {new Date(announcement.deadline).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
