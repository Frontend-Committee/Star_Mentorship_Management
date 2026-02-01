import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

import { AnnouncementCreatePayload } from '@/types';

interface AddAnnouncementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddAnnouncement: (announcement: AnnouncementCreatePayload) => void;
}

export function AddAnnouncementDialog({
  open,
  onOpenChange,
  onAddAnnouncement,
}: AddAnnouncementDialogProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [hasDeadline, setHasDeadline] = useState(false);
  const [deadline, setDeadline] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      toast.error('Title and description are required');
      return;
    }

    onAddAnnouncement({
      title: title.trim(),
      description: content.trim(),
      is_pinned: isPinned,
    });

    // Reset form
    setTitle('');
    setContent('');
    setIsPinned(false);
    onOpenChange(false);
    toast.success('Announcement created successfully');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="font-heading">New Announcement</DialogTitle>
          <DialogDescription>
            Create a new announcement for your committee members.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Important Update"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Description *</Label>
            <Textarea
              id="content"
              placeholder="Write your announcement here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
            />
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg border border-border">
            <div className="space-y-0.5">
              <Label htmlFor="pinned" className="cursor-pointer">Pin Announcement</Label>
              <p className="text-xs text-muted-foreground">
                Pinned announcements appear at the top
              </p>
            </div>
            <Switch
              id="pinned"
              checked={isPinned}
              onCheckedChange={setIsPinned}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="gradient">
              Create Announcement
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
