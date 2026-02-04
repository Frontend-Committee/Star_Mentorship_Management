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
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { useWeekItem, useUpdateWeekItem } from '@/features/weeks/hooks';
import { useCommitteeMembers } from '@/features/members/hooks';
import { Loader2 } from 'lucide-react';

interface EditWeekItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemId: number;
  weekId: number;
}

export function EditWeekItemDialog({
  open,
  onOpenChange,
  itemId,
  weekId,
}: EditWeekItemDialogProps) {
  const [title, setTitle] = useState('');
  const [resource, setResource] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  
  const { data: item, isLoading: isLoadingItem } = useWeekItem(itemId);
  const updateItem = useUpdateWeekItem(itemId);
  const { data: users, isLoading: isLoadingUsers } = useCommitteeMembers();

  // Load item data into form
  useEffect(() => {
    if (item) {
      setTitle(item.title || '');
      setResource(item.resource || '');
      setNotes(item.notes || '');
      if (item.users) {
        setSelectedUsers(item.users.map(u => u.user));
      }
    }
  }, [item]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }

    // Determine the week ID - use prop as fallback for item.week
    const parentWeekId = item?.week || weekId;

    if (!parentWeekId) {
      toast.error('Parent week ID not found');
      return;
    }

    if (selectedUsers.length === 0) {
      toast.error('Please assign at least one member');
      return;
    }

    try {
      const payload: Partial<import('@/types').WeekItemCreatePayload> = {
        week: parentWeekId,
        title: title.trim(),
        resource: resource.trim() || null,
        notes: notes.trim() || null,
        users: selectedUsers.map(id => ({ user: id })),
      };
      
      await updateItem.mutateAsync(payload);
      toast.success('Item updated successfully');
      onOpenChange(false);
    } catch (error) {
      // Extract detailed error message from backend
      let errorMessage = 'Failed to update item';
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: Record<string, unknown> | string; status?: number } };
        const status = axiosError.response?.status;
        const data = axiosError.response?.data;

        if (status === 500) {
          // Check for the specific AttributeError bug in the backend response
          if (typeof data === 'string' && data.includes('AttributeError') && data.includes('users')) {
            errorMessage = 'Item updated, but the server had an error displaying it. Please refresh.';
            toast.success(errorMessage);
            onOpenChange(false);
            return;
          }
        }
        
        if (data) {
          if (typeof data === 'string') {
            errorMessage = data;
          } else if (typeof data === 'object' && data !== null) {
            const errorObj = data as Record<string, unknown>;
            if (typeof errorObj.detail === 'string') errorMessage = errorObj.detail;
            else if (typeof errorObj.error === 'string') errorMessage = errorObj.error;
            else {
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
          <DialogTitle className="font-heading">Edit Item</DialogTitle>
          <DialogDescription>
            Modify the resource or member assignments.
          </DialogDescription>
        </DialogHeader>

        {isLoadingItem ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-item-title">Title *</Label>
              <Input
                id="edit-item-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-item-resource">Resource URL</Label>
              <Input
                id="edit-item-resource"
                value={resource}
                onChange={(e) => setResource(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-item-notes">Notes</Label>
              <Textarea
                id="edit-item-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Assigned Members ({selectedUsers.length})</Label>
                <Button type="button" variant="ghost" size="sm" onClick={selectAll} className="h-auto p-0 text-xs">
                  Select All
                </Button>
              </div>
              <div className="border border-border/50 rounded-lg bg-secondary/10 overflow-hidden flex flex-col h-48">
                {isLoadingUsers ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading members...
                  </div>
                ) : (
                  <div className="overflow-y-auto p-2 space-y-1">
                    {users?.map(user => (
                      <div key={user.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-white/5 transition-colors">
                        <Checkbox
                          id={`edit-user-${user.id}`}
                          checked={selectedUsers.includes(user.id)}
                          onCheckedChange={() => toggleUser(user.id)}
                        />
                        <Label 
                          htmlFor={`edit-user-${user.id}`} 
                          className="text-sm font-medium leading-none cursor-pointer flex-1 py-1"
                        >
                          {user.first_name} {user.last_name}
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="gradient"
                disabled={updateItem.isPending}
              >
                {updateItem.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
