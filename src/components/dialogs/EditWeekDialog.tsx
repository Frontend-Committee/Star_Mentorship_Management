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
import { toast } from 'sonner';
import { useWeek, useUpdateWeekFull } from '@/features/weeks/hooks';
import { Calendar, Loader2 } from 'lucide-react';

interface EditWeekDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  weekId: number;
}

export function EditWeekDialog({
  open,
  onOpenChange,
  weekId,
}: EditWeekDialogProps) {
  const [title, setTitle] = useState('');
  const [number, setNumber] = useState<number>(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const { data: week, isLoading } = useWeek(weekId, 'admin');
  const updateWeek = useUpdateWeekFull(weekId);

  // Load week data into form
  useEffect(() => {
    if (week) {
      setTitle(week.title || '');
      setNumber(week.number || 0);
      
      // Format dates for input[type="date"] (YYYY-MM-DD)
      if (week.start_date) {
        setStartDate(new Date(week.start_date).toISOString().split('T')[0]);
      }
      if (week.end_date) {
        setEndDate(new Date(week.end_date).toISOString().split('T')[0]);
      }
    }
  }, [week]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }

    if (!startDate || !endDate) {
      toast.error('Dates are required');
      return;
    }

    try {
      await updateWeek.mutateAsync({
        title: title.trim(),
        number: number,
        start_date: startDate,
        end_date: endDate,
      });

      onOpenChange(false);
      toast.success('Week updated successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update week';
      toast.error(errorMessage);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="font-heading">Edit Week {number}</DialogTitle>
          <DialogDescription>
            Update the title, sequence, or dates for this week.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-1 space-y-2">
                <Label htmlFor="weekNumber">No.</Label>
                <Input
                  id="weekNumber"
                  type="number"
                  value={number}
                  onChange={(e) => setNumber(parseInt(e.target.value))}
                  required
                />
              </div>
              <div className="col-span-3 space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Introduction to Web Development"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
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
                disabled={updateWeek.isPending}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="gradient"
                disabled={updateWeek.isPending}
              >
                {updateWeek.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
