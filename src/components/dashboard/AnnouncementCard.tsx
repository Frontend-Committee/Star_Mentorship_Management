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
  
  const announcementsArray = Array.isArray(announcements) ? announcements : [];

  const sortedAnnouncements = [...announcementsArray].sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <Card className="border-border/50">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-heading">Announcements</CardTitle>
        <Button variant="ghost" size="sm" onClick={() => navigate('/announcements')} className="h-8 gap-1 text-xs font-semibold text-primary bg-transparent hover:bg-primary hover:text-primary-foreground rounded-lg transition-all duration-200">
          View all
          <ArrowRight className="w-3 h-3" />
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
              {announcement.is_pinned && (
                <Pin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              )}
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-medium text-foreground">
                    {announcement.title}
                  </h4>
                  {announcement.is_pinned && (
                    <Badge variant="secondary" className="shrink-0">
                      Pinned
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {announcement.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
