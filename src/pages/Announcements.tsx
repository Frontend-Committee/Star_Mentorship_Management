import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { AddAnnouncementDialog } from '@/components/dialogs/AddAnnouncementDialog';
import { EditAnnouncementDialog } from '@/components/dialogs/EditAnnouncementDialog';
import { DeleteConfirmationDialog } from '@/components/dialogs/DeleteConfirmationDialog';
import { Announcement, AnnouncementCreatePayload } from '@/types';
import { Pin, Calendar, Plus, Bell, User, Loader2 } from 'lucide-react';
import { useAnnouncements, useCreateAnnouncement, useUpdateAnnouncement, useDeleteAnnouncement } from '@/features/announcements/hooks';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';

export default function Announcements() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const { data: announcements = [], isLoading } = useAnnouncements();
  const createMutation = useCreateAnnouncement();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const updateMutation = useUpdateAnnouncement();
  const deleteMutation = useDeleteAnnouncement();

  const handleAddAnnouncement = async (newAnnouncement: AnnouncementCreatePayload) => {
    try {
      await createMutation.mutateAsync(newAnnouncement);
      setIsAddDialogOpen(false);
    } catch (error) {
      toast.error('Failed to create announcement');
    }
  };

  const handleEditAnnouncement = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setIsEditDialogOpen(true);
  };

  const handleSaveAnnouncement = async (updatedAnnouncement: Announcement) => {
    try {
      await updateMutation.mutateAsync({
        id: updatedAnnouncement.id,
        data: {
          title: updatedAnnouncement.title,
          description: updatedAnnouncement.description,
          is_pinned: updatedAnnouncement.is_pinned,
        }
      });
      setIsEditDialogOpen(false);
      toast.success('Announcement updated');
    } catch (error) {
      toast.error('Failed to update announcement');
    }
  };

  const handleTogglePin = async (announcement: Announcement) => {
    try {
      await updateMutation.mutateAsync({
        id: announcement.id,
        data: { is_pinned: !announcement.is_pinned }
      });
      toast.success(announcement.is_pinned ? 'Unpinned' : 'Pinned');
    } catch (error) {
      toast.error('Failed to toggle pin');
    }
  };

  const handleDeleteAnnouncement = async () => {
    if (deletingId === null) return;
    try {
      await deleteMutation.mutateAsync(deletingId);
      toast.success('Announcement deleted');
      setIsDeleteDialogOpen(false);
      setDeletingId(null);
    } catch (error) {
      toast.error('Failed to delete announcement');
    }
  };

  const confirmDelete = (id: number) => {
    setDeletingId(id);
    setIsDeleteDialogOpen(true);
  };

  const announcementsArray = Array.isArray(announcements) ? announcements : [];

  const sortedAnnouncements = [...announcementsArray].sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
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
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : sortedAnnouncements.length === 0 ? (
          <Card className="p-12 flex flex-col items-center justify-center text-center space-y-4">
            <Bell className="w-12 h-12 text-muted-foreground/30" />
            <div className="space-y-1">
              <p className="text-lg font-medium">No announcements yet</p>
              <p className="text-sm text-muted-foreground">Stay tuned for updates!</p>
            </div>
          </Card>
        ) : (
          sortedAnnouncements.map((announcement, index) => (
            <Card
              key={announcement.id}
              className={`border-border/50 hover-lift animate-fade-in ${
                announcement.is_pinned ? 'border-primary/30 bg-primary/5' : ''
              }`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:justify-between">
                  <div className="flex items-start gap-3">
                    {announcement.is_pinned ? (
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
                          <span>{announcement.author_name || 'Admin'}</span>
                        </div>
                        <span className="hidden sm:inline">•</span>
                        <span>
                          {new Date(announcement.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-11 sm:ml-0">
                    {announcement.is_pinned && (
                      <Badge variant="default" className="text-xs">Pinned</Badge>
                    )}
                    {isAdmin && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleTogglePin(announcement)}
                          title={announcement.is_pinned ? 'Unpin' : 'Pin'}
                          className="h-8 w-8 p-0"
                        >
                          <Pin className={`w-4 h-4 ${announcement.is_pinned ? 'text-primary' : 'text-muted-foreground'}`} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditAnnouncement(announcement)}
                          className="h-8 px-3"
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => confirmDelete(announcement.id)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm sm:text-base text-muted-foreground">{announcement.description}</p>

                {announcement.link && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10">
                    <Calendar className="w-4 h-4 text-primary shrink-0" />
                    <a 
                      href={announcement.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs sm:text-sm font-medium text-primary hover:underline"
                    >
                      Related Link
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
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

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteAnnouncement}
        isLoading={deleteMutation.isPending}
        title="Delete Announcement"
        description="Are you sure you want to delete this announcement? This action cannot be undone."
      />
    </div>
  );
}
