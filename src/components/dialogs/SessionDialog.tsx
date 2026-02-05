import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Session, SessionCreatePayload } from '@/types';
import { Globe, Users } from 'lucide-react';

interface SessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: SessionCreatePayload) => void;
  session?: Session | null; // If provided, we are in edit mode
  isLoading?: boolean;
}

export function SessionDialog({ 
  open, 
  onOpenChange, 
  onSubmit, 
  session,
  isLoading 
}: SessionDialogProps) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState<'online' | 'offline'>('offline');
  const [note, setNote] = useState('');

  // Pre-fill form when session changes (edit mode)
  useEffect(() => {
    const formatTimeForInput = (timeStr: string) => {
      if (!timeStr) return '';
      // If it matches HH:mm or HH:mm:ss, it's already in a valid format for time input
      if (/^\d{2}:\d{2}(:\d{2})?$/.test(timeStr)) return timeStr.substring(0, 5);
      
      try {
        // Try to parse as a full date or time string
        // If it's just "10:00 PM", we prepend a dummy date for parsing
        const dateObj = new Date(timeStr.includes(':') && !timeStr.includes('-') ? `2000-01-01 ${timeStr}` : timeStr);
        if (!isNaN(dateObj.getTime())) {
          return dateObj.getHours().toString().padStart(2, '0') + ':' + 
                 dateObj.getMinutes().toString().padStart(2, '0');
        }
      } catch (e) {
        console.error("Failed to parse time:", timeStr);
      }
      return '';
    };

    const formatDateForInput = (dateStr: string) => {
      if (!dateStr) return '';
      // If it matches YYYY-MM-DD, return as is
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
      
      try {
        const dateObj = new Date(dateStr);
        if (!isNaN(dateObj.getTime())) {
          const year = dateObj.getFullYear();
          const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
          const day = dateObj.getDate().toString().padStart(2, '0');
          return `${year}-${month}-${day}`;
        }
      } catch (e) {
        console.error("Failed to parse date:", dateStr);
      }
      return '';
    };

    if (session) {
      setTitle(session.title);
      setDate(formatDateForInput(session.date));
      setStartTime(formatTimeForInput(session.start_time));
      setEndTime(formatTimeForInput(session.end_time));
      setLocation(session.location);
      setType(session.type || 'offline');
      setNote(session.note || '');
    } else {
      // Reset for create mode
      setTitle('');
      setDate('');
      setStartTime('');
      setEndTime('');
      setLocation('');
      setType('offline');
      setNote('');
    }
  }, [session, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date || !startTime || !endTime || !location) return;

    onSubmit({
      title: title.trim(),
      date,
      start_time: startTime,
      end_time: endTime,
      location: location.trim(),
      type,
      note: note.trim(),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="font-heading">
            {session ? 'Edit Session' : 'Add New Session'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Session Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Week 5 - Project Workshop"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Session Type</Label>
              <Select value={type} onValueChange={(val: 'online' | 'offline') => setType(val)}>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="offline">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-orange-500" />
                      <span>Offline (In-person)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="online">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-blue-500" />
                      <span>Online (Remote)</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">
              {type === 'online' ? 'Meeting Link (URL)' : 'Location / Room'}
            </Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder={type === 'online' ? 'https://zoom.us/j/...' : 'e.g., Room 101'}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_time">Start Time</Label>
              <Input
                id="start_time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_time">End Time</Label>
              <Input
                id="end_time"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Note (Optional)</Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Brief note or agenda..."
              rows={3}
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
              {isLoading ? 'Saving...' : (session ? 'Save Changes' : 'Create Session')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
