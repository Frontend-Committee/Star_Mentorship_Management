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
import { toast } from 'sonner';
import { useCreateWeek } from '@/features/weeks/hooks';
import { Calendar } from 'lucide-react';

interface AddWeekDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nextWeekNumber: number;
}

export function AddWeekDialog({
  open,
  onOpenChange,
  nextWeekNumber,
}: AddWeekDialogProps) {
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const createWeek = useCreateWeek();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }

    if (!startDate) {
      toast.error('Start date is required');
      return;
    }

    if (!endDate) {
      toast.error('End date is required');
      return;
    }

    try {
      await createWeek.mutateAsync({
        number: nextWeekNumber,
        title: title.trim(),
        start_date: startDate, // Send YYYY-MM-DD string directly
        end_date: endDate,     // Send YYYY-MM-DD string directly
      });

      // Reset form
      setTitle('');
      setStartDate('');
      setEndDate('');
      onOpenChange(false);
      toast.success(`Week ${nextWeekNumber} created successfully`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create week';
      toast.error(errorMessage);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="font-heading">Add Week {nextWeekNumber}</DialogTitle>
          <DialogDescription>
            Create a new week for your mentorship program.
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
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="startDate" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Start Date *
            </Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              End Date *
            </Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate}
              required
            />
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={createWeek.isPending}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="gradient"
              disabled={createWeek.isPending}
            >
              {createWeek.isPending ? 'Creating...' : 'Add Week'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
