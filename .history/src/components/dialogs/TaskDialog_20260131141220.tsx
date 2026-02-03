import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { useUsers } from '@/features/auth/hooks';
import { Task, TaskCreatePayload } from '@/types';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: TaskCreatePayload) => void;
  task?: Task | null;
  isLoading?: boolean;
}

export function TaskDialog({
  open,
  onOpenChange,
  onSubmit,
  task,
  isLoading
}: TaskDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);

  const { data: users, isLoading: isLoadingUsers } = useUsers();

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setDate(task.date);
      // Note: If we want to support editing assigned users, we would need to populate selectedUsers here
      // based on task data, but the current Task interface might not have this info populated.
      // For now, we reset it or keep it empty for edits unless we fetch full task details.
      setSelectedUsers([]);
    } else {
      setTitle('');
      setDescription('');
      setDate('');
      setSelectedUsers([]);
    }
  }, [task, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      date,
      users: selectedUsers,
    });
  };

  const toggleUser = (userId: number) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const toggleAll = () => {
    if (!users) return;
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(u => u.id));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-heading">
            {task ? 'Edit Task' : 'Create New Task'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 flex-1 overflow-y-auto pr-2">
          <div className="space-y-2">
            <Label htmlFor="title">Task Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Week 1 Challenge"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Due Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Task details and requirements..."
              rows={5}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Assign to Members</Label>
              <Button type="button" variant="ghost" size="sm" onClick={toggleAll} className="h-auto p-0 text-xs text-muted-foreground hover:text-primary">
                {users && selectedUsers.length === users.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>
            <div className="border rounded-md p-2">
              {isLoadingUsers ? (
                <div className="flex justify-center p-4">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                </div>
              ) : (
                <ScrollArea className="h-[150px]">
                  <div className="space-y-2">
                    {users?.map(user => (
                      <div key={user.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`user-${user.id}`}
                          checked={selectedUsers.includes(user.id)}
                          onCheckedChange={() => toggleUser(user.id)}
                        />
                        <Label htmlFor={`user-${user.id}`} className="font-normal cursor-pointer text-sm">
                          {user.first_name} {user.last_name} ({user.email}) {}
                        </Label>
                      </div>
                    ))}
                    {(!users || users.length === 0) && (
                      <p className="text-sm text-muted-foreground text-center py-2">No members found.</p>
                    )}
                  </div>
                </ScrollArea>
              )}
            </div>
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
              {isLoading ? 'Saving...' : 'Save Task'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
