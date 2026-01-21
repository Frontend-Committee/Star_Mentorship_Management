import { useState } from 'react';
import { mockAnnouncements } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { AddAnnouncementDialog } from '@/components/dialogs/AddAnnouncementDialog';
import { EditAnnouncementDialog } from '@/components/dialogs/EditAnnouncementDialog';
import { Announcement } from '@/types';
import { Pin, Calendar, Plus, Bell, User } from 'lucide-react';

export default function Announcements() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [announcements, setAnnouncements] = useState<Announcement[]>(mockAnnouncements);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);

  const handleAddAnnouncement = (newAnnouncement: {
    title: string;
    content: string;
    isPinned: boolean;
    deadline?: string;
    author: string;
  }) => {
    const announcement: Announcement = {
      id: `ann-${Date.now()}`,
      ...newAnnouncement,
      createdAt: new Date().toISOString(),
    };
    setAnnouncements([announcement, ...announcements]);
  };

  const handleEditAnnouncement = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setIsEditDialogOpen(true);
  };

  const handleSaveAnnouncement = (updatedAnnouncement: Announcement) => {
    setAnnouncements(
      announcements.map((a) =>
        a.id === updatedAnnouncement.id ? updatedAnnouncement : a
      )
    );
  };

  const handleTogglePin = (id: string) => {
    setAnnouncements(
      announcements.map((a) =>
        a.id === id ? { ...a, isPinned: !a.isPinned } : a
      )
    );
  };

  const sortedAnnouncements = [...announcements].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground">Announcements</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            {isAdmin
              ? 'Create and manage announcements for your committee'
              : 'Stay updated with the latest news and updates'}
          </p>
        </div>
        {isAdmin && (
          <Button variant="gradient" onClick={() => setIsAddDialogOpen(true)} className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            New Announcement
          </Button>
        )}
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {sortedAnnouncements.map((announcement, index) => (
          <Card
            key={announcement.id}
            className={`border-border/50 hover-lift animate-fade-in ${
              announcement.isPinned ? 'border-primary/30 bg-primary/5' : ''
            }`}
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:justify-between">
                <div className="flex items-start gap-3">
                  {announcement.isPinned ? (
                    <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                      <Pin className="w-4 h-4 text-primary" />
                    </div>
                  ) : (
                    <div className="p-2 rounded-lg bg-muted shrink-0">
                      <Bell className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <CardTitle className="text-base sm:text-lg font-heading break-words">
                      {announcement.title}
                    </CardTitle>
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-xs sm:text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        <span>{announcement.author}</span>
                      </div>
                      <span className="hidden sm:inline">•</span>
                      <span>
                        {new Date(announcement.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-11 sm:ml-0">
                  {announcement.isPinned && (
                    <Badge variant="default" className="text-xs">Pinned</Badge>
                  )}
                  {isAdmin && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleTogglePin(announcement.id)}
                        title={announcement.isPinned ? 'Unpin' : 'Pin'}
                        className="h-8 w-8 p-0"
                      >
                        <Pin className={`w-4 h-4 ${announcement.isPinned ? 'text-primary' : 'text-muted-foreground'}`} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditAnnouncement(announcement)}
                        className="h-8 px-3"
                      >
                        Edit
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm sm:text-base text-muted-foreground">{announcement.content}</p>

              {announcement.deadline && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                  <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span className="text-xs sm:text-sm font-medium text-amber-700 dark:text-amber-400">
                    Deadline: {new Date(announcement.deadline).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Announcement Dialog */}
      <AddAnnouncementDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAddAnnouncement={handleAddAnnouncement}
      />

      {/* Edit Announcement Dialog */}
      <EditAnnouncementDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        announcement={editingAnnouncement}
        onSave={handleSaveAnnouncement}
      />
    </div>
  );
}
