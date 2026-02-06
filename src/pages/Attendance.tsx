import { DeleteConfirmationDialog } from '@/components/dialogs/DeleteConfirmationDialog';
import { SessionDetailsDialog } from '@/components/dialogs/SessionDetailsDialog';
import { SessionDialog } from '@/components/dialogs/SessionDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import {
  useAdminSessions,
  useCreateSession,
  useDeleteSession,
  useMemberSessions,
  useUpdateSession
} from '@/features/sessions/hooks';
import { useCommitteeDetails } from '@/features/committees/hooks';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Session, SessionCreatePayload } from '@/types';
import {
  CalendarCheck,
  CalendarDays,
  Clock,
  Loader2,
  MapPin,
  Plus,
} from 'lucide-react';
import { useState } from 'react';

export default function Sessions() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const { toast } = useToast();

  const { data: committee } = useCommitteeDetails();
  const committeeSlug = committee?.reference_id || 'front_committee';
  const referenceId = committee?.reference_id;

  const { data: adminSessions, isLoading: isAdminLoading } = useAdminSessions(committeeSlug, { enabled: isAdmin });
  const { data: memberSessions, isLoading: isMemberLoading } = useMemberSessions(committeeSlug, { enabled: !isAdmin && !!user });
  
  const sessions = (isAdmin ? adminSessions : memberSessions) || [];
  const isLoading = isAdmin ? isAdminLoading : isMemberLoading;

  const [isSessionDialogOpen, setIsSessionDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<Session | null>(null);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [editingSession, setEditingSession] = useState<Session | null>(null);

  const { mutate: createSession, isPending: isCreating } = useCreateSession(committeeSlug);
  const { mutate: updateSession, isPending: isUpdating } = useUpdateSession(committeeSlug);
  const { mutate: deleteSession, isPending: isDeleting } = useDeleteSession(committeeSlug);

  const handleCreateSession = () => {
    setEditingSession(null);
    setIsSessionDialogOpen(true);
  };

  const handleSessionSubmit = (sessionData: SessionCreatePayload) => {
    if (editingSession) {
      updateSession({ id: editingSession.id, data: sessionData }, {
        onSuccess: () => {
          toast({ title: "Success", description: "Session updated successfully" });
          setIsSessionDialogOpen(false);
          setEditingSession(null);
        },
        onError: (error: unknown) => {
          const axiosError = error as { response?: { data?: Record<string, string[]> } };
          const errorMessage = axiosError.response?.data
            ? Object.entries(axiosError.response.data).map(([key, value]) => `${key}: ${value}`).join(', ')
            : "Failed to update session";
          toast({ title: "Error", description: errorMessage, variant: "destructive" });
        }
      });
    } else {
      createSession(sessionData, {
        onSuccess: () => {
          toast({ title: "Success", description: "Session created successfully" });
          setIsSessionDialogOpen(false);
        },
        onError: (error: unknown) => {
          const axiosError = error as { response?: { data?: Record<string, string[]> } };
          const errorMessage = axiosError.response?.data
            ? Object.entries(axiosError.response.data).map(([key, value]) => `${key}: ${value}`).join(', ')
            : "Failed to create session";
          toast({ title: "Error", description: errorMessage, variant: "destructive" });
        }
      });
    }
  };

  const handleEditSession = (session: Session) => {
    setSelectedSession(null);
    setEditingSession(session);
    setIsSessionDialogOpen(true);
  };

  const handleDeleteSession = (session: Session) => {
    setSessionToDelete(session);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteSession = () => {
    if (!sessionToDelete) return;

    deleteSession(sessionToDelete.id, {
      onSuccess: () => {
        toast({ title: "Success", description: "Session deleted successfully" });
        setIsDeleteDialogOpen(false);
        setSessionToDelete(null);
        setSelectedSession(null);
      },
      onError: () => {
        toast({ title: "Error", description: "Failed to delete session", variant: "destructive" });
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">
            Sessions
          </h1>
          <p className="text-muted-foreground mt-1">
            {isAdmin
              ? "Overview of committee sessions."
              : "View your upcoming sessions."}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : sessions.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center h-64 text-center">
            <CalendarDays className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">Sessions are empty</h3>
            <p className="text-muted-foreground max-w-sm mt-2">
              There are no sessions scheduled yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...sessions]
            .sort((a, b) => {
              // Helper to get a comparable value for date
              const getDateVal = (s: Session) => {
                 if (s.date) return new Date(s.date).getTime();
                 if (s.start_time && (s.start_time.includes('-') || s.start_time.includes('/'))) return new Date(s.start_time).getTime();
                 return 0; 
              };
              return getDateVal(a) - getDateVal(b);
            })
            .map((session, index) => {
            // Safe date parsing helper
            const parseDate = (dateStr: string) => {
              const d = new Date(dateStr);
              if (!isNaN(d.getTime())) return d;
              // Fallback for some common but non-standard formats if needed
              return null;
            };
            const sessionDate = parseDate(session.date);

            return (
              <Card
                key={session.id}
                className={cn(
                  "hover:shadow-md transition-all duration-200 border-l-4",
                  "border-l-primary/50"
                )}
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-lg font-bold" title={session.title}>
                      <span className="text-primary mr-2">#{index + 1}</span>
                      <span>
                         {session.title || (session as any).name || 'Untitled Session'}
                      </span>
                    </CardTitle>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <CalendarCheck className="w-4 h-4" />
                      <span>
                        {(() => {
                           // Try session.date first
                           let d = parseDate(session.date);
                           // If failed, try extracting from start_time
                           if (!d && session.start_time) {
                             // Assuming start_time might be "YYYY-MM-DD HH:MM..." or similar
                             d = parseDate(session.start_time.split(' ').slice(0, 1).join(' ')); // naive try
                             if (!d) d = parseDate(session.start_time); // try full string
                           }
                           
                           return d 
                             ? d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
                             : (session.date || 'No Date');
                        })()}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-4 h-4 shrink-0" />
                      <span>
                        {/* Format times to just HH:MM AM/PM if they are full dates */}
                        {(() => {
                          const formatTime = (t: string) => {
                             if (!t) return '??:??';
                             // If it looks like a time only (HH:MM or HH:MM:SS or HH:MM AM/PM)
                             if (/^\d{1,2}:\d{2}/.test(t) && t.length < 12) return t; 
                             
                             const d = new Date(t.includes(' ') && !t.includes('-') && !t.includes('/') ? `2000-01-01 ${t}` : t);
                             if (!isNaN(d.getTime())) {
                               return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
                             }
                             return t;
                          };
                          return `${formatTime(session.start_time)} - ${formatTime(session.end_time)}`;
                        })()}
                      </span>
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
          <SessionDialog
            open={isSessionDialogOpen}
            onOpenChange={setIsSessionDialogOpen}
            onSubmit={handleSessionSubmit}
            session={editingSession}
            isLoading={isCreating || isUpdating}
          />
          <SessionDetailsDialog
            open={!!selectedSession}
            onOpenChange={(open) => !open && setSelectedSession(null)}
            session={selectedSession}
            onEdit={handleEditSession}
            onDelete={handleDeleteSession}
          />
          <DeleteConfirmationDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            onConfirm={confirmDeleteSession}
            isLoading={isDeleting}
            title="Delete Session"
            description={`Are you sure you want to delete "${sessionToDelete?.title}"? This action cannot be undone and will remove all attendance records for this session.`}
          />
        </>
      )}
    </div>
  );
}
