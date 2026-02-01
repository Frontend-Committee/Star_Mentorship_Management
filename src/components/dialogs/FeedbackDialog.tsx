import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FeedbackCreatePayload, Submission } from '@/types';
import { useEffect, useState } from 'react';

interface FeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: FeedbackCreatePayload) => void;
  submission: Submission | null;
  isLoading?: boolean;
}

export function FeedbackDialog({ 
  open, 
  onOpenChange, 
  onSubmit, 
  submission,
  isLoading 
}: FeedbackDialogProps) {
  const [score, setScore] = useState<number | ''>('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (submission?.feedback) {
      setScore(submission.feedback.score);
      setNote(submission.feedback.note);
    } else {
      setScore('');
      setNote('');
    }
  }, [submission, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!submission || score === '') return;

    onSubmit({
      task_sub: submission.id,
      score: Number(score),
      note: note.trim(),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="font-heading">
            {submission?.feedback ? 'Edit Feedback' : 'Give Feedback'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="score">Score (0-100)</Label>
            <Input
              id="score"
              type="number"
              min="0"
              max="100"
              value={score}
              onChange={(e) => setScore(Number(e.target.value))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="note">Feedback Note</Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Good job! Just a few comments..."
              rows={4}
              required
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Submit Feedback'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
