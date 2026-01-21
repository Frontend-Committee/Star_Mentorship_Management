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
import { toast } from 'sonner';

interface AddWeekDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddWeek: (week: {
    weekNumber: number;
    title: string;
    description: string;
    notes?: string;
    slides?: string;
    challengeLink?: string;
    formLink?: string;
  }) => void;
  nextWeekNumber: number;
}

export function AddWeekDialog({
  open,
  onOpenChange,
  onAddWeek,
  nextWeekNumber,
}: AddWeekDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [slides, setSlides] = useState('');
  const [challengeLink, setChallengeLink] = useState('');
  const [formLink, setFormLink] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !description.trim()) {
      toast.error('Title and description are required');
      return;
    }

    onAddWeek({
      weekNumber: nextWeekNumber,
      title: title.trim(),
      description: description.trim(),
      notes: notes.trim() || undefined,
      slides: slides.trim() || undefined,
      challengeLink: challengeLink.trim() || undefined,
      formLink: formLink.trim() || undefined,
    });

    // Reset form
    setTitle('');
    setDescription('');
    setNotes('');
    setSlides('');
    setChallengeLink('');
    setFormLink('');
    onOpenChange(false);
    toast.success(`Week ${nextWeekNumber} added successfully`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="font-heading">Add Week {nextWeekNumber}</DialogTitle>
          <DialogDescription>
            Add new weekly content for your mentorship program.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Introduction to Web Development"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Brief description of this week's content..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="notes">Notes URL</Label>
              <Input
                id="notes"
                placeholder="https://..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slides">Slides URL</Label>
              <Input
                id="slides"
                placeholder="https://..."
                value={slides}
                onChange={(e) => setSlides(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="challenge">Challenge URL</Label>
              <Input
                id="challenge"
                placeholder="https://..."
                value={challengeLink}
                onChange={(e) => setChallengeLink(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="form">Submission Form URL</Label>
              <Input
                id="form"
                placeholder="https://..."
                value={formLink}
                onChange={(e) => setFormLink(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="gradient">
              Add Week
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
