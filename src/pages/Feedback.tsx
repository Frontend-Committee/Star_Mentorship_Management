import { mockProjects } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Star, CheckCircle, Clock } from 'lucide-react';

export default function Feedback() {
  const reviewedProjects = mockProjects.filter((p) => p.status === 'reviewed');
  const pendingProjects = mockProjects.filter((p) => p.status === 'submitted');

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border/50 hover-lift">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Reviewed</p>
                <p className="text-3xl font-bold text-foreground mt-1">{reviewedProjects.length}</p>
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
                <p className="text-3xl font-bold text-foreground mt-1">{pendingProjects.length}</p>
              </div>
              <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-900/30">
                <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 hover-lift">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Best Projects</p>
                <p className="text-3xl font-bold text-foreground mt-1">
                  {mockProjects.filter((p) => p.isBest).length}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-primary/10">
                <Star className="w-6 h-6 text-primary" />
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
          {reviewedProjects.length > 0 ? (
            reviewedProjects.map((project, index) => (
              <div
                key={project.id}
                className="p-4 rounded-lg bg-muted/50 border border-border/50 hover:border-primary/30 transition-colors animate-slide-in space-y-4"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <MessageSquare className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">{project.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        Reviewed on {project.submittedAt && new Date(project.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {project.isBest && (
                      <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                        <Star className="w-3 h-3 mr-1" />
                        Best
                      </Badge>
                    )}
                    {project.grade && (
                      <Badge variant="default">Grade: {project.grade}</Badge>
                    )}
                  </div>
                </div>

                {project.feedback && (
                  <div className="pl-11">
                    <div className="p-4 rounded-lg bg-card border border-border">
                      <p className="text-sm text-foreground">{project.feedback}</p>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No feedback available yet. Submit projects to receive feedback.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
