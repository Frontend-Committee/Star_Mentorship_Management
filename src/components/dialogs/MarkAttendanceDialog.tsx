import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Session, Member } from '@/types';
import { Monitor, MapPin, Calendar } from 'lucide-react';

interface MarkAttendanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: Session | null;
  members: Member[];
  onSave: (sessionId: string, attendees: string[]) => void;
}

export function MarkAttendanceDialog({
  open,
  onOpenChange,
  session,
  members,
  onSave,
}: MarkAttendanceDialogProps) {
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  useEffect(() => {
    if (session) {
      setSelectedMembers(session.attendees);
    }
  }, [session]);

  const handleToggleMember = (memberId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleSelectAll = () => {
    setSelectedMembers(members.map((m) => m.id));
  };

  const handleDeselectAll = () => {
    setSelectedMembers([]);
  };

  const handleSave = () => {
    if (session) {
      onSave(session.id, selectedMembers);
      onOpenChange(false);
    }
  };

  if (!session) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="font-heading">Mark Attendance</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Session Info */}
          <div className="p-4 rounded-lg bg-muted/50 border border-border/50 space-y-2">
            <h3 className="font-semibold text-foreground">{session.title}</h3>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(session.date).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
              </div>
              <Badge variant="outline" className="gap-1">
                {session.type === 'online' ? (
                  <Monitor className="w-3 h-3" />
                ) : (
                  <MapPin className="w-3 h-3" />
                )}
                {session.type}
              </Badge>
            </div>
            {session.description && (
              <p className="text-sm text-muted-foreground">{session.description}</p>
            )}
          </div>

          {/* Select All / Deselect All */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {selectedMembers.length} of {members.length} members selected
            </p>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={handleSelectAll}>
                Select All
              </Button>
              <Button variant="ghost" size="sm" onClick={handleDeselectAll}>
                Deselect All
              </Button>
            </div>
          </div>

          {/* Member List */}
          <ScrollArea className="h-[250px] pr-4">
            <div className="space-y-2">
              {members.map((member) => (
                <label
                  key={member.id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <Checkbox
                    checked={selectedMembers.includes(member.id)}
                    onCheckedChange={() => handleToggleMember(member.id)}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{member.name}</p>
                    <p className="text-sm text-muted-foreground truncate">{member.email}</p>
                  </div>
                  {selectedMembers.includes(member.id) && (
                    <Badge className="shrink-0">Present</Badge>
                  )}
                </label>
              ))}
            </div>
          </ScrollArea>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Attendance</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
