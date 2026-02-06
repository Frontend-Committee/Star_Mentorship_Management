import { TaskDialog } from '@/components/dialogs/TaskDialog';
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
  usePartialUpdateTask,
  useDeleteTask,
} from '@/features/tasks/hooks';
import { FeedbackCreatePayload, Submission, TaskCreatePayload } from '@/types';
import { CalendarDays, CheckCircle2, Clock, Edit, ExternalLink, Loader2, MessageSquare, Trash2 } from 'lucide-react';
import { DeleteConfirmationDialog } from '@/components/dialogs/DeleteConfirmationDialog';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  const { mutate: partialUpdateTask, isPending: isUpdatingTask } = usePartialUpdateTask();
  const { mutate: deleteTask, isPending: isDeletingTask } = useDeleteTask();
  const navigate = useNavigate();

  // State
  const [submissionUrl, setSubmissionUrl] = useState('');
  const [submissionNote, setSubmissionNote] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

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
   
  const handleUpdateTask = (data: TaskCreatePayload) => {
    // We treat edits from dialog as PATCH updates for now, or we could check if fields are missing.
    // Given the dialog sends full data, we can use partialUpdateTask as well since it accepts TaskUpdatePayload.
    // However, data from dialog is TaskCreatePayload (all fields required by UI but payload wise similar).
    
    partialUpdateTask({ id: taskId, data }, {
      onSuccess: () => {
        toast.success("Task updated successfully");
        setIsTaskDialogOpen(false);
      },
      onError: (error: any) => {
        const errorMessage = error.response?.data
          ? Object.entries(error.response.data).map(([key, value]) => `${key}: ${value}`).join(', ')
          : "Failed to update task";
        toast.error(errorMessage);
      }
    });
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
    <div className="space-y-6 lg:space-y-8 animate-fade-in">
      <div className="space-y-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground leading-tight">{task.title}</h1>
              <div className="flex items-center gap-4 text-muted-foreground text-sm">
                <span className="flex items-center gap-1.5 font-medium text-primary">
                  <CalendarDays className="w-4 h-4" />
                  Due {new Date(task.date).toLocaleDateString()}
                </span>
              </div>
            </div>
            {isAdmin && (
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => setIsTaskDialogOpen(true)} variant="outline" className="flex-1 sm:flex-none gap-2 h-9 text-xs sm:text-sm">
                  <Edit className="w-3.5 h-3.5" />
                  Edit Task
                </Button>
                <Button onClick={() => setIsDeleteDialogOpen(true)} variant="destructive" className="flex-1 sm:flex-none gap-2 h-9 text-xs sm:text-sm">
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </Button>
              </div>
            )}
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
              <div className="overflow-x-auto -mx-1 px-1">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-[150px] sm:w-auto font-bold uppercase tracking-wider text-[10px]">Member</TableHead>
                      <TableHead className="font-bold uppercase tracking-wider text-[10px]">Status</TableHead>
                      <TableHead className="font-bold uppercase tracking-wider text-[10px]">Date</TableHead>
                      <TableHead className="font-bold uppercase tracking-wider text-[10px]">Score</TableHead>
                      <TableHead className="font-bold uppercase tracking-wider text-[10px] text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {adminSubmissions.map((sub) => {
                      const user = typeof sub.user === 'object' && sub.user !== null
                        ? sub.user
                        : { id: sub.user, first_name: 'Member', last_name: `#${sub.user}`, email: '' };

                      return (
                        <TableRow key={sub.id} className="group transition-colors">
                          <TableCell className="font-medium whitespace-nowrap">
                            {user.first_name} {user.last_name}
                          </TableCell>
                          <TableCell>
                            <Badge variant={sub.status === 'SUBMITTED' ? 'default' : 'secondary'} className="text-[10px] font-bold">
                              {sub.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                            {sub.submitted_at ? new Date(sub.submitted_at).toLocaleDateString() : '-'}
                          </TableCell>
                          <TableCell>
                            {sub.feedback ? (
                              <span className={sub.feedback.score >= 50 ? "text-green-600 font-bold text-xs" : "text-red-600 font-bold text-xs"}>
                                {sub.feedback.score}/100
                              </span>
                            ) : '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1.5">
                              {sub.task_url && (
                                <Button variant="ghost" size="icon" asChild className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10">
                                  <a href={sub.task_url} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="w-4 h-4" />
                                  </a>
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openFeedbackDialog(sub)}
                                className="h-8 text-[10px] font-bold uppercase"
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
              </div>
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
                        You have submitted this task on {mySubmission.submitted_at ? new Date(mySubmission.submitted_at).toLocaleDateString() : 'Unknown date'}.
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

      {/* Admin Task Edit Dialog */}
      <TaskDialog
        open={isTaskDialogOpen}
        onOpenChange={setIsTaskDialogOpen}
        onSubmit={handleUpdateTask}
        task={task}
        isLoading={isUpdatingTask}
      />

      {/* Admin Feedback Dialog */}
      <FeedbackDialog
        open={isFeedbackDialogOpen}
        onOpenChange={setIsFeedbackDialogOpen}
        onSubmit={handleFeedbackSubmit}
        submission={selectedSubmission}
        isLoading={isCreatingFeedback || isUpdatingFeedback}
      />

      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={() => {
            deleteTask(taskId, {
                onSuccess: () => {
                    toast.success("Task deleted successfully");
                    navigate('/tasks');
                },
                onError: () => toast.error("Failed to delete task")
            });
        }}
        title="Delete Task"
        description="Are you sure you want to delete this task? This action cannot be undone and will delete all member submissions associated with it."
        isLoading={isDeletingTask}
      />
    </div>
  );
}
