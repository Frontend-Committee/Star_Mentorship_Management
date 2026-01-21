import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WeekContent } from '@/types';
import { CheckCircle2, Circle, ExternalLink, FileText, Presentation } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WeeklyTaskCardProps {
  currentWeek: WeekContent;
}

export default function WeeklyTaskCard({ currentWeek }: WeeklyTaskCardProps) {
  return (
    <Card className="border-border/50 bg-gradient-to-br from-card to-primary/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-primary">Week {currentWeek.weekNumber}</p>
            <CardTitle className="text-lg font-heading">{currentWeek.title}</CardTitle>
          </div>
          {currentWeek.isCompleted ? (
            <CheckCircle2 className="w-6 h-6 text-green-500" />
          ) : (
            <Circle className="w-6 h-6 text-muted-foreground" />
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{currentWeek.description}</p>
        
        <div className="flex flex-wrap gap-2">
          {currentWeek.notes && (
            <Button variant="outline" size="sm" asChild>
              <a href={currentWeek.notes} target="_blank" rel="noopener noreferrer">
                <FileText className="w-4 h-4 mr-1.5" />
                Notes
              </a>
            </Button>
          )}
          {currentWeek.slides && (
            <Button variant="outline" size="sm" asChild>
              <a href={currentWeek.slides} target="_blank" rel="noopener noreferrer">
                <Presentation className="w-4 h-4 mr-1.5" />
                Slides
              </a>
            </Button>
          )}
          {currentWeek.challengeLink && (
            <Button variant="default" size="sm" asChild>
              <a href={currentWeek.challengeLink} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-1.5" />
                Start Challenge
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
