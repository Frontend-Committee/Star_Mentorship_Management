/* eslint-disable @typescript-eslint/no-explicit-any */
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useUpdateAttendance } from '@/features/sessions/hooks';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Attendance, Session } from '@/types';
import { Calendar, Check, Clock, DollarSign, MapPin, Trash2, X } from 'lucide-react';

interface SessionDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: Session | null;
}

export function SessionDetailsDialog({ open, onOpenChange, session }: SessionDetailsDialogProps) {
  const { mutate: updateAttendance } = useUpdateAttendance();

  if (!session) return null;

  const handleToggleStatus = (attendance: Attendance) => {
    updateAttendance(
      { id: attendance.id, data: { status: !attendance.status } },
      {
        onError: () => {
          toast({
             title: "Error",
             description: "Failed to update attendance status",
             variant: "destructive"
          });
        }
      }
    );
  };

  const handleToggleFees = (attendance: Attendance) => {
    updateAttendance(
      { id: attendance.id, data: { pay_fees: !attendance.pay_fees } },
      {
         onError: () => {
            toast({
                title: "Error",
                description: "Failed to update fees status",
                variant: "destructive"
            });
         }
      }
    );
  };

  // Sort attendance: Present first, then by Name
  const sortedAttendance = [...(session.attendance || [])].sort((a, b) => {
      if (a.status !== b.status) return a.status ? -1 : 1;
      // Fallback name sort if possible, else ID
      return 0; 
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">{session.title}</DialogTitle>
           <DialogDescription>
              Session Details and Attendance Management
           </DialogDescription>
        </DialogHeader>

        {/* Session Info */}
        <div className="flex flex-col gap-3 p-4 rounded-lg bg-muted/50 border border-border/50">
           <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
              <div className="flex items-center gap-2">
                 <Calendar className="w-4 h-4 text-primary" />
                 <span className="font-medium">{session.date}</span>
              </div>
              <div className="flex items-center gap-2">
                 <Clock className="w-4 h-4 text-primary" />
                 <span className="font-medium">{session.start_time} - {session.end_time}</span>
              </div>
              <div className="flex items-center gap-2">
                 <MapPin className="w-4 h-4 text-primary" />
                 <span className="font-medium">{session.location}</span>
              </div>
           </div>
           {session.note && (
             <p className="text-sm text-muted-foreground mt-1 border-t pt-2 border-border/50">
               {session.note}
             </p>
           )}
        </div>

        {/* Attendance List */}
        <div className="flex-1 overflow-hidden flex flex-col mt-4">
           <div className="flex items-center justify-between mb-3 px-1">
               <h3 className="font-semibold text-base">Attendance List</h3>
               <div className="flex gap-4 text-xs font-medium">
                   <span className="text-green-600 flex items-center gap-1">
                       <Check className="w-3 h-3" />
                       {session.attendance.filter(a => a.status).length} Present
                   </span>
                   <span className="text-muted-foreground flex items-center gap-1">
                       <X className="w-3 h-3" />
                       {session.attendance.filter(a => !a.status).length} Absent
                   </span>
               </div>
           </div>
           
           <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground px-4 mb-2 uppercase tracking-wider">
              <div className="col-span-5">Member</div>
              <div className="col-span-3 text-center">Attendance</div>
              <div className="col-span-3 text-center">Fees</div>
           </div>

           <ScrollArea className="flex-1 border rounded-md bg-background">
              <div className="divide-y">
                 {sortedAttendance.map((record) => {
                    // Handle user object or ID safely
                    const user = typeof record.user === 'object' && record.user !== null
                        ? record.user 
                        : { id: record.user, first_name: 'Member', last_name: `#${record.user}`, email: '' };
                    
                    const initials = `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`;

                    return (
                       <div key={record.id} className="grid grid-cols-12 gap-2 items-center p-3 hover:bg-muted/30 transition-colors">
                          <div className="col-span-5 flex items-center gap-3 overflow-hidden">
                             <Avatar className="w-8 h-8 shrink-0 border">
                                <AvatarFallback className="text-xs bg-primary/10 text-primary">{initials}</AvatarFallback>
                             </Avatar>
                             <div className="flex flex-col min-w-0">
                                <span className="text-sm font-medium truncate">{user.first_name} {user.last_name}</span>
                                <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                             </div>
                          </div>
                          
                          <div className="col-span-3 flex justify-center">
                             <Button
                                size="sm"
                                variant={record.status ? "default" : "outline"}
                                className={cn(
                                   "h-7 text-xs gap-1.5 min-w-[90px] transition-all",
                                   record.status 
                                     ? "bg-green-600 hover:bg-green-700 border-green-600" 
                                     : "text-muted-foreground hover:text-foreground"
                                )}
                                onClick={() => handleToggleStatus(record)}
                             >
                                {record.status ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                                {record.status ? "Present" : "Absent"}
                             </Button>
                          </div>

                          <div className="col-span-3 flex justify-center">
                             <Button
                                size="sm"
                                variant={record.pay_fees ? "default" : "outline"}
                                className={cn(
                                   "h-7 text-xs gap-1.5 min-w-[80px] transition-all",
                                   record.pay_fees 
                                     ? "bg-blue-600 hover:bg-blue-700 border-blue-600" 
                                     : "text-muted-foreground hover:text-foreground"
                                )}
                                onClick={() => handleToggleFees(record)}
                             >
                                <DollarSign className="w-3 h-3" />
                                {record.pay_fees ? "Paid" : "Unpaid"}
                             </Button>
                          </div>
                       </div>
                    );
                 })}
                 {(session.attendance || []).length === 0 && (
                     <div className="p-8 text-center text-muted-foreground">
                         No attendance records found for this session.
                     </div>
                 )}
              </div>
           </ScrollArea>
        </div>

        <DialogFooter className="mt-4 border-t pt-4">
            <div className="flex justify-between w-full">
                {onDelete && (
                    <Button 
                        variant="destructive" 
                        size="sm" 
                        className="gap-2"
                        onClick={() => onDelete(session)}
                    >
                        <Trash2 className="w-4 h-4" />
                        Delete Session
                    </Button>
                )}
                <div className="flex gap-2 ml-auto">
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
