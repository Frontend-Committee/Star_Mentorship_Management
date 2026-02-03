import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Member } from '@/types';
import { cn } from '@/lib/utils';
import { 
  Mail, 
  TrendingUp, 
  CalendarCheck, 
  FileText, 
  FolderKanban, 
  Star,
  StickyNote,
  Save
} from 'lucide-react';

interface MemberProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: Member | null;
  onSaveNotes: (memberId: string, notes: string) => void;
  onToggleBestMember?: (memberId: string) => void;
  isAdmin?: boolean;
}

export function MemberProfileDialog({
  open,
  onOpenChange,
  member,
  onSaveNotes,
  onToggleBestMember,
  isAdmin,
}: MemberProfileDialogProps) {
  const [notes, setNotes] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (member) {
      setNotes(member.adminNotes || '');
      setIsEditing(false);
    }
  }, [member]);

  const handleSaveNotes = () => {
    if (member) {
      onSaveNotes(member.id, notes);
      setIsEditing(false);
    }
  };

  if (!member) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="font-heading">Member Profile</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header with Avatar */}
          <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 border border-border/50">
            <Avatar className="w-16 h-16">
              <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-xl font-medium">
                {member.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-foreground">{member.name}</h3>
                {member.isBest && (
                  <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 text-white border-0">
                    <Star className="w-3 h-3 mr-1 fill-white" />
                    Best Member
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                <Mail className="w-4 h-4" />
                <span>{member.email}</span>
              </div>
            </div>
            {isAdmin && onToggleBestMember && (
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "gap-1.5",
                  member.isBest ? "text-amber-600 border-amber-200 bg-amber-50" : "text-muted-foreground"
                )}
                onClick={() => onToggleBestMember(member.id)}
              >
                <Star className={cn("w-4 h-4", member.isBest && "fill-amber-500 text-amber-500")} />
                {member.isBest ? "Best Member" : "Mark as Best"}
              </Button>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Progress */}
            <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-muted-foreground">Progress</span>
              </div>
              <div className="flex items-center gap-3">
                <Progress value={member.progress} className="h-2 flex-1" />
                <span className="text-lg font-bold text-foreground">{member.progress}%</span>
              </div>
            </div>

            {/* Attendance */}
            <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <CalendarCheck className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-muted-foreground">Attendance</span>
              </div>
              <span
                className={`text-lg font-bold ${
                  member.attendance >= 80
                    ? 'text-green-600 dark:text-green-400'
                    : member.attendance >= 60
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {member.attendance}%
              </span>
            </div>

            {/* Assignments Submitted */}
            <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium text-muted-foreground">Assignments</span>
              </div>
              <span className="text-lg font-bold text-foreground">
                {member.assignmentsSubmitted ?? 0} submitted
              </span>
            </div>

            {/* Projects Completed */}
            <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <FolderKanban className="w-4 h-4 text-purple-500" />
                <span className="text-sm font-medium text-muted-foreground">Projects</span>
              </div>
              <span className="text-lg font-bold text-foreground">
                {member.projectsCompleted ?? 0} completed
              </span>
            </div>
          </div>

          {/* Admin Notes */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <StickyNote className="w-4 h-4 text-amber-500" />
                <Label className="text-sm font-medium">Internal Notes (Admin Only)</Label>
              </div>
              {!isEditing && (
                <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                  Edit
                </Button>
              )}
            </div>
            
            {isEditing ? (
              <div className="space-y-3">
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add internal notes about this member..."
                  className="min-h-[100px] resize-none"
                />
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" size="sm" onClick={() => {
                    setNotes(member.adminNotes || '');
                    setIsEditing(false);
                  }}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSaveNotes}>
                    <Save className="w-4 h-4 mr-1" />
                    Save Notes
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-800/50 min-h-[60px]">
                {notes ? (
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{notes}</p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No notes added yet.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}