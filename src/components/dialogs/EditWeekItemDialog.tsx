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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MarkdownRenderer } from '@/components/ui/MarkdownRenderer';
import { toast } from 'sonner';
import { useWeekItem, useUpdateWeekItemFull } from '@/features/weeks/hooks';
import { useCommitteeMembers, useCommitteeGroups } from '@/features/members/hooks';
import { Loader2, Search, PlusCircle, Users as UsersIcon } from 'lucide-react';
import { CommitteeGroup, MemberMinimal, WeekProgress } from '@/types';
import { AddMemberDialog } from './AddMemberDialog';
import { useQueryClient } from '@tanstack/react-query';

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
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<number | 'all'>('all');
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false);
  
  const queryClient = useQueryClient();
  const { data: item, isLoading: isLoadingItem } = useWeekItem(itemId);
  const updateItem = useUpdateWeekItemFull(itemId);
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
        const groupUserIds = group.users.map((u: number | MemberMinimal) => 
          typeof u === 'number' ? u : u.id
        ).filter((id): id is number => id !== undefined);
        
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

  // Load item data into form
  useEffect(() => {
    if (item && open) {
      setTitle(item.title || '');
      setResource(item.resource || '');
      setNotes(item.notes || '');
      
      let userIds: number[] = [];
      // Try to extract user IDs from 'users' array first, then fallback to 'week_progress'
      if (item.users && Array.isArray(item.users) && item.users.length > 0) {
        userIds = item.users.map(u => u.user);
      } else if (item.week_progress && Array.isArray(item.week_progress) && item.week_progress.length > 0) {
        // Fallback: extract user IDs from week_progress
        userIds = item.week_progress
          .map(p => {
             const u = (p as WeekProgress).user;
             if (typeof u === 'object' && u !== null) return u.id;
             return u as unknown as number;
          })
          .filter((id): id is number => id !== undefined);
      }

      setSelectedUsers(prev => {
        // Only update if the IDs have actually changed to avoid unnecessary re-renders
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
      const payload: import('@/types').WeekItemCreatePayload = {
        week: parentWeekId,
        title: title.trim(),
        resource: resource.trim() || '',
        notes: notes.trim() || '',
        users: selectedUsers,
      };
      
      await updateItem.mutateAsync(payload);
      
      // Explicitly tell the query client to refresh the weeks list
      // this ensures the "0/X Done" count on the card updates immediately
      await queryClient.invalidateQueries({ queryKey: ['weeks'] });
      await queryClient.refetchQueries({ queryKey: ['weeks'] });
      
      toast.success('Item updated successfully');
      onOpenChange(false);
    } catch (error: any) {
      console.error('[EditWeekItemDialog] Error updating item:', error);
      let errorMessage = 'Failed to update item';
      
      if (error?.response?.data) {
        const data = error.response.data;
        if (typeof data === 'string') errorMessage = data;
        else if (data.detail) errorMessage = data.detail;
        else if (data.error) errorMessage = data.error;
        else {
          const firstKey = Object.keys(data)[0];
          if (firstKey) errorMessage = `${firstKey}: ${JSON.stringify(data[firstKey])}`;
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
    
    const groupUserIds = group.users.map((u: number | MemberMinimal) => 
      typeof u === 'number' ? u : u.id
    ).filter((id): id is number => id !== undefined);
    
    const allGroupSelected = groupUserIds.every((id: number) => selectedUsers.includes(id));

    if (allGroupSelected) {
      setSelectedUsers(prev => prev.filter(id => !groupUserIds.includes(id)));
    } else {
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
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[620px] max-h-[90vh] overflow-hidden flex flex-col">
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
              <Label htmlFor="edit-item-notes">Notes (Markdown Supported)</Label>
              <Tabs defaultValue="edit" className="w-full">
                <TabsList className="grid w-full grid-cols-2 h-9">
                  <TabsTrigger value="edit" className="text-xs">Edit</TabsTrigger>
                  <TabsTrigger value="preview" className="text-xs">Preview</TabsTrigger>
                </TabsList>
                <TabsContent value="edit" className="mt-2">
                  <Textarea
                    id="edit-item-notes"
                    placeholder="Additional instructions... (Markdown supported)"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                </TabsContent>
                <TabsContent value="preview" className="mt-2 min-h-[110px] p-3 border rounded-md bg-muted/20">
                  <MarkdownRenderer content={notes || "*No notes to preview*"} />
                </TabsContent>
              </Tabs>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UsersIcon className="w-4 h-4 text-primary" />
                    <Label className="text-base">Assigned Members ({selectedUsers.length})</Label>
                  </div>
                  <div className="flex items-center gap-2">
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
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setIsAddMemberDialogOpen(true)}
                      className="h-7 text-xs gap-1 border-dashed hover:border-primary hover:text-primary"
                    >
                      <PlusCircle className="w-3 h-3" />
                      New Member
                    </Button>
                  </div>
                </div>

                {/* Group Quick Select */}
                {groups && groups.length > 0 && (
                  <div className="flex flex-wrap gap-2 pb-1">
                    <Button
                      type="button"
                      variant={selectedGroupFilter === 'all' ? "secondary" : "outline"}
                      size="sm"
                      onClick={() => setSelectedGroupFilter('all')}
                      className="h-7 text-xs rounded-full"
                    >
                      All
                    </Button>
                    {groups.map(group => {
                      const groupUserIds = group.users?.map((u: number | MemberMinimal) => 
                        typeof u === 'number' ? u : u.id
                      ).filter((id): id is number => id !== undefined) || [];
                      
                      const isFullySelected = groupUserIds.length > 0 && groupUserIds.every((id: number) => selectedUsers.includes(id));
                      const isPartiallySelected = !isFullySelected && groupUserIds.some((id: number) => selectedUsers.includes(id));

                      return (
                        <div key={group.id} className="flex items-center gap-0">
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
                  placeholder="Search members by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9"
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
    
    <AddMemberDialog 
      open={isAddMemberDialogOpen} 
      onOpenChange={setIsAddMemberDialogOpen} 
      onSuccess={() => {
        toast.success("New member created and ready to be assigned");
      }}
    />
    </>
  );
}
