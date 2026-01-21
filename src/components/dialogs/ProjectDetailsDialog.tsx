import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Project } from '@/types';
import { 
  FolderKanban, 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Star, 
  MessageSquare,
  ListChecks 
} from 'lucide-react';

interface ProjectDetailsDialogProps {
  project: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusConfig = {
  pending: { label: 'Pending', icon: Clock, color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  submitted: { label: 'Submitted', icon: AlertCircle, color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  reviewed: { label: 'Reviewed', icon: CheckCircle, color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
};

export function ProjectDetailsDialog({ project, open, onOpenChange }: ProjectDetailsDialogProps) {
  if (!project) return null;

  const status = statusConfig[project.status];
  const StatusIcon = status.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-primary/10 shrink-0">
              <FolderKanban className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <DialogTitle className="text-xl font-heading">{project.title}</DialogTitle>
                {project.isBest && (
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30">
                    <Star className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                    <span className="text-xs font-medium text-amber-700 dark:text-amber-400">Best Project</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge className={`${status.color} text-xs`}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {status.label}
                </Badge>
                {project.deadline && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Due: {new Date(project.deadline).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Description */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">Description</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {project.description}
            </p>
          </div>

          {/* Requirements */}
          {project.requirements && project.requirements.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <ListChecks className="w-4 h-4 text-primary" />
                <h4 className="text-sm font-medium text-foreground">Requirements</h4>
              </div>
              <ul className="space-y-2">
                {project.requirements.map((req, index) => (
                  <li 
                    key={index} 
                    className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border border-border/50"
                  >
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-xs font-medium text-primary">{index + 1}</span>
                    </div>
                    <span className="text-sm text-foreground">{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Submission Info */}
          {project.submittedAt && (
            <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Submitted on:</span>{' '}
                {new Date(project.submittedAt).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          )}

          {/* Feedback */}
          {project.feedback && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                <h4 className="text-sm font-medium text-foreground">Admin Feedback</h4>
                {project.grade && (
                  <Badge variant="secondary" className="ml-auto">
                    Grade: {project.grade}
                  </Badge>
                )}
              </div>
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-sm text-foreground leading-relaxed">{project.feedback}</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
