import { useState, useMemo } from 'react';
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
import { useCreateWeekItem } from '@/features/weeks/hooks';
import { useCommitteeMembers, useCommitteeGroups } from '@/features/members/hooks';
import { Loader2, Search } from 'lucide-react';
import { CommitteeGroup } from '@/types';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<number | 'all'>('all');
  
  const createItem = useCreateWeekItem();
  const { data: users, isLoading: isLoadingUsers } = useCommitteeMembers();
  const { data: groups } = useCommitteeGroups();

  // Filter members based on search query
  const filteredUsers = useMemo(() => {
    if (!users) return [];
    
    let result = users;

    // Filter by group if selected
    if (selectedGroupFilter !== 'all' && groups) {
      const group = groups.find(g => g.id === selectedGroupFilter);
      if (group?.users) {
        // Handle both full user objects and plain IDs
        const groupUserIds = group.users.map((u: any) => u.id || u);
        result = result.filter(u => u.id && groupUserIds.includes(u.id));
      }
    }

    if (!searchQuery.trim()) return result;
    
    const query = searchQuery.toLowerCase();
    return result.filter(user => {
      const fullName = `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase();
      const email = (user.email || '').toLowerCase();
      return fullName.includes(query) || email.includes(query);
    });
  }, [users, searchQuery, selectedGroupFilter, groups]);

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
        resource: resource.trim() || '',
        notes: notes.trim() || '',
        users: selectedUsers,
      };
      
      console.log('[AddWeekItemDialog] Submitting payload:', JSON.stringify(payload, null, 2));
      
      await createItem.mutateAsync(payload);

      // Reset form
      setTitle('');
      setResource('');
      setNotes('');
      setSelectedUsers([]);
      setSearchQuery('');
      onOpenChange(false);
      toast.success('Item added successfully');
    } catch (error) {
      // Log the full error for debugging
      console.error('[AddWeekItemDialog] Error creating item:', error);
      
      // Extract detailed error message from backend
      let errorMessage = 'Failed to add item';
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: Record<string, unknown> | string; status?: number } };
        const status = axiosError.response?.status;
        const data = axiosError.response?.data;

        console.error('[AddWeekItemDialog] Response status:', status);
        console.error('[AddWeekItemDialog] Response data:', data);

        if (status === 500) {
          errorMessage = 'Server error occurred. Please check the console for details and contact support.';
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
    if (!filteredUsers.length) return;
    
    const allFilteredSelected = filteredUsers.every(u => u.id && selectedUsers.includes(u.id));
    
    if (allFilteredSelected) {
      // Deselect all visible
      const visibleIds = filteredUsers.map(u => u.id!).filter(Boolean);
      setSelectedUsers(prev => prev.filter(id => !visibleIds.includes(id)));
    } else {
      // Select all visible
      const visibleIds = filteredUsers.map(u => u.id!).filter(Boolean);
      setSelectedUsers(prev => {
        const newIds = [...prev];
        visibleIds.forEach(id => {
          if (!newIds.includes(id)) newIds.push(id);
        });
        return newIds;
      });
    }
  };

  const assignGroup = (group: CommitteeGroup) => {
    if (!group.users) return;
    
    // Handle both full user objects and plain IDs
    const groupUserIds = group.users.map((u: any) => u.id || u).filter((id: any): id is number => !!id);
    const allGroupSelected = groupUserIds.every((id: number) => selectedUsers.includes(id));

    if (allGroupSelected) {
      // Deselect group members
      setSelectedUsers(prev => prev.filter(id => !groupUserIds.includes(id)));
    } else {
      // Select group members
      setSelectedUsers(prev => {
        const newIds = [...prev];
        groupUserIds.forEach((id: number) => {
          if (!newIds.includes(id)) newIds.push(id);
        });
        return newIds;
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">Add Item to {weekTitle}</DialogTitle>
          <DialogDescription>
            Add a new resource or task to this week.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 overflow-y-auto flex-1 px-1 custom-scrollbar">
          <div className="space-y-2">
            <Label htmlFor="item-title">Title *</Label>
            <Input
              id="item-title"
              placeholder="e.g., Week Content"
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
              rows={3}
              className="resize-none"
            />
          </div>

          <div className="space-y-3">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <Label className="text-base">Assign Members ({selectedUsers.length})</Label>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={selectAll} 
                  className="h-auto py-1 px-2 text-xs hover:bg-primary/10"
                >
                  {filteredUsers.length > 0 && filteredUsers.every(u => u.id && selectedUsers.includes(u.id)) 
                    ? 'Deselect Visible' 
                    : 'Select Visible'}
                </Button>
              </div>

              {/* Group Quick Select */}
              {groups && groups.length > 0 && (
                <div className="flex flex-wrap gap-2 pb-2">
                  <Button
                    type="button"
                    variant={selectedGroupFilter === 'all' ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => setSelectedGroupFilter('all')}
                    className="h-7 text-xs rounded-full"
                  >
                    All Members
                  </Button>
                  {groups.map(group => {
                    // Handle both full user objects and plain IDs
                    const groupUserIds = group.users?.map((u: any) => u.id || u).filter((id: any) => !!id) || [];
                    const isFullySelected = groupUserIds.length > 0 && groupUserIds.every((id: number) => selectedUsers.includes(id));
                    const isPartiallySelected = !isFullySelected && groupUserIds.some((id: number) => selectedUsers.includes(id));

                    return (
                      <div key={group.id} className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant={selectedGroupFilter === group.id ? "secondary" : "outline"}
                          size="sm"
                          onClick={() => setSelectedGroupFilter(group.id === selectedGroupFilter ? 'all' : group.id)}
                          className={`h-7 text-xs rounded-l-full rounded-r-none border-r-0 ${
                            isFullySelected ? 'bg-primary/10 border-primary/30 text-primary' : ''
                          }`}
                        >
                          {group.name}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => assignGroup(group)}
                          className={`h-7 px-2 text-xs rounded-r-full rounded-l-none border-l ${
                            isFullySelected 
                              ? 'bg-primary text-primary-foreground hover:bg-primary/90 border-primary' 
                              : isPartiallySelected
                              ? 'bg-primary/10 border-primary/30 text-primary hover:bg-primary/20'
                              : 'hover:bg-primary/5'
                          }`}
                          title={isFullySelected ? "Deselect Group" : "Select Group"}
                        >
                          {isFullySelected ? '-' : '+'}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
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
                    const checkboxId = `add-item-user-${user.id}`;
                    
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

          <DialogFooter className="gap-2">
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
              {createItem.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Item'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
