import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Star, CheckCircle, Clock } from 'lucide-react';
import { useSubmissions } from '@/features/submissions/hooks';
import { SubmissionSkeleton } from '@/components/submissions/SubmissionSkeleton';
import { useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useAdminSubmissions } from '@/features/tasks/hooks';

export default function Feedback() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  
  const { data: memberSubmissions = [], isLoading: isMemberLoading } = useSubmissions(undefined, { enabled: !isAdmin });
  const { data: adminSubmissions = [], isLoading: isAdminLoading } = useAdminSubmissions(undefined, { enabled: isAdmin });

  const submissions = isAdmin ? adminSubmissions : memberSubmissions;
  const isLoading = isAdmin ? isAdminLoading : isMemberLoading;

  const stats = useMemo(() => {
    const reviewed = submissions.filter((p) => p.feedback !== null);
    const pending = submissions.filter((p) => {
      const s = p.status?.toLowerCase();
      return (s === 'submitted' || s === 'sub') && p.feedback === null;
    });
    
    return {
      reviewed,
      pending
    };
  }, [submissions]);

  if (isLoading) {
    return <SubmissionSkeleton />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-1 animate-fade-in">
        <h1 className="text-3xl font-heading font-bold text-foreground">Feedback</h1>
        <p className="text-muted-foreground">
          View feedback on your project submissions
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-border/50 hover-lift">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Reviewed</p>
                <p className="text-3xl font-bold text-foreground mt-1">{stats.reviewed.length}</p>
              </div>
              <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/30">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 hover-lift">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Review</p>
                <p className="text-3xl font-bold text-foreground mt-1">{stats.pending.length}</p>
              </div>
              <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-900/30">
                <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feedback List */}
      <Card className="border-border/50 animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <CardHeader>
          <CardTitle className="text-lg font-heading">All Feedback</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {stats.reviewed.length > 0 ? (
            stats.reviewed.map((submission, index) => (
              <div
                key={submission.id}
                className="p-4 rounded-lg bg-muted/50 border border-border/50 hover:border-primary/30 transition-colors animate-slide-in space-y-4"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <MessageSquare className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">
                        {typeof submission.task === 'object' 
                          ? submission.task?.title 
                          : `Task #${submission.task}`}
                      </h4>
                      {isAdmin && 'user' in submission && (
                        <p className="text-xs text-primary font-medium">
                          Member: {(submission as any).user?.first_name} {(submission as any).user?.last_name}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        Submitted on {submission.submitted_at && new Date(submission.submitted_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {submission.feedback?.score !== undefined && (
                      <Badge variant="default">Score: {submission.feedback.score}</Badge>
                    )}
                  </div>
                </div>

                {submission.feedback?.note && (
                  <div className="pl-11">
                    <div className="p-4 rounded-lg bg-card border border-border">
                      <p className="text-sm text-foreground">{submission.feedback.note}</p>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No feedback available yet. Submit tasks to receive feedback.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
