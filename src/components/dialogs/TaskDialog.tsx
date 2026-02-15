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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MarkdownRenderer } from '@/components/ui/MarkdownRenderer';
import { useCommitteeMembers, useCommitteeGroups } from '@/features/members/hooks';
import { Task, TaskCreatePayload, CommitteeGroup } from '@/types';
import { Loader2, Search, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useEffect, useState, useMemo } from 'react';

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
  const [link, setLink] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: users, isLoading: isLoadingUsers } = useCommitteeMembers();
  const { data: groups, isLoading: isLoadingGroups } = useCommitteeGroups();
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<number | 'all'>('all');

  // Filter members based on search query
  const filteredUsers = useMemo(() => {
    if (!users) return [];
    
    let result = users;

    // Filter by group if selected
    if (selectedGroupFilter !== 'all' && groups) {
      const group = groups.find(g => g.id === selectedGroupFilter);
      if (group?.users) {
        const groupUserIds = group.users.map((u: import('@/types').User | number) => 
          typeof u === 'number' ? u : u.id
        );
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

  useEffect(() => {
    if (open && task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setLink(task.link || '');
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

    // Convert date to ISO format for backend (YYYY-MM-DDThh:mm:ssZ)
    const isoDate = new Date(date).toISOString();

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      date: isoDate,
      link: link.trim() || null,
      users: selectedUsers,
      assigned_to: selectedUsers,
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
    
    const groupUserIds = group.users.map((u: import('@/types').User | number) => 
      typeof u === 'number' ? u : u.id
    ).filter((id): id is number => !!id);
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
      <DialogContent className="w-[95vw] sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col p-4 sm:p-6 transition-all">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">
            {task ? (new Date(task.date) < new Date() ? 'Re-open & Edit Task' : 'Edit Task') : 'Create New Task'}
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
            <Label htmlFor="description">Description (Markdown Supported)</Label>
            <Tabs defaultValue="edit" className="w-full">
              <TabsList className="grid w-full grid-cols-2 h-9">
                <TabsTrigger value="edit" className="text-xs">Edit</TabsTrigger>
                <TabsTrigger value="preview" className="text-xs">Preview</TabsTrigger>
              </TabsList>
              <TabsContent value="edit" className="mt-2">
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Task details and requirements... (Markdown supported)"
                  rows={6}
                  className="resize-none"
                />
              </TabsContent>
              <TabsContent value="preview" className="mt-2 min-h-[148px] p-3 border rounded-md bg-muted/20">
                <MarkdownRenderer content={description || "*No description to preview*"} />
              </TabsContent>
            </Tabs>
          </div>
          <div className="space-y-2">
            <Label htmlFor="link">Resource Link (Optional)</Label>
            <Input
              id="link"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div className="space-y-3">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <Label className="text-base">Assign to Members ({selectedUsers.length})</Label>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={toggleAll} 
                  className="h-auto py-1 px-2 text-xs hover:bg-primary/10 transition-colors"
                >
                  {filteredUsers.length > 0 && filteredUsers.every(u => u.id && selectedUsers.includes(u.id)) 
                    ? 'Deselect Visible' 
                    : 'Select Visible'}
                </Button>
              </div>

              <div className="bg-primary/5 p-3 rounded-lg border border-primary/10 space-y-3">
                <Label className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">Quick Select Groups</Label>

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
                    const groupUserIds = group.users?.map((u: import('@/types').User | number) => 
                      typeof u === 'number' ? u : u.id
                    ).filter((id): id is number => !!id) || [];
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
                          className="text-sm font-medium leading-none cursor-pointer flex-1 py-1 min-w-0"
                        >
                          <div className="flex flex-col gap-0.5 min-w-0">
                            <span className="truncate">{user.first_name} {user.last_name}</span>
                            <span className="text-xs text-muted-foreground font-normal truncate">
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

          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-border/50 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              Cancel
            </Button>
            <Button type="submit" variant="gradient" disabled={isLoading} className="w-full sm:w-auto order-1 sm:order-2">
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                task ? 'Update Task' : 'Create Task'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
