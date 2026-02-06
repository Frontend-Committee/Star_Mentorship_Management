import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useCreateCommitteeGroup, useCommitteeMembers } from '@/features/members/hooks';
import { Loader2, Plus, Search, Users } from 'lucide-react';
import { toast } from 'sonner';

interface AddGroupDialogProps {
  onSuccess?: () => void;
}

export function AddGroupDialog({ onSuccess }: AddGroupDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);

  const { data: members, isLoading: isLoadingMembers } = useCommitteeMembers();
  const createGroup = useCreateCommitteeGroup();

  const filteredMembers = useMemo(() => {
    if (!members) return [];
    const query = searchQuery.toLowerCase();
    return members.filter(member => 
      `${member.first_name} ${member.last_name}`.toLowerCase().includes(query) ||
      member.email?.toLowerCase().includes(query)
    );
  }, [members, searchQuery]);

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
      await createGroup.mutateAsync({
        name: name.trim(),
        users: selectedUsers,
      });
      toast.success('Group created successfully');
      setName('');
      setSelectedUsers([]);
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      toast.error('Failed to create group');
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="gradient" className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Group
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-xl font-heading">Create Committee Group</DialogTitle>
          <DialogDescription>
            Organize committee members into a new collaborative group.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 overflow-hidden flex flex-col flex-1">
          <div className="space-y-4 px-1 py-2">
            <div className="space-y-2">
              <Label htmlFor="group-name">Group Name</Label>
              <Input
                id="group-name"
                placeholder="e.g., Content Creators, Logistics Team..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-3 flex flex-col flex-1 overflow-hidden">
              <div className="flex items-center justify-between">
                <Label className="text-base">Select Members ({selectedUsers.length})</Label>
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
                            id={`user-${member.id}`}
                          />
                        </div>
                        <Avatar className="w-8 h-8 border border-background">
                          <AvatarFallback className="text-[10px] font-bold">
                            {member.first_name?.[0]}{member.last_name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold truncate leading-none">
                            {member.first_name} {member.last_name}
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
              onClick={() => setOpen(false)}
              disabled={createGroup.isPending}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="gradient" 
              disabled={createGroup.isPending}
            >
              {createGroup.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Group'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
