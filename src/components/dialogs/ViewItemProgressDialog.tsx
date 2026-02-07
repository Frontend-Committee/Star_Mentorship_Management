import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, Loader2, MessageSquare, Save } from 'lucide-react';
import { useWeekItem, useCreateProgress, useUpdateProgress } from '@/features/weeks/hooks';
import { toast } from 'sonner';
import { WeekProgress } from '@/types';

interface ViewItemProgressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemId: number;
}

export function ViewItemProgressDialog({
  open,
  onOpenChange,
  itemId,
}: ViewItemProgressDialogProps) {
  const { data: item, isLoading } = useWeekItem(itemId);
  const createProgress = useCreateProgress();
  const updateProgress = useUpdateProgress();
  
  const [editingNotes, setEditingNotes] = useState<Record<number, string>>({});

  const handleToggle = async (progress: WeekProgress, userId: number) => {
    try {
      if (progress.id) {
        // Toggle existing record using PATCH
        await updateProgress.mutateAsync({
          id: progress.id,
          data: {
            is_finished: !progress.is_finished,
            notes: editingNotes[userId] ?? progress.notes,
          }
        });
      } else {
        // Create new record using POST
        await createProgress.mutateAsync({
          user: userId,
          week_item: itemId,
          is_finished: true,
          notes: editingNotes[userId] || "",
        });
      }
      toast.success('Progress updated');
    } catch (error) {
      toast.error('Failed to update progress');
    }
  };

  const handleNoteChange = (userId: number, note: string) => {
    setEditingNotes(prev => ({ ...prev, [userId]: note }));
  };

  const handleSaveNote = async (progress: WeekProgress, userId: number) => {
    if (!progress.id) {
      toast.error('Please mark as finished first to save notes');
      return;
    }
    
    try {
      await updateProgress.mutateAsync({
        id: progress.id,
        data: { notes: editingNotes[userId] }
      });
      toast.success('Note saved');
    } catch (error) {
      toast.error('Failed to save note');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-primary" />
            Member Progress
          </DialogTitle>
          <DialogDescription>
            Tracking completion for <span className="font-semibold text-foreground">{item?.title}</span>
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            {Array.isArray(item?.week_progress) && item.week_progress.length > 0 ? (
              item.week_progress.map((p: WeekProgress) => {
                const userId = p.user?.id;
                if (!userId) return null;
                
                return (
                  <div key={userId} className="flex flex-col gap-3 p-3 sm:p-4 rounded-xl bg-muted/30 border border-border/50 hover:border-primary/20 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`p-2 rounded-full shrink-0 ${p.is_finished ? 'bg-green-100/50 text-green-600' : 'bg-muted text-muted-foreground'}`}>
                          {p.is_finished ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold truncate leading-tight">
                            {p.user?.first_name} {p.user?.last_name}
                          </p>
                          <p className="text-[11px] text-muted-foreground truncate">{p.user?.email}</p>
                        </div>
                      </div>
                      
                      <Button 
                        variant={p.is_finished ? "outline" : "default"} 
                        size="sm" 
                        className={`h-8 shrink-0 text-xs font-semibold sm:w-auto w-full ${p.is_finished ? 'border-green-200 text-green-700 hover:bg-green-50' : ''}`}
                        onClick={() => handleToggle(p, userId)}
                        disabled={createProgress.isPending || updateProgress.isPending}
                      >
                        {p.is_finished ? 'Finished' : 'Mark Finished'}
                      </Button>
                    </div>

                    <div className="flex items-center gap-2 sm:pl-11">
                      <div className="relative flex-1">
                        <MessageSquare className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                        <Input
                          placeholder="Add progress notes..."
                          className="h-9 pl-8 text-xs bg-background/50 border-none focus-visible:ring-1 focus-visible:ring-primary/30"
                          value={editingNotes[userId] !== undefined ? editingNotes[userId] : (p.notes || "")}
                          onChange={(e) => handleNoteChange(userId, e.target.value)}
                        />
                      </div>
                      {editingNotes[userId] !== undefined && editingNotes[userId] !== (p.notes || "") && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-primary hover:bg-primary/10 shrink-0"
                          onClick={() => handleSaveNote(p, userId)}
                          disabled={updateProgress.isPending}
                        >
                          <Save className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 bg-secondary/10 rounded-2xl border-2 border-dashed border-border/50">
                <p className="text-sm text-muted-foreground font-medium">No members assigned to this item.</p>
                <p className="text-[11px] text-muted-foreground mt-1 px-8 leading-relaxed">
                  Use the <span className="italic font-semibold px-1">Pencil Icon</span> on the week item list to assign members and track their progress here.
                </p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
