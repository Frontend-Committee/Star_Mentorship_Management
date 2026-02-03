import { FeedbackDialog } from '@/components/dialogs/FeedbackDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/context/AuthContext';
import {
  useCreateSubmission,
  useSubmissions as useMemberSubmissions,
  useUpdateSubmission
} from '@/features/submissions/hooks';
import {
  useAdminTask,
  useAdminTaskSubmissions,
  useCreateFeedback,
  useMemberTask,
  useUpdateFeedback,
} from '@/features/tasks/hooks';
import { FeedbackCreatePayload, Submission } from '@/types';
import { CalendarDays, CheckCircle2, Clock, ExternalLink, Loader2, MessageSquare } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';

export default function TaskDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const taskId = Number(id);
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  // Data Fetching
  const { data: adminTask, isLoading: isAdminTaskLoading } = useAdminTask(taskId);
  const { data: memberTask, isLoading: isMemberTaskLoading } = useMemberTask(taskId);
  const task = isAdmin ? adminTask : memberTask;
  const isTaskLoading = isAdmin ? isAdminTaskLoading : isMemberTaskLoading;

  // Submissions Data
  const { data: adminSubmissions, isLoading: isAdminSubsLoading } = useAdminTaskSubmissions(taskId, { enabled: isAdmin });
  const { data: memberSubmissions, isLoading: isMemberSubsLoading } = useMemberSubmissions({ enabled: !isAdmin },);

  // For member, find their specific submission for this task
  const mySubmission = !isAdmin && memberSubmissions
    ? memberSubmissions.find(s => (typeof s.task === 'number' ? s.task : s.task.id) === taskId)
    : null;

  // Actions
  const { mutate: createSubmission, isPending: isSubmitting } = useCreateSubmission();
  const { mutate: updateSubmission, isPending: isUpdatingSub } = useUpdateSubmission();
  const { mutate: createFeedback, isPending: isCreatingFeedback } = useCreateFeedback();
  const { mutate: updateFeedback, isPending: isUpdatingFeedback } = useUpdateFeedback();

  // State
  const [submissionUrl, setSubmissionUrl] = useState('');
  const [submissionNote, setSubmissionNote] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false);

  useEffect(() => {
    if (mySubmission) {
      setSubmissionUrl(mySubmission.task_url);
      setSubmissionNote(mySubmission.note || '');
    }
  }, [mySubmission]);

  // Handlers
  const handleMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      task: taskId,
      task_url: submissionUrl,
      note: submissionNote,
      status: 'SUBMITTED' as const
    };

    if (mySubmission) {
      updateSubmission({ id: mySubmission.id, data: payload }, {
        onSuccess: () => toast.success("Submission updated successfully"),
        onError: () => toast.error("Failed to update submission")
      });
    } else {
      createSubmission(payload, {
        onSuccess: () => toast.success("Work submitted successfully"),
        onError: () => toast.error("Failed to submit work")
      });
    }
  };

  const handleFeedbackSubmit = (data: FeedbackCreatePayload) => {
    if (selectedSubmission?.feedback) {
      updateFeedback({ id: selectedSubmission.feedback.id, data }, {
        onSuccess: () => {
          toast.success("Feedback updated");
          setIsFeedbackDialogOpen(false);
          setSelectedSubmission(null);
        },
        onError: () => toast.error("Failed to update feedback")
      });
    } else {
      createFeedback(data, {
        onSuccess: () => {
          toast.success("Feedback sent");
          setIsFeedbackDialogOpen(false);
          setSelectedSubmission(null);
        },
        onError: () => toast.error("Failed to send feedback")
      });
    }
  };

  const openFeedbackDialog = (submission: Submission) => {
    setSelectedSubmission(submission);
    setIsFeedbackDialogOpen(true);
  };

  if (isTaskLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="container mx-auto p-6 text-center">
        <h2 className="text-xl font-bold text-destructive">Task not found</h2>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Task Details Header */}
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-heading font-bold">{task.title}</h1>
            <div className="flex items-center gap-4 text-muted-foreground mt-2 text-sm">
              <span className="flex items-center gap-1">
                <CalendarDays className="w-4 h-4" />
                Due: {new Date(task.date).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
              {task.description}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Admin View: Submissions List */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Submissions</CardTitle>
            <CardDescription>
              View and grade member submissions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isAdminSubsLoading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : !adminSubmissions?.length ? (
              <div className="text-center py-8 text-muted-foreground">
                No submissions yet.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted At</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {adminSubmissions.map((sub) => {

                    const user = typeof sub.user === 'object' && sub.user !== null
                      ? sub.user
                      : { id: sub.user, first_name: 'Member', last_name: `#${sub.user}`, email: '' };

                    return (
                      <TableRow key={sub.id}>
                        <TableCell className="font-medium">
                          {user.first_name} {user.last_name}
                        </TableCell>
                        <TableCell>
                          <Badge variant={sub.status === 'SUBMITTED' ? 'default' : 'secondary'}>
                            {sub.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}
                        </TableCell>
                        <TableCell>
                          {sub.feedback ? (
                            <span className={sub.feedback.score >= 50 ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
                              {sub.feedback.score}/100
                            </span>
                          ) : '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {sub.task_url && (
                              <Button variant="ghost" size="icon" asChild>
                                <a href={sub.task_url} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openFeedbackDialog(sub)}
                            >
                              {sub.feedback ? 'Edit Grade' : 'Grade'}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Member View: Submission Area */}
      {!isAdmin && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Submission Form/Status */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>Your Submission</CardTitle>
              <CardDescription>
                Submit your work for this task.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {mySubmission?.status === 'SUBMITTED' ? (
                <div className="space-y-4">
                  <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg flex items-start gap-3 border border-green-200 dark:border-green-900">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-green-900 dark:text-green-100">Submitted</h4>
                      <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                        You have submitted this task on {mySubmission.created_at ? new Date(mySubmission.created_at).toLocaleDateString() : 'Unknown date'}.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase text-muted-foreground font-bold">Submission URL</Label>
                    <a
                      href={mySubmission.task_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-primary hover:underline truncate"
                    >
                      <ExternalLink className="w-4 h-4" />
                      {mySubmission.task_url}
                    </a>
                  </div>
                  {mySubmission.note && (
                    <div className="space-y-2">
                      <Label className="text-xs uppercase text-muted-foreground font-bold">Your Note</Label>
                      <p className="text-sm bg-muted p-3 rounded-md">{mySubmission.note}</p>
                    </div>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => {
                      // Allow re-submission/edit logic if needed, 
                      // for now we can just show the form again or a specific "Edit" button that toggles state.
                      // But simplify: just show form below if they want to update.
                    }}
                    className="w-full mt-2"
                  >
                    Update Submission
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleMemberSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="url">Project URL</Label>
                    <Input
                      id="url"
                      placeholder="https://github.com/..."
                      value={submissionUrl}
                      onChange={(e) => setSubmissionUrl(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="note">Notes (Optional)</Label>
                    <Textarea
                      id="note"
                      placeholder="Any comments for the reviewer..."
                      value={submissionNote}
                      onChange={(e) => setSubmissionNote(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isSubmitting || isUpdatingSub}>
                    {(isSubmitting || isUpdatingSub) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Submit Work
                  </Button>
                </form>
              )}

              {/* Show form even if submitted? Maybe inside an accordion or if they click edit.
                  For now, if submitted, I showed a "Update Submission" button but it didn't do anything. 
                  Let's actually make the form visible if they want to edit, or replace the "Submitted" view with the form pre-filled.
                  Actually, let's keep it simple: If submitted, show details. If they want to edit, they can just edit the form fields below (if I render them).
                  
                  Let's change logic: Always show form, but button says "Update" if exists.
                  And show status badge at top.
              */}
              {mySubmission?.status === 'SUBMITTED' && (
                <div className="mt-6 pt-6 border-t">
                  <h4 className="text-sm font-semibold mb-4">Edit Submission</h4>
                  <form onSubmit={handleMemberSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-url">Project URL</Label>
                      <Input
                        id="edit-url"
                        value={submissionUrl}
                        onChange={(e) => setSubmissionUrl(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-note">Notes</Label>
                      <Textarea
                        id="edit-note"
                        value={submissionNote}
                        onChange={(e) => setSubmissionNote(e.target.value)}
                        rows={3}
                      />
                    </div>
                    <Button type="submit" variant="outline" className="w-full" disabled={isSubmitting || isUpdatingSub}>
                      Update
                    </Button>
                  </form>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Feedback Card */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>Feedback & Grade</CardTitle>
            </CardHeader>
            <CardContent>
              {mySubmission?.feedback ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground font-medium">Score</span>
                    <span className={`text-2xl font-bold ${mySubmission.feedback.score >= 50 ? 'text-green-600' : 'text-red-600'}`}>
                      {mySubmission.feedback.score}/100
                    </span>
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-muted-foreground">
                      <MessageSquare className="w-4 h-4" />
                      Mentor Comments
                    </Label>
                    <div className="bg-muted/50 p-4 rounded-lg text-sm leading-relaxed border">
                      {mySubmission.feedback.note}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground space-y-3">
                  <Clock className="w-10 h-10 opacity-20" />
                  <p>No feedback available yet.</p>
                  <p className="text-xs">
                    {mySubmission?.status === 'SUBMITTED'
                      ? "Your submission is under review."
                      : "Submit your work to receive feedback."}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Admin Feedback Dialog */}
      <FeedbackDialog
        open={isFeedbackDialogOpen}
        onOpenChange={setIsFeedbackDialogOpen}
        onSubmit={handleFeedbackSubmit}
        submission={selectedSubmission}
        isLoading={isCreatingFeedback || isUpdatingFeedback}
      />
    </div>
  );
}
