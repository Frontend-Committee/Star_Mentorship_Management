import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Session, SessionCreatePayload } from '@/types';
import { AddSessionDialog } from '@/components/dialogs/AddSessionDialog';
import { SessionDetailsDialog } from '@/components/dialogs/SessionDetailsDialog';
import { useAdminSessions, useMemberSessions, useCreateSession } from '@/features/sessions/hooks';
import {
  CalendarCheck,
  Plus,
  MapPin,
  Clock,
  Loader2,
  CalendarDays,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Attendance() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const { toast } = useToast();

  const { data: adminSessions, isLoading: isAdminLoading } = useAdminSessions({ enabled: isAdmin });
  const { data: memberSessions, isLoading: isMemberLoading } = useMemberSessions({ enabled: !isAdmin && !!user });

  const sessions = (isAdmin ? adminSessions : memberSessions) || [];
  const isLoading = isAdmin ? isAdminLoading : isMemberLoading;

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  
  const { mutate: createSession } = useCreateSession();

  const handleAddSession = (sessionData: SessionCreatePayload) => {
    createSession(sessionData, {
        onSuccess: () => {
            toast({ title: "Success", description: "Session created successfully" });
            setIsAddDialogOpen(false);
        },
        onError: () => {
             toast({ title: "Error", description: "Failed to create session", variant: "destructive" });
        }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">
            Attendance & Sessions
          </h1>
          <p className="text-muted-foreground mt-1">
            {isAdmin 
              ? "Manage sessions and track committee attendance." 
              : "View your attendance record and upcoming sessions."}
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2 shadow-lg hover:shadow-xl transition-all">
            <Plus className="w-4 h-4" />
            Add Session
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
           <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : sessions.length === 0 ? (
         <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center h-64 text-center">
               <CalendarDays className="w-12 h-12 text-muted-foreground mb-4" />
               <h3 className="text-lg font-semibold">No Sessions Found</h3>
               <p className="text-muted-foreground max-w-sm mt-2">
                  {isAdmin ? "Get started by creating a new session for your committee." : "There are no sessions scheduled yet."}
               </p>
               {isAdmin && (
                  <Button onClick={() => setIsAddDialogOpen(true)} className="mt-4 gap-2">
                     <Plus className="w-4 h-4" />
                     Create First Session
                  </Button>
               )}
            </CardContent>
         </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
           {sessions.map((session) => {
              // For members, find their status (API returns array with only their record)
              const memberRecord = !isAdmin ? session.attendance[0] : null;
              
              return (
                 <Card 
                    key={session.id} 
                    className={cn(
                       "hover:shadow-md transition-all duration-200 border-l-4",
                       isAdmin ? "cursor-pointer active:scale-95 border-l-primary" : "border-l-primary/50"
                    )}
                    onClick={() => isAdmin && setSelectedSession(session)}
                 >
                    <CardHeader className="pb-3">
                       <div className="flex justify-between items-start gap-2">
                          <CardTitle className="text-lg font-bold line-clamp-1" title={session.title}>
                             {session.title}
                          </CardTitle>
                          {!isAdmin && memberRecord && (
                             <Badge 
                                variant={memberRecord.status ? "default" : "secondary"}
                                className={cn(
                                   memberRecord.status ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-red-100 text-red-700 hover:bg-red-100"
                                )}
                             >
                                {memberRecord.status ? "Present" : "Absent"}
                             </Badge>
                          )}
                       </div>
                       <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CalendarCheck className="w-4 h-4" />
                          <span>
                             {new Date(session.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                          </span>
                       </div>
                    </CardHeader>
                    <CardContent>
                       <div className="space-y-3 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                             <Clock className="w-4 h-4 shrink-0" />
                             <span>{session.start_time} - {session.end_time}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                             <MapPin className="w-4 h-4 shrink-0" />
                             <span className="truncate">{session.location}</span>
                          </div>
                          {session.note && (
                             <p className="text-muted-foreground/80 text-xs mt-2 line-clamp-2 bg-muted/50 p-2 rounded">
                                {session.note}
                             </p>
                          )}
                          
                          {isAdmin && (
                             <div className="pt-2 mt-2 border-t flex justify-between items-center text-xs font-medium">
                                <span className="text-muted-foreground">Attendance</span>
                                <div className="flex items-center gap-3">
                                   <span className="flex items-center gap-1 text-green-600">
                                      <CheckCircle2 className="w-3 h-3" />
                                      {session.attendance.filter(a => a.status).length}
                                   </span>
                                   <span className="flex items-center gap-1 text-red-500">
                                      <XCircle className="w-3 h-3" />
                                      {session.attendance.filter(a => !a.status).length}
                                   </span>
                                </div>
                             </div>
                          )}
                       </div>
                    </CardContent>
                 </Card>
              );
           })}
        </div>
      )}

      {/* Admin Dialogs */}
      {isAdmin && (
        <>
           <AddSessionDialog 
              open={isAddDialogOpen} 
              onOpenChange={setIsAddDialogOpen} 
              onAdd={handleAddSession} 
           />
           <SessionDetailsDialog
              open={!!selectedSession}
              onOpenChange={(open) => !open && setSelectedSession(null)}
              session={selectedSession}
           />
        </>
      )}
    </div>
  );
}
