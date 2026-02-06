import { useState, useMemo, useEffect } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useUpdateCommitteeGroup, useCommitteeMembers, useCommitteeGroups } from '@/features/members/hooks';
import { CommitteeGroup } from '@/types';
import { Loader2, Search, Users } from 'lucide-react';
import { toast } from 'sonner';

interface EditGroupDialogProps {
  group: CommitteeGroup;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function EditGroupDialog({ group, open, onOpenChange, onSuccess }: EditGroupDialogProps) {
  const [name, setName] = useState(group.name);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<number[]>(
    group.users.map(u => u.id).filter((id): id is number => id !== undefined)
  );

  const { data: members, isLoading: isLoadingMembers } = useCommitteeMembers();
  const { data: groups } = useCommitteeGroups();
  const updateGroup = useUpdateCommitteeGroup(group.id);

  const assignedUserMapping = useMemo(() => {
    const mapping = new Map<number, string>();
    if (!groups) return mapping;
    groups.forEach(g => {
      // Don't show the current group as an assignment conflict
      if (g.id === group.id) return;
      g.users?.forEach(u => {
        if (u.id) mapping.set(u.id, g.name);
      });
    });
    return mapping;
  }, [groups, group.id]);

  // Sync state when group prop changes or dialog opens
  useEffect(() => {
    if (open) {
      setName(group.name);
      setSelectedUsers(group.users.map(u => u.id).filter((id): id is number => id !== undefined));
    }
  }, [group, open]);

  const filteredMembers = useMemo(() => {
    if (!members) return [];
    const query = searchQuery.toLowerCase();
    return members
      .filter(member => 
        `${member.first_name} ${member.last_name}`.toLowerCase().includes(query) ||
        member.email?.toLowerCase().includes(query)
      )
      .sort((a, b) => {
        const aSelected = selectedUsers.includes(a.id!);
        const bSelected = selectedUsers.includes(b.id!);
        if (aSelected && !bSelected) return -1;
        if (!aSelected && bSelected) return 1;

        const aAssigned = assignedUserMapping.has(a.id!);
        const bAssigned = assignedUserMapping.has(b.id!);
        if (!aAssigned && bAssigned) return -1;
        if (aAssigned && !bAssigned) return 1;

        return 0;
      });
  }, [members, searchQuery, selectedUsers, assignedUserMapping]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Group name is required');
      return;
    }
    if (selectedUsers.length === 0) {
      toast.error('Please select at least one member');
      return;
    }

    try {
      await updateGroup.mutateAsync({
        name: name.trim(),
        users: selectedUsers,
      });
      toast.success('Group updated successfully');
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast.error('Failed to update group');
      console.error(error);
    }
  };

  const toggleUser = (userId: number) => {
    if (userId === undefined || userId === null) return;
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const selectAll = () => {
    if (members) {
      const allIds = members.map(m => m.id).filter((id): id is number => id !== undefined);
      setSelectedUsers(allIds);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-xl font-heading">Edit Committee Group</DialogTitle>
          <DialogDescription>
            Update group name and manage member assignments.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 overflow-hidden flex flex-col flex-1">
          <div className="space-y-4 px-1 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-group-name">Group Name</Label>
              <Input
                id="edit-group-name"
                placeholder="e.g., Content Creators, Logistics Team..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-3 flex flex-col flex-1 overflow-hidden">
              <div className="flex items-center justify-between">
                <Label className="text-base">Manage Members ({selectedUsers.length})</Label>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={selectAll}
                  className="h-auto py-1 px-2 text-xs"
                >
                  Select All
                </Button>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search committee members..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>

              <div className="border rounded-lg bg-muted/20 overflow-y-auto h-[250px] custom-scrollbar">
                {isLoadingMembers ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : filteredMembers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2 p-4">
                    <Users className="w-8 h-8 opacity-20" />
                    <p className="text-sm">No members found</p>
                  </div>
                ) : (
                  <div className="p-2 space-y-1">
                    {filteredMembers.map((member, index) => (
                      <div 
                        key={member.id || index}
                        className={`flex items-center gap-3 p-2.5 rounded-lg transition-all cursor-pointer border ${
                          selectedUsers.includes(member.id!) 
                            ? 'border-primary bg-primary/5' 
                            : 'border-transparent hover:bg-muted/50'
                        }`}
                        onClick={() => toggleUser(member.id!)}
                      >
                        <div onClick={(e) => e.stopPropagation()}>
                          <Checkbox 
                            checked={selectedUsers.includes(member.id!)}
                            onCheckedChange={() => toggleUser(member.id!)}
                            id={`edit-user-${member.id}`}
                          />
                        </div>
                        <Avatar className="w-8 h-8 border border-background">
                          <AvatarFallback className="text-[10px] font-bold">
                            {member.first_name?.[0]}{member.last_name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold truncate leading-none flex items-center gap-2">
                            {member.first_name} {member.last_name}
                            {assignedUserMapping.has(member.id!) && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">
                                In: {assignedUserMapping.get(member.id!)}
                              </span>
                            )}
                          </p>
                          <p className="text-[10px] text-muted-foreground truncate mt-1">
                            {member.email}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={updateGroup.isPending}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="gradient" 
              disabled={updateGroup.isPending}
            >
              {updateGroup.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
