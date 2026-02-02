import { useState, useEffect } from 'react';
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
import { Announcement } from '@/types';

interface EditAnnouncementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  announcement: Announcement | null;
  onSave: (announcement: Announcement) => void;
}

export function EditAnnouncementDialog({
  open,
  onOpenChange,
  announcement,
  onSave,
}: EditAnnouncementDialogProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [hasDeadline, setHasDeadline] = useState(false);
  const [deadline, setDeadline] = useState('');

  useEffect(() => {
    if (announcement) {
      setTitle(announcement.title);
      setContent(announcement.description);
      setIsPinned(announcement.is_pinned);
    }
  }, [announcement]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      toast.error('Title and content are required');
      return;
    }

    if (!announcement) return;

    onSave({
      ...announcement,
      title: title.trim(),
      description: content.trim(),
      is_pinned: isPinned,
    });

    onOpenChange(false);
    toast.success('Announcement updated successfully');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="font-heading">Edit Announcement</DialogTitle>
          <DialogDescription>
            Make changes to the announcement.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Title *</Label>
            <Input
              id="edit-title"
              placeholder="e.g., Important Update"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-content">Description *</Label>
            <Textarea
              id="edit-content"
              placeholder="Write your announcement here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
            />
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg border border-border">
            <div className="space-y-0.5">
              <Label htmlFor="edit-pinned" className="cursor-pointer">Pin Announcement</Label>
              <p className="text-xs text-muted-foreground">
                Pinned announcements appear at the top
              </p>
            </div>
            <Switch
              id="edit-pinned"
              checked={isPinned}
              onCheckedChange={setIsPinned}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="gradient">
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
