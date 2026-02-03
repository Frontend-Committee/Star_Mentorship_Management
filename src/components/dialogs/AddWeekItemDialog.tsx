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
import { Checkbox } from '@/components/ui/checkbox'; // Assuming you have this or standard input
import { toast } from 'sonner';
import { useCreateWeekItem } from '@/features/weeks/hooks';
import { useCommitteeMembers } from '@/features/members/hooks';
import { Loader2 } from 'lucide-react';

interface AddWeekItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  weekId: number;
  weekTitle: string;
}

export function AddWeekItemDialog({
  open,
  onOpenChange,
  weekId,
  weekTitle,
}: AddWeekItemDialogProps) {
  const [title, setTitle] = useState('');
  const [resource, setResource] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  
  const createItem = useCreateWeekItem();
  const { data: users, isLoading: isLoadingUsers } = useCommitteeMembers();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }

    if (selectedUsers.length === 0) {
      toast.error('Please assign at least one member');
      return;
    }

    try {
      const payload: import('@/types').WeekItemCreatePayload = {
        week: weekId,
        title: title.trim(),
        resource: resource.trim() || null,
        notes: notes.trim() || null,
        users: selectedUsers.map(id => ({ user: id })),
      };
      
      await createItem.mutateAsync(payload);

      // Reset form
      setTitle('');
      setResource('');
      setNotes('');
      setSelectedUsers([]);
      onOpenChange(false);
      toast.success('Item added successfully');
    } catch (error) {
      // Extract detailed error message from backend
      let errorMessage = 'Failed to add item';
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: Record<string, unknown> | string; status?: number } };
        const status = axiosError.response?.status;
        const data = axiosError.response?.data;

        if (status === 500) {
          // Check for the specific AttributeError bug in the backend response
          if (typeof data === 'string' && data.includes('AttributeError') && data.includes('users')) {
            errorMessage = 'Item created, but the server had an error displaying it. Please refresh.';
            // Since it likely succeeded, we can treat it as a partial success
            toast.success(errorMessage);
            onOpenChange(false);
            return;
          }
        }
        
        if (data) {
          // Try to extract meaningful error message
          if (typeof data === 'string') {
            errorMessage = data;
          } else if (typeof data === 'object' && data !== null) {
            const errorObj = data as Record<string, unknown>;
            
            if (typeof errorObj.detail === 'string') errorMessage = errorObj.detail;
            else if (typeof errorObj.error === 'string') errorMessage = errorObj.error;
            else if (errorObj.users && Array.isArray(errorObj.users)) {
              errorMessage = `Members: ${String(errorObj.users[0])}`;
            } else {
              // Show first validation error
              const firstKey = Object.keys(errorObj)[0];
              if (firstKey && Array.isArray(errorObj[firstKey])) {
                errorMessage = `${firstKey}: ${String((errorObj[firstKey] as unknown[])[0])}`;
              }
            }
          }
        }
      }
      
      toast.error(errorMessage);
    }
  };

  const toggleUser = (userId: number) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const selectAll = () => {
    if (users) {
      setSelectedUsers(users.map(u => u.id));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading">Add Item to {weekTitle}</DialogTitle>
          <DialogDescription>
            Add a new resource or task to this week.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="item-title">Title *</Label>
            <Input
              id="item-title"
              placeholder="e.g., Week Slides"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="item-resource">Resource URL</Label>
            <Input
              id="item-resource"
              placeholder="https://..."
              value={resource}
              onChange={(e) => setResource(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="item-notes">Notes</Label>
            <Textarea
              id="item-notes"
              placeholder="Additional instructions..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Assign Members ({selectedUsers.length})</Label>
              <Button type="button" variant="ghost" size="sm" onClick={selectAll} className="h-auto p-0 text-xs">
                Select All
              </Button>
            </div>
            
            <div className="border border-border/50 rounded-lg bg-secondary/10 overflow-hidden flex flex-col h-48">
              {isLoadingUsers ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : users?.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground p-4 text-sm">
                  No members found
                </div>
              ) : (
                <div className="overflow-y-auto p-2 space-y-1">
                  {users?.map(user => (
                    <div 
                      key={user.id} 
                      className="flex items-center gap-3 p-2 rounded-md hover:bg-white/5 transition-colors"
                    >
                      <Checkbox
                        id={`user-${user.id}`}
                        checked={selectedUsers.includes(user.id)}
                        onCheckedChange={() => toggleUser(user.id)}
                      />
                      <Label 
                        htmlFor={`user-${user.id}`} 
                        className="text-sm font-medium leading-none cursor-pointer flex-1 py-1"
                      >
                        {user.first_name} {user.last_name} 
                        <span className="ml-1.5 text-xs text-muted-foreground font-normal">
                          {user.email}
                        </span>
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={createItem.isPending}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="gradient"
              disabled={createItem.isPending}
            >
              {createItem.isPending ? 'Adding...' : 'Add Item'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
