import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Session } from '@/types';
import { Calendar, Clock, Edit, Globe, MapPin, Trash2, UsersIcon } from 'lucide-react';

interface SessionDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: Session | null;
  onEdit?: (session: Session) => void;
  onDelete?: (session: Session) => void;
}

export function SessionDetailsDialog({ open, onOpenChange, session, onEdit, onDelete }: SessionDetailsDialogProps) {
  if (!session) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">{session.title}</DialogTitle>
          <DialogDescription>
            Session Details
          </DialogDescription>
        </DialogHeader>

        {/* Session Info */}
        <div className="flex flex-col gap-3 p-4 rounded-lg bg-muted/50 border border-border/50 my-2">
          <div className="flex flex-col gap-3 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary shrink-0" />
              <span className="font-medium">
                {(() => {
                  const d = new Date(session.date);
                  return !isNaN(d.getTime()) 
                    ? d.toLocaleDateString(undefined, { dateStyle: 'long' })
                    : session.date || 'No Date';
                })()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary shrink-0" />
              <span className="font-medium">{session.start_time} - {session.end_time}</span>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <span className="font-medium break-words" title={session.location}>
                {session.location}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {session.type === 'online' ? (
                <>
                  <Globe className="w-4 h-4 text-blue-500 shrink-0" />
                  <span className="font-medium text-blue-600 dark:text-blue-400">Online Session</span>
                </>
              ) : (
                <>
                  <UsersIcon className="w-4 h-4 text-orange-500 shrink-0" />
                  <span className="font-medium text-orange-600 dark:text-orange-400">Offline Session</span>
                </>
              )}
            </div>
          </div>
          {session.note && (
            <div className="text-sm text-muted-foreground mt-2 border-t pt-2 border-border/50">
              <span className="font-medium text-foreground block mb-1">Note:</span>
              {session.note}
            </div>
          )}
        </div>

        <DialogFooter className="mt-2 border-t pt-4">
          <div className="flex justify-between w-full">
            {onDelete ? (
              <Button
                variant="destructive"
                size="sm"
                className="gap-2"
                onClick={() => onDelete(session)}
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </Button>
            ) : <div />} 
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              {onEdit && (
                <Button
                  className="gap-2"
                  onClick={() => onEdit(session)}
                >
                  <Edit className="w-4 h-4" />
                  Edit Details
                </Button>
              )}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
