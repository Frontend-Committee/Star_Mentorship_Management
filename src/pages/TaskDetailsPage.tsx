import { useParams } from 'react-router-dom';
import { useTask } from '../features/tasks/hooks';
import { useMe } from '../features/auth/hooks';
import { useSubmissionByTaskId, useCreateSubmission, useUpdateSubmission, useSubmissions } from '../features/submissions/hooks';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { SubmissionStatus } from '@/types';

const STATUS_LABELS: Record<SubmissionStatus, string> = {
  pen: 'Pending',
  sub: 'Submitted',
  mis: 'Missing',
};

const STATUS_COLORS: Record<SubmissionStatus, "default" | "secondary" | "destructive" | "outline"> = {
  pen: 'secondary',
  sub: 'default',
  mis: 'destructive',
};

export default function TaskDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const taskId = Number(id);
  const { data: user } = useMe();
  const { data: task, isLoading: taskLoading } = useTask(taskId);
  
  // Member hooks
  const { data: mySubmission, isLoading: subLoading } = useSubmissionByTaskId(taskId);
  const createSubmission = useCreateSubmission();
  const updateSubmission = useUpdateSubmission();

  // Admin hooks
  const { data: allSubmissions } = useSubmissions();
  
  // Local state for form
  const [url, setUrl] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (mySubmission) {
      setUrl(mySubmission.task_url);
      setNote(mySubmission.note || '');
    }
  }, [mySubmission]);

  if (taskLoading) return <div className="p-8 text-center">Loading task...</div>;
  if (!task) return <div className="p-8 text-center text-red-500">Task not found</div>;

  const handleMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (mySubmission) {
        await updateSubmission.mutateAsync({
            id: mySubmission.id,
            data: {
                task: taskId,
                task_url: url,
                note,
                status: 'sub' // Auto set to submitted on update? Or keep existing? Let's assume 'sub'.
            }
        });
        toast.success('Submission updated');
      } else {
         await createSubmission.mutateAsync({
           task: taskId,
           task_url: url,
           note,
           status: 'sub'
         });
         toast.success('Submission created');
      }
    } catch (err) {
        console.error(err);
        toast.error('Failed to submit');
    }
  };

  const taskSubmissions = allSubmissions?.filter(s => s.task === taskId) || [];

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Task Info */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
                <CardTitle className="text-2xl">{task.title}</CardTitle>
                <CardDescription className="mt-2 text-base">{task.description}</CardDescription>
            </div>
            <Badge variant="outline">{task.committee}</Badge>
          </div>
        </CardHeader>
        <CardContent>
            <div className="text-sm text-muted-foreground">
                Created at: {new Date(task.created_at).toLocaleString()}
            </div>
        </CardContent>
      </Card>

      {/* Member View */}
      {user?.role === 'member' && (
        <Card>
          <CardHeader>
            <CardTitle>My Submission</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleMemberSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="url">Task URL</Label>
                <Input 
                  id="url"
                  placeholder="https://..."
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="note">Note (Optional)</Label>
                <Textarea 
                  id="note"
                  placeholder="Any comments..."
                  value={note}
                  onChange={e => setNote(e.target.value)}
                />
              </div>
              
              <div className="flex items-center justify-between pt-4">
                  {mySubmission && (
                      <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Status:</span>
                          <Badge variant={STATUS_COLORS[mySubmission.status]}>
                              {STATUS_LABELS[mySubmission.status]}
                          </Badge>
                      </div>
                  )}
                  <Button type="submit" disabled={createSubmission.isPending || updateSubmission.isPending}>
                    {createSubmission.isPending || updateSubmission.isPending ? 'Saving...' : (mySubmission ? 'Update Submission' : 'Submit Task')}
                  </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Admin View */}
      {user?.role === 'admin' && (
        <Card>
          <CardHeader>
            <CardTitle>Submissions ({taskSubmissions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead>Submitted At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {taskSubmissions.map(submission => (
                  <TableRow key={submission.id}>
                    <TableCell>{submission.user}</TableCell>
                    <TableCell>
                        <Badge variant={STATUS_COLORS[submission.status]}>
                            {STATUS_LABELS[submission.status]}
                        </Badge>
                    </TableCell>
                    <TableCell>
                        <a href={submission.task_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline max-w-[200px] truncate block">
                            {submission.task_url}
                        </a>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate" title={submission.note}>{submission.note}</TableCell>
                    <TableCell>{new Date(submission.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
                {taskSubmissions.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">No submissions yet</TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
