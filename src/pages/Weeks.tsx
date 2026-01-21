import { useState } from 'react';
import { mockWeekContent } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { AddWeekDialog } from '@/components/dialogs/AddWeekDialog';
import { WeekContent } from '@/types';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  CheckCircle2,
  Circle,
  FileText,
  Presentation,
  ExternalLink,
  Plus,
  Lock,
  ClipboardList,
  MessageSquare,
  CheckSquare,
  Square,
  Send,
  BookOpen,
} from 'lucide-react';

export default function Weeks() {
  const { user } = useAuth();
  const { toast } = useToast();
  const isAdmin = user?.role === 'admin';
  const [weeks, setWeeks] = useState<WeekContent[]>(mockWeekContent);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const completedWeeks = weeks.filter((w) => w.isCompleted).length;
  const progressPercentage = Math.round((completedWeeks / weeks.length) * 100);

  const handleAddWeek = (newWeek: {
    weekNumber: number;
    title: string;
    description: string;
    notes?: string;
    slides?: string;
    challengeLink?: string;
    formLink?: string;
  }) => {
    const week: WeekContent = {
      id: `week-${newWeek.weekNumber}`,
      ...newWeek,
      isCompleted: false,
    };
    setWeeks([...weeks, week]);
  };

  const handleMarkComplete = (weekId: string) => {
    setWeeks((prev) =>
      prev.map((w) => (w.id === weekId ? { ...w, isCompleted: true } : w))
    );
    toast({
      title: 'Week Completed!',
      description: 'Great progress! Keep up the good work.',
    });
  };

  const handleMarkIncomplete = (weekId: string) => {
    setWeeks((prev) =>
      prev.map((w) => (w.id === weekId ? { ...w, isCompleted: false } : w))
    );
  };

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground">
            {isAdmin ? 'Content Management' : 'Learning Weeks'}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            {isAdmin
              ? 'Manage weekly content, notes, and challenges'
              : 'Follow your learning path week by week'}
          </p>
        </div>
        {isAdmin && (
          <Button variant="gradient" onClick={() => setIsAddDialogOpen(true)} className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Add Week
          </Button>
        )}
      </div>

      {/* Member Progress Overview */}
      {!isAdmin && (
        <Card className="border-border/50 animate-fade-in" style={{ animationDelay: '0.05s' }}>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
              <div className="flex items-center gap-4 flex-1">
                <div className="p-3 rounded-xl bg-primary/10">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Your Progress</p>
                  <p className="text-2xl font-bold text-foreground">
                    {completedWeeks} of {weeks.length} weeks
                  </p>
                </div>
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Completion</span>
                  <span className="font-medium text-foreground">{progressPercentage}%</span>
                </div>
                <Progress value={progressPercentage} className="h-3" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Weeks List */}
      <div className="space-y-4">
        {weeks.map((week, index) => {
          const isLocked = !isAdmin && !week.isCompleted && index > 0 && !weeks[index - 1].isCompleted;
          
          return (
            <Card
              key={week.id}
              className={`border-border/50 animate-fade-in overflow-hidden ${
                isLocked ? 'opacity-60' : ''
              } ${week.isCompleted && !isAdmin ? 'border-green-200 dark:border-green-800/30' : ''}`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value={week.id} className="border-0">
                  <AccordionTrigger className="px-4 sm:px-6 py-4 hover:no-underline hover:bg-muted/30">
                    <div className="flex items-center gap-3 sm:gap-4 text-left flex-1 min-w-0">
                      <div className={`p-2 rounded-lg shrink-0 ${
                        week.isCompleted 
                          ? 'bg-green-100 dark:bg-green-900/30' 
                          : isLocked 
                            ? 'bg-muted' 
                            : 'bg-primary/10'
                      }`}>
                        {week.isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                        ) : isLocked ? (
                          <Lock className="w-5 h-5 text-muted-foreground" />
                        ) : (
                          <Circle className="w-5 h-5 text-primary" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge
                            variant={week.isCompleted ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            Week {week.weekNumber}
                          </Badge>
                          {week.assignmentSubmitted && !isAdmin && (
                            <Badge variant="outline" className="text-xs text-green-600 border-green-300">
                              Submitted
                            </Badge>
                          )}
                          {week.adminFeedback && !isAdmin && (
                            <Badge variant="outline" className="text-xs text-blue-600 border-blue-300">
                              Feedback
                            </Badge>
                          )}
                        </div>
                        <h3 className="font-semibold text-foreground mt-1 text-sm sm:text-base truncate">
                          {week.title}
                        </h3>
                      </div>
                    </div>
                  </AccordionTrigger>
                  
                  <AccordionContent className="px-4 sm:px-6 pb-4">
                    {isLocked ? (
                      <p className="text-sm text-muted-foreground italic py-4">
                        Complete the previous week to unlock this content.
                      </p>
                    ) : (
                      <div className="space-y-4 pt-2">
                        {/* Description */}
                        <p className="text-sm text-muted-foreground">{week.description}</p>

                        {/* Content Links */}
                        <div className="space-y-3">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Content
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {week.notes && (
                              <Button variant="outline" size="sm" asChild className="text-xs sm:text-sm">
                                <a href={week.notes} target="_blank" rel="noopener noreferrer">
                                  <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5" />
                                  Notes
                                </a>
                              </Button>
                            )}
                            {week.slides && (
                              <Button variant="outline" size="sm" asChild className="text-xs sm:text-sm">
                                <a href={week.slides} target="_blank" rel="noopener noreferrer">
                                  <Presentation className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5" />
                                  Slides
                                </a>
                              </Button>
                            )}
                            {week.quizLink && (
                              <Button variant="outline" size="sm" asChild className="text-xs sm:text-sm">
                                <a href={week.quizLink} target="_blank" rel="noopener noreferrer">
                                  <ClipboardList className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5" />
                                  Quiz
                                </a>
                              </Button>
                            )}
                            {week.challengeLink && (
                              <Button variant="default" size="sm" asChild className="text-xs sm:text-sm">
                                <a href={week.challengeLink} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5" />
                                  Challenge
                                </a>
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Assignment Submission (Member Only) */}
                        {!isAdmin && week.formLink && (
                          <div className="space-y-3 pt-2 border-t border-border/50">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                              Assignment
                            </p>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                              <div className="flex items-center gap-2 flex-1">
                                {week.assignmentSubmitted ? (
                                  <>
                                    <CheckSquare className="w-4 h-4 text-green-600" />
                                    <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                                      Assignment submitted
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <Square className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">
                                      Not submitted yet
                                    </span>
                                  </>
                                )}
                              </div>
                              <Button 
                                variant={week.assignmentSubmitted ? 'outline' : 'default'} 
                                size="sm" 
                                asChild 
                                className="text-xs sm:text-sm"
                              >
                                <a href={week.formLink} target="_blank" rel="noopener noreferrer">
                                  <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5" />
                                  {week.assignmentSubmitted ? 'Resubmit' : 'Submit Assignment'}
                                </a>
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Admin Feedback (Member Only) */}
                        {!isAdmin && week.adminFeedback && (
                          <div className="space-y-3 pt-2 border-t border-border/50">
                            <div className="flex items-center gap-2">
                              <MessageSquare className="w-4 h-4 text-blue-600" />
                              <p className="text-xs font-medium text-blue-600 uppercase tracking-wider">
                                Admin Feedback
                              </p>
                            </div>
                            <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/30 rounded-lg p-3">
                              <p className="text-sm text-foreground">{week.adminFeedback}</p>
                            </div>
                          </div>
                        )}

                        {/* Mark Complete Button (Member Only) */}
                        {!isAdmin && (
                          <div className="pt-3 border-t border-border/50 flex justify-end">
                            {week.isCompleted ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMarkIncomplete(week.id)}
                                className="text-muted-foreground"
                              >
                                <CheckCircle2 className="w-4 h-4 mr-2 text-green-600" />
                                Completed - Mark as Incomplete
                              </Button>
                            ) : (
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleMarkComplete(week.id)}
                              >
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                Mark as Completed
                              </Button>
                            )}
                          </div>
                        )}

                        {/* Admin Actions */}
                        {isAdmin && (
                          <div className="pt-3 border-t border-border/50 flex flex-wrap gap-2 justify-end">
                            <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                              Edit Week
                            </Button>
                            <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                              Add Feedback
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </Card>
          );
        })}
      </div>

      {/* Add Week Dialog */}
      <AddWeekDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAddWeek={handleAddWeek}
        nextWeekNumber={weeks.length + 1}
      />
    </div>
  );
}
