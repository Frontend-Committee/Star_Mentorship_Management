import { useState, useEffect } from 'react';
import { ConfirmDialog } from './ConfirmDialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Member } from '@/types';
import { cn } from '@/lib/utils';
import { 
  Mail, 
  TrendingUp, 
 
  FileText, 
  Star,
  StickyNote,
  Save,
  Trash2,
  Shield,
  Plus
} from 'lucide-react';

interface MemberProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: Member | null;
  onSaveNotes: (memberId: string, notes: string) => void;
  onToggleBestMember?: (memberId: string) => void;
  onDeleteMember?: (memberId: string, password?: string) => void;
  isAdmin?: boolean;
}

export function MemberProfileDialog({
  open,
  onOpenChange,
  member,
  onSaveNotes,
  onToggleBestMember,
  onDeleteMember,
  isAdmin,
}: MemberProfileDialogProps) {
  const [notes, setNotes] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');

  useEffect(() => {
    if (member) {
      setNotes(member.adminNotes || '');
      setIsEditing(false);
      setDeletePassword('');
      setShowDeleteConfirm(false);
    }
  }, [member, open]);

  const handleSaveNotes = () => {
    if (member) {
      onSaveNotes(member.id, notes);
      setIsEditing(false);
    }
  };

  if (!member) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden border-border/40 bg-background/95 backdrop-blur-xl shadow-2xl">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl font-heading font-bold flex items-center gap-2">
            <span className="w-1.5 h-6 bg-primary rounded-full" />
            Member Profile
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-8 max-h-[85vh] overflow-y-auto custom-scrollbar">
          {/* Hero Section */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
            <div className="relative flex flex-col sm:flex-row items-center gap-6 p-5 rounded-2xl bg-card border border-border/50 shadow-sm">
              <div className="relative">
                <Avatar className="w-20 h-20 sm:w-24 sm:h-24 ring-4 ring-background shadow-xl">
                  <AvatarFallback className="bg-gradient-to-br from-primary via-primary/80 to-accent text-primary-foreground text-2xl font-bold">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                {member.isBest && (
                  <div className="absolute -top-2 -right-2 p-1.5 rounded-full bg-amber-400 text-white shadow-lg animate-bounce-subtle">
                    <Star className="w-4 h-4 fill-white" />
                  </div>
                )}
              </div>

              <div className="flex-1 text-center sm:text-left space-y-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h3 className="text-2xl font-bold text-foreground tracking-tight">{member.name}</h3>
                  {member.level && (
                    <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-bold px-2 py-0">
                      LEVEL {member.level}
                    </Badge>
                  )}
                </div>
                <div className="flex flex-col items-center sm:items-start gap-1 pb-2">
                  <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm font-medium">{member.email}</span>
                  </div>
                </div>

                {isAdmin && onToggleBestMember && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "h-8 rounded-full border border-transparent transition-all duration-300",
                      member.isBest 
                        ? "bg-amber-100/50 text-amber-600 border-amber-200 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/50" 
                        : "hover:bg-primary/5 text-muted-foreground hover:text-primary"
                    )}
                    onClick={() => onToggleBestMember(member.id)}
                  >
                    <Star className={cn("w-3.5 h-3.5 mr-1.5", member.isBest && "fill-amber-500")} />
                    {member.isBest ? "Best of Week" : "Mark as Best"}
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-card border border-border/40 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-primary">
                <TrendingUp className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">Progress</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <span className="text-2xl font-bold tabular-nums">{member.progress}%</span>
                </div>
                <Progress value={member.progress} className="h-1.5 bg-primary/10" />
              </div>
            </div>



            <div className="p-4 rounded-xl bg-card border border-border/40 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-purple-500">
                <FileText className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">Submissions</span>
              </div>
              <div className="space-y-1">
                <span className="text-2xl font-bold tabular-nums block text-foreground">
                  {member.tasksSubmitted ?? 0}
                </span>
                <p className="text-[10px] text-muted-foreground font-medium uppercase">Total Tasks</p>
              </div>
            </div>
          </div>

          {/* Internal Notes */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-foreground/80">
                <StickyNote className="w-4 h-4 text-amber-500" />
                <Label className="text-sm font-bold">Internal Admin Notes</Label>
              </div>
              {!isEditing && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-7 text-[10px] font-bold uppercase"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Notes
                </Button>
              )}
            </div>
            
            {isEditing ? (
              <div className="space-y-3 animate-in fade-in zoom-in-95 duration-200">
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Annotate member's performance here..."
                  className="min-h-[120px] bg-muted/30 border-border/60 focus:border-primary/50 resize-none rounded-xl"
                />
                <div className="flex gap-2 justify-end">
                  <Button variant="ghost" size="sm" onClick={() => {
                    setNotes(member.adminNotes || '');
                    setIsEditing(false);
                  }}>
                    Cancel
                  </Button>
                  <Button size="sm" className="shadow-lg shadow-primary/20 rounded-lg px-4" onClick={handleSaveNotes}>
                    <Save className="w-3.5 h-3.5 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-muted/20 border border-dashed border-border/60 min-h-[80px]">
                {notes ? (
                  <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{notes}</p>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center opacity-40 py-2">
                    <Plus className="w-5 h-5 mb-1" />
                    <p className="text-xs font-medium uppercase tracking-widest">No notes yet</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Danger Zone */}
          {isAdmin && onDeleteMember && (
            <div className="pt-2">
              {!showDeleteConfirm ? (
                <Button 
                  variant="ghost" 
                  className="w-full h-11 text-destructive hover:bg-destructive/10 hover:text-destructive border border-transparent hover:border-destructive/20 rounded-xl transition-all duration-300"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remove Member from Archive
                </Button>
              ) : (
                <div className="p-5 rounded-2xl bg-destructive/5 border border-destructive/20 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex items-start gap-3 text-destructive">
                    <Shield className="w-5 h-5 mt-0.5 shrink-0" />
                    <div className="space-y-1">
                      <p className="text-sm font-bold">Confirm Account Deletion</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        This will permanently delete <span className="font-bold text-foreground">{member.name}</span>. 
                        To confirm, please enter your administrative password below.
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <Input
                      id="delete-password"
                      type="password"
                      placeholder="Enter Current Password"
                      value={deletePassword}
                      onChange={(e) => setDeletePassword(e.target.value)}
                      className="bg-background border-destructive/30 focus-visible:ring-destructive h-10 rounded-lg"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        className="flex-1 h-10 rounded-lg"
                        onClick={() => {
                          setShowDeleteConfirm(false);
                          setDeletePassword('');
                        }}
                      >
                        Abort
                      </Button>
                      <Button 
                        variant="destructive" 
                        className="flex-1 h-10 rounded-lg shadow-lg shadow-destructive/20 font-bold"
                        onClick={() => onDeleteMember(member.id, deletePassword)}
                        disabled={!deletePassword}
                      >
                        Confirm Delete
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}