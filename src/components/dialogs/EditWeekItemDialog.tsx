import { useState, useEffect, useMemo } from 'react';
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
import { useWeekItem, useUpdateWeekItem, useUpdateWeekItemFull } from '@/features/weeks/hooks';
import { useCommitteeMembers } from '@/features/members/hooks';
import { Loader2, Search } from 'lucide-react';

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
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: item, isLoading: isLoadingItem } = useWeekItem(itemId);
  const updateItem = useUpdateWeekItemFull(itemId);
  const { data: users, isLoading: isLoadingUsers } = useCommitteeMembers();

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

  // Load item data into form
  useEffect(() => {
    if (item && open) {
      setTitle(t => t === (item.title || '') ? t : (item.title || ''));
      setResource(r => r === (item.resource || '') ? r : (item.resource || ''));
      setNotes(n => n === (item.notes || '') ? n : (item.notes || ''));
      
      let userIds: number[] = [];
      // Try to extract user IDs from 'users' array first, then fallback to 'week_progress'
      if (item.users && Array.isArray(item.users) && item.users.length > 0) {
        userIds = item.users.map(u => u.user);
      } else if (item.week_progress && Array.isArray(item.week_progress) && item.week_progress.length > 0) {
        // Fallback: extract user IDs from week_progress
        userIds = item.week_progress
          .map(p => p.user?.id)
          .filter((id): id is number => id !== undefined);
      }

      // Only set if content actually changes to avoid re-renders
      setSelectedUsers(prev => {
        if (JSON.stringify(prev) === JSON.stringify(userIds)) return prev;
        return userIds;
      });
    }
  }, [item, open]);

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
      const payload: import('@/types').WeekItemCreatePayload = { // Changed payload type
        week: parentWeekId,
        title: title.trim(),
        resource: resource.trim() || '',
        notes: notes.trim() || '',
        users: selectedUsers,
      };
      
      console.log('[EditWeekItemDialog] Updating item with payload:', JSON.stringify(payload, null, 2)); // Added console.log
      
      await updateItem.mutateAsync(payload);
      toast.success('Item updated successfully');
      onOpenChange(false);
    } catch (error) {
      // Log the full error for debugging
      console.error('[EditWeekItemDialog] Error updating item:', error); // Added console.error
      
      // Extract detailed error message from backend
      let errorMessage = 'Failed to update item';
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: Record<string, unknown> | string; status?: number } };
        const status = axiosError.response?.status;
        const data = axiosError.response?.data;

        console.error('[EditWeekItemDialog] Response status:', status); // Added console.error
        console.error('[EditWeekItemDialog] Response data:', data); // Added console.error

        if (status === 500) {
          errorMessage = 'Server error occurred. Please check the console for details and contact support.'; // Improved 500 error message
        }
        
        if (data) {
          // Try to extract meaningful error message
          if (typeof data === 'string') {
            errorMessage = data;
          } else if (typeof data === 'object' && data !== null) {
            const errorObj = data as Record<string, unknown>;
            
            // Helper to stringify complex error values
            const formatErrorValue = (val: unknown): string => {
              if (Array.isArray(val)) {
                return val.map(v => typeof v === 'object' ? JSON.stringify(v) : String(v)).join(', ');
              }
              if (typeof val === 'object' && val !== null) {
                return JSON.stringify(val);
              }
              return String(val);
            };

            if (typeof errorObj.detail === 'string') errorMessage = errorObj.detail;
            else if (typeof errorObj.error === 'string') errorMessage = errorObj.error;
            else {
              // Show first validation error
              const firstKey = Object.keys(errorObj)[0];
              if (firstKey) {
                errorMessage = `${firstKey}: ${formatErrorValue(errorObj[firstKey])}`;
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
      const validUserIds = users.map(u => u.id).filter((id): id is number => id !== undefined);
      setSelectedUsers(validUserIds);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">Edit Item</DialogTitle>
          <DialogDescription>
            Modify the resource or member assignments.
          </DialogDescription>
        </DialogHeader>

        {isLoadingItem ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 overflow-y-auto flex-1 px-1 custom-scrollbar">
            <div className="space-y-2">
              <Label htmlFor="edit-item-title">Title *</Label>
              <Input
                id="edit-item-title"
                placeholder="e.g., Week Content"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-item-resource">Resource URL</Label>
              <Input
                id="edit-item-resource"
                placeholder="https://..."
                value={resource}
                onChange={(e) => setResource(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-item-notes">Notes</Label>
              <Textarea
                id="edit-item-notes"
                placeholder="Additional instructions..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base">Assigned Members ({selectedUsers.length})</Label>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={selectAll} 
                  className="h-auto py-1 px-2 text-xs hover:bg-primary/10"
                >
                  Select All
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
                ) : filteredUsers.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground p-4 text-sm">
                    {searchQuery ? 'No members found matching your search' : 'No members found'}
                  </div>
                ) : (
                  <div className="overflow-y-auto p-2 space-y-1 custom-scrollbar">
                    {filteredUsers.map(user => {
                      if (!user.id) return null;
                      const isSelected = selectedUsers.includes(user.id);
                      const checkboxId = `edit-item-user-${user.id}`;
                      
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
                  </div>
                )}
              </div>
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={updateItem.isPending}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="gradient"
                disabled={updateItem.isPending}
              >
                {updateItem.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
