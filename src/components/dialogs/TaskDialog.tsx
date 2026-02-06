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
import { Textarea } from '@/components/ui/textarea';
import { useCommitteeMembers } from '@/features/members/hooks';
import { Task, TaskCreatePayload } from '@/types';
import { Loader2, Search } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';

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
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: users, isLoading: isLoadingUsers } = useCommitteeMembers({ 
    enabled: open && isAdmin 
  });

  // Filter members based on search query
  const filteredUsers = useMemo(() => {
    if (!users) return [];
    if (!searchQuery.trim()) return users;
    
    const query = searchQuery.toLowerCase();
    return users.filter(user => {
      const fullName = `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase();
      const email = (user.email || '').toLowerCase();
      return fullName.includes(query) || email.includes(query);
    });
  }, [users, searchQuery]);

  useEffect(() => {
    if (open && task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      if (task.date) {
        setDate(task.date.split('T')[0]);
      }
      
      let userIds: number[] = [];
      if (task.assigned_to && Array.isArray(task.assigned_to)) {
        userIds = task.assigned_to;
      } else if ('users' in task && Array.isArray((task as { users?: unknown }).users)) {
        const potentialUsers = (task as { users: unknown[] }).users || [];
        if (potentialUsers.length > 0 && typeof potentialUsers[0] === 'number') {
          userIds = potentialUsers as number[];
        } else if (potentialUsers.length > 0 && typeof potentialUsers[0] === 'object') {
          userIds = (potentialUsers as { id?: number; user?: number }[]).map(u => u.id || u.user).filter((id): id is number => !!id);
        }
      } else if ('submissions' in task && Array.isArray((task as import('@/types').TaskDetail).submissions)) {
        userIds = (task as import('@/types').TaskDetail).submissions
          .map(s => s.user?.id || s.user)
          .filter((id): id is number => typeof id === 'number');
      }

      const uniqueIds = [...new Set(userIds)];
      setSelectedUsers(prev => {
        if (JSON.stringify(prev) === JSON.stringify(uniqueIds)) return prev;
        return uniqueIds;
      });
    }
  }, [task, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;

    // Backend expects 'date' in YYYY-MM-DD format
    // <input type="date"> value is already in this format
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      date: date, // yyyy-mm-dd
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">
            {task ? 'Edit Task' : 'Create New Task'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 overflow-y-auto flex-1 px-1 custom-scrollbar">
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
              rows={4}
              className="resize-none"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base">Assign to Members ({selectedUsers.length})</Label>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                onClick={toggleAll} 
                className="h-auto py-1 px-2 text-xs hover:bg-primary/10"
              >
                {users && selectedUsers.length === users.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>
            
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <div className="border border-border/50 rounded-lg bg-secondary/10 overflow-hidden flex flex-col h-56">
              {isLoadingUsers ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="overflow-y-auto p-2 space-y-1 custom-scrollbar">
                  {filteredUsers.map(user => {
                    if (!user.id) return null;
                    const isSelected = selectedUsers.includes(user.id);
                    const checkboxId = `task-user-${user.id}`;
                    
                    return (
                      <div 
                        key={user.id} 
                        className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                          isSelected 
                            ? 'bg-primary/10 border border-primary/30' 
                            : 'hover:bg-white/5 border border-transparent'
                        }`}
                      >
                        <Checkbox
                          id={checkboxId}
                          checked={isSelected}
                          onCheckedChange={() => toggleUser(user.id!)}
                        />
                        <Label 
                          htmlFor={checkboxId} 
                          className="text-sm font-medium leading-none cursor-pointer flex-1 py-1"
                        >
                          <div className="flex flex-col gap-0.5">
                            <span>{user.first_name} {user.last_name}</span>
                            <span className="text-xs text-muted-foreground font-normal">
                              {user.email}
                            </span>
                          </div>
                        </Label>
                      </div>
                    );
                  })}
                  {filteredUsers.length === 0 && (
                    <div className="flex items-center justify-center h-full text-muted-foreground p-4 text-sm">
                      {searchQuery ? 'No members found matching your search' : 'No members found'}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" variant="gradient" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Task'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
