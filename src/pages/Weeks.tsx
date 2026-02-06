import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { AddWeekDialog } from '@/components/dialogs/AddWeekDialog';
import { EditWeekDialog } from '@/components/dialogs/EditWeekDialog';
import { AddWeekItemDialog } from '@/components/dialogs/AddWeekItemDialog';
import { EditWeekItemDialog } from '@/components/dialogs/EditWeekItemDialog';
import { ViewItemProgressDialog } from '@/components/dialogs/ViewItemProgressDialog';
import { WeekContent, WeekProgress } from '@/types';
import { useWeeks, useDeleteWeek, useDeleteWeekItem, useUpdateMemberProgress } from '@/features/weeks/hooks';
import { DeleteConfirmationDialog } from '@/components/dialogs/DeleteConfirmationDialog';
import { WeeksSkeleton } from '@/components/weeks/WeeksSkeleton';
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
  Loader2,
  AlertCircle,
  Trash2,
  Pencil,
  FileDown,
} from 'lucide-react';

export default function Weeks() {
  const { user } = useAuth();
  const { toast } = useToast();
  const isAdmin = user?.role === 'admin';
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [addItemWeek, setAddItemWeek] = useState<{id: number, title: string} | null>(null);
  const [editWeekId, setEditWeekId] = useState<number | null>(null);
  const [editItemId, setEditItemId] = useState<number | null>(null);
  const [editItemWeekId, setEditItemWeekId] = useState<number | null>(null);
  const [viewItemId, setViewItemId] = useState<number | null>(null);
  const [deleteWeekId, setDeleteWeekId] = useState<number | null>(null);
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);
  
  // Mutations
  const deleteWeek = useDeleteWeek();
  const deleteItem = useDeleteWeekItem();
  const updateMemberProgress = useUpdateMemberProgress();
  
  const { data: apiWeeks, isLoading, error } = useWeeks(user?.role);
  
  useEffect(() => {
    console.log('API Weeks Data:', apiWeeks);
    console.log('User Role:', user?.role);
    if (error) console.error('API Error:', error);
  }, [apiWeeks, user?.role, error]);

  const weeks = useMemo<WeekContent[]>(() => {
    if (!apiWeeks) return [];
    
    const processed = apiWeeks.map((week: import('@/types').WeekDetail | import('@/types').MemberWeekDetail) => {
      const adminWeek = week as import('@/types').WeekDetail;
      const memberWeek = week as import('@/types').MemberWeekDetail;
      const items = (adminWeek.week_items || memberWeek.items || []) as (import('@/types').WeekItemAdminDetail | import('@/types').MemberItem)[];
      
      const isCompleted = items.length > 0 && items.every((item) => {
        const itemWithProgress = item as { week_progress?: any };
        const wp = itemWithProgress.week_progress;
        if (!wp) return false;
        
        if (Array.isArray(wp)) {
          return wp.some((p: any) => {
            const progressUserId = p.user?.id || p.user;
            const isOwnProgress = !progressUserId || String(progressUserId) === String(user.id);
            return p.is_finished && isOwnProgress;
          });
        }
        
        // Single object format (Member API)
        return wp.is_finished;
      });
      
      const weekNumber = (week as { number?: number }).number || 0;
      const weekData = week as Record<string, unknown>;
      const description = (weekData.description as string) || (items.length > 0 ? (items[0] as { notes?: string }).notes : '') || '';
      const cleanDescription = description === '--' ? '' : description.trim();

      return {
        id: week.id?.toString() ?? `week-${weekNumber}`,
        weekNumber: weekNumber,
        title: week.title,
        description: cleanDescription,
        isCompleted,
        items: items,
        notes: items.find((item: import('@/types').MemberItem | import('@/types').WeekItemAdminDetail) => item.title?.toLowerCase().includes('note'))?.resource,
        slides: items.find((item: import('@/types').MemberItem | import('@/types').WeekItemAdminDetail) => item.title?.toLowerCase().includes('slide'))?.resource,
        challengeLink: items.find((item: import('@/types').MemberItem | import('@/types').WeekItemAdminDetail) => item.title?.toLowerCase().includes('challenge'))?.resource,
        formLink: items.find((item: import('@/types').MemberItem | import('@/types').WeekItemAdminDetail) => item.title?.toLowerCase().includes('form'))?.resource,
      };
    });

    const sorted = processed.sort((a, b) => b.weekNumber - a.weekNumber);
    console.log('Processed Weeks Data:', sorted);
    return sorted;
  }, [apiWeeks, user?.id]);

  const completedWeeks = weeks.filter((w) => w.isCompleted).length;
  const progressPercentage = weeks.length > 0 ? Math.round((completedWeeks / weeks.length) * 100) : 0;

  const handleMarkComplete = async (weekId: string) => {
    if (!user?.id) {
      console.warn('Cannot mark complete: No user ID found');
      return;
    }
    
    console.log(`Attempting to mark week ${weekId} as complete...`);
    
    try {
      const week = weeks.find(w => w.id === weekId);
      if (!week) {
        console.warn(`Week ${weekId} not found in local state`);
        return;
      }

      if (!week.items || week.items.length === 0) {
        console.log('No items in this week to mark complete.');
        toast({ title: 'Week marked as complete' });
        return;
      }
      
      const itemsToUpdate = week.items.filter(item => {
        const wp = (item as any).week_progress;
        if (!wp) return false;
        
        if (Array.isArray(wp)) {
          const userProgress = wp.find((p: any) => {
            const progressUserId = p.user?.id || p.user;
            return !progressUserId || String(progressUserId) === String(user.id);
          });
          return userProgress && userProgress.id;
        }
        
        // Single object format
        return wp.id;
      });

      if (itemsToUpdate.length === 0 && week.items.length > 0) {
        console.log('Debug - Week Item 0:', week.items[0]);
        console.log('Debug - Auth User ID:', user.id, typeof user.id);
      }

      console.log(`Found ${itemsToUpdate.length} assigned items to update.`);

      if (itemsToUpdate.length === 0) {
        toast({ 
          title: 'Not Assigned', 
          description: 'You cannot complete this week because no items are assigned to you.',
          variant: 'destructive'
        });
        return;
      }
      
      const updatePromises = itemsToUpdate.map(item => {
        const wp = (item as any).week_progress;
        const userProgress = Array.isArray(wp) 
          ? wp.find((p: any) => {
              const progressUserId = p.user?.id || p.user;
              return !progressUserId || String(progressUserId) === String(user.id);
            })
          : wp;
        
        return updateMemberProgress.mutateAsync({
          id: userProgress.id,
          data: { is_finished: true }
        });
      });
      
      await Promise.all(updatePromises);
      
      toast({
        title: 'Week Completed!',
        description: 'Great progress! Keep up the good work.',
      });
    } catch (error) {
      console.error('Failed to complete week:', error);
      toast({
        title: 'Failed to update progress',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    }
  };

  const handleMarkIncomplete = async (weekId: string) => {
    if (!user?.id) return;
    
    try {
      const week = weeks.find(w => w.id === weekId);
      if (!week || !week.items) return;
      
      const itemsToUpdate = week.items.filter(item => {
        const wp = (item as any).week_progress;
        if (!wp) return false;
        
        if (Array.isArray(wp)) {
          const userProgress = wp.find((p: any) => {
            const progressUserId = p.user?.id || p.user;
            return !progressUserId || String(progressUserId) === String(user.id);
          });
          return userProgress && userProgress.id;
        }
        
        return wp.id;
      });

      if (itemsToUpdate.length === 0) return;

      const updatePromises = itemsToUpdate.map(item => {
        const wp = (item as any).week_progress;
        const userProgress = Array.isArray(wp) 
          ? wp.find((p: any) => {
              const progressUserId = p.user?.id || p.user;
              return !progressUserId || String(progressUserId) === String(user.id);
            })
          : wp;
        
        return updateMemberProgress.mutateAsync({
          id: userProgress.id,
          data: { is_finished: false }
        });
      });
      
      await Promise.all(updatePromises);
      
      toast({
        title: 'Progress updated',
        description: 'Week marked as incomplete.',
      });
    } catch (error) {
      console.error('Failed to mark incomplete:', error);
      toast({
        title: 'Failed to update progress',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteWeek = async () => {
    if (!deleteWeekId) return;
    try {
      await deleteWeek.mutateAsync(deleteWeekId);
      toast({ title: 'Week deleted successfully' });
      setDeleteWeekId(null);
    } catch (err) {
      toast({ title: 'Failed to delete week', variant: 'destructive' });
    }
  };

  const handleDeleteItem = async () => {
    if (!deleteItemId) return;
    try {
      await deleteItem.mutateAsync(deleteItemId);
      toast({ title: 'Item deleted successfully' });
      setDeleteItemId(null);
    } catch (err) {
      toast({ title: 'Failed to delete item', variant: 'destructive' });
    }
  };

  if (isLoading) {
    return <WeeksSkeleton />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <AlertCircle className="w-8 h-8 mx-auto text-destructive" />
          <div>
            <p className="font-semibold text-foreground">Failed to load roadmap</p>
            <p className="text-sm text-muted-foreground">Please try again later</p>
          </div>
          <Button onClick={() => window.location.reload()} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 lg:space-y-8">

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

      <div className="space-y-4">
        {weeks.length > 0 ? (
          weeks.map((week, index) => {
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
                    <AccordionTrigger className="px-4 sm:px-6 py-6 hover:no-underline hover:bg-muted/30 group transition-all">
                      <div className="flex items-center gap-4 sm:gap-6 text-left flex-1 min-w-0">
                        <div className={`p-3 rounded-xl shrink-0 shadow-sm transition-transform group-hover:scale-110 ${
                          week.isCompleted 
                            ? 'bg-green-500/10 text-green-500' 
                            : isLocked 
                              ? 'bg-muted text-muted-foreground' 
                              : 'bg-primary/10 text-primary'
                        }`}>
                          {week.isCompleted ? (
                            <CheckCircle2 className="w-6 h-6" />
                          ) : isLocked ? (
                            <Lock className="w-6 h-6" />
                          ) : (
                            <Circle className="w-6 h-6" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge
                              variant={week.isCompleted ? 'default' : 'secondary'}
                              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0 h-5 ${
                                week.isCompleted ? 'bg-green-500 hover:bg-green-600' : ''
                              }`}
                            >
                              Week {week.weekNumber}
                            </Badge>
                            {week.assignmentSubmitted && !isAdmin && (
                              <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider px-2 py-0 h-5 text-green-600 border-green-500/30 bg-green-500/5">
                                Submitted
                              </Badge>
                            )}
                          </div>
                          <h3 className="font-heading font-bold text-foreground text-base sm:text-xl truncate leading-tight">
                            {week.title}
                          </h3>
                        </div>
                        {isAdmin && (
                          <div className="flex items-center gap-2 pr-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-9 w-9 rounded-full bg-background/50 border border-border/50 text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all"
                              onClick={(e) => {
                                e.stopPropagation();
                                const id = parseInt(week.id.toString().replace('week-', ''));
                                if (!isNaN(id)) setEditWeekId(id);
                              }}
                              title="Edit week details"
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 rounded-full bg-background/50 border border-border/50 text-destructive/70 hover:text-destructive hover:bg-destructive/10 hover:border-destructive/30 transition-all"
                              onClick={(e) => {
                                e.stopPropagation();
                                const id = parseInt(week.id.toString().replace('week-', ''));
                                if (!isNaN(id)) setDeleteWeekId(id);
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </AccordionTrigger>
                    
                    <AccordionContent className="px-4 sm:px-6 pb-6">
                      {isLocked ? (
                        <p className="text-sm text-muted-foreground italic py-4">
                          Complete the previous week to unlock this content.
                        </p>
                      ) : (
                        <div className="space-y-6 pt-2">
                          {/* Summary / Notes */}
                          {week.description && (
                            <div className="bg-muted/30 rounded-lg p-4 text-sm text-foreground/80 leading-relaxed border border-border/40">
                               <div className="flex items-center gap-2 mb-2 text-primary">
                                 <MessageSquare className="w-4 h-4" />
                                 <span className="font-semibold text-xs uppercase tracking-wider">Week Overview</span>
                               </div>
                               {week.description}
                            </div>
                          )}

                          {/* All Resources Grid */}
                          <div className="space-y-3">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                              <BookOpen className="w-4 h-4" />
                              Resources & Tasks
                            </p>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                              {(week.items || []).map((item) => {
                                const isSlide = item.title?.toLowerCase().includes('slide');
                                const isQuiz = item.title?.toLowerCase().includes('quiz') || item.title?.toLowerCase().includes('form');
                                const isNote = item.title?.toLowerCase().includes('note');
                                
                                return (
                                  <div key={item.id} className="group relative glass bg-card/30 hover:bg-card/50 rounded-2xl p-4 flex flex-col transition-all duration-300 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5">
                                    <div className="flex items-start gap-4 min-w-0 flex-1">
                                       <div className={`p-3 rounded-xl shrink-0 shadow-inner group-hover:scale-110 transition-transform ${
                                         isSlide ? 'bg-orange-500/15 text-orange-500' : 
                                         isQuiz ? 'bg-purple-500/15 text-purple-500' : 
                                         isNote ? 'bg-blue-500/15 text-blue-500' : 
                                         'bg-primary/15 text-primary'
                                       }`}>
                                         {isSlide ? <Presentation className="w-5 h-5" /> : 
                                          isQuiz ? <ClipboardList className="w-5 h-5" /> : 
                                          <FileText className="w-5 h-5" />}
                                       </div>
                                       <div className="min-w-0 flex-1 pr-2">
                                         <p className="text-sm sm:text-base font-bold text-foreground leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                                           {item.title}
                                         </p>
                                         <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mt-1">
                                           {isSlide ? 'Slideshow' : isQuiz ? 'Activity' : isNote ? 'Documentation' : 'Resource'}
                                         </p>
                                       </div>
                                    </div>
                                    
                                    <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between gap-2">
                                      <div className="flex-1 min-w-0">

                                      {isAdmin && (
                                        <div className="flex items-center">
                                          {Array.isArray(item.week_progress) && item.week_progress.length > 0 ? (
                                             <div 
                                               className="flex items-center h-7 px-2.5 rounded-full bg-primary/5 border border-primary/20 hover:bg-primary/10 transition-all cursor-pointer shadow-sm group/progress"
                                               onClick={(e) => {
                                                 e.stopPropagation();
                                                 setViewItemId(item.id!);
                                               }}
                                             >
                                               <div className="flex items-center gap-2">
                                                  <div className="relative w-1.5 h-1.5 rounded-full bg-primary/20 overflow-hidden shrink-0">
                                                     <div 
                                                       className="absolute top-0 left-0 h-full bg-primary transition-all duration-500" 
                                                       style={{ width: `${(item.week_progress.filter((p: WeekProgress) => p.is_finished).length / item.week_progress.length) * 100}%` }}
                                                     />
                                                  </div>
                                                  <span className="text-[10px] font-bold text-primary whitespace-nowrap">
                                                    {item.week_progress.filter((p: WeekProgress) => p.is_finished).length} <span className="text-primary/30 mx-0.5">/</span> {item.week_progress.length}
                                                    <span className="ml-1 text-[8px] uppercase opacity-60 group-hover/progress:opacity-100 transition-opacity">Done</span>
                                                  </span>
                                               </div>
                                             </div>
                                          ) : (
                                            <Badge variant="outline" className="text-[9px] h-6 text-muted-foreground/50 border-muted-foreground/10 italic font-medium px-2">
                                              Not Assigned
                                            </Badge>
                                          )}
                                        </div>
                                      )}
                                      
                                      {!isAdmin && (
                                        <div className="flex items-center">
                                          {(() => {
                                            const itemWithProgress = item as { week_progress?: any };
                                            const wp = itemWithProgress.week_progress;
                                            if (!wp) return (
                                              <Badge variant="outline" className="text-[9px] h-6 text-muted-foreground/50 border-muted-foreground/10 italic font-medium px-2">
                                                Not Assigned
                                              </Badge>
                                            );

                                            const userProgress = Array.isArray(wp) 
                                              ? wp.find((p: any) => {
                                                  const progressUserId = p.user?.id || p.user;
                                                  return !progressUserId || String(progressUserId) === String(user.id);
                                                })
                                              : wp;
                                            
                                            const isFinished = userProgress?.is_finished || false;
                                            
                                            if (!userProgress?.id) return (
                                              <Badge variant="outline" className="text-[9px] h-6 text-muted-foreground/50 border-muted-foreground/10 italic font-medium px-2">
                                                Not Assigned
                                              </Badge>
                                            );
                                            
                                            return (
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                className={`h-7 px-2 gap-1.5 text-[9px] font-bold uppercase tracking-wider transition-all ${
                                                  isFinished 
                                                    ? 'bg-green-500/10 text-green-500 hover:bg-green-500/15 border border-green-500/20' 
                                                    : 'bg-muted/50 text-muted-foreground hover:bg-muted border border-border/50'
                                                }`}
                                                onClick={async (e) => {
                                                  e.stopPropagation();
                                                  try {
                                                    await updateMemberProgress.mutateAsync({
                                                      id: userProgress.id,
                                                      data: { is_finished: !isFinished }
                                                    });
                                                    
                                                    toast({
                                                      title: isFinished ? 'Marked as incomplete' : 'Marked as complete',
                                                      description: isFinished ? 'Keep working on it!' : 'Great job!',
                                                    });
                                                  } catch (error) {
                                                    toast({
                                                      title: 'Failed to update progress',
                                                      variant: 'destructive',
                                                    });
                                                  }
                                                }}
                                              >
                                                {isFinished ? (
                                                  <>
                                                    <CheckSquare className="w-3 h-3" />
                                                    Finished
                                                  </>
                                                ) : (
                                                  <>
                                                    <Square className="w-3 h-3" />
                                                    Mark Done
                                                  </>
                                                )}
                                              </Button>
                                            );
                                          })()}
                                        </div>
                                      )}
                                      </div>

                                    <div className="flex items-center gap-1.5 shrink-0">
                                      {item.resource && (
                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg bg-background/40 border border-border/40 hover:bg-primary/10 hover:text-primary hover:border-primary/20 shadow-sm" asChild title="View external resource">
                                          <a href={item.resource} target="_blank" rel="noopener noreferrer">
                                            <ExternalLink className="w-3.5 h-3.5" />
                                          </a>
                                        </Button>
                                      )}
                                      
                                      {isAdmin && (
                                        <>
                                          <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-8 w-8 rounded-lg bg-background/40 border border-border/40 hover:bg-primary/10 hover:text-primary hover:border-primary/20 shadow-sm"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              if (item.id !== undefined) {
                                                setEditItemId(item.id);
                                                const wId = parseInt(week.id.toString().replace('week-', ''));
                                                if (!isNaN(wId)) setEditItemWeekId(wId);
                                              }
                                            }}
                                            title="Edit item details"
                                          >
                                            <Pencil className="w-3.5 h-3.5" />
                                          </Button>
                                          <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-8 w-8 rounded-lg bg-background/40 border border-border/40 text-destructive/70 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 shadow-sm"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              if (item.id !== undefined) setDeleteItemId(item.id);
                                            }}
                                            title="Delete item"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </Button>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                );
                              })}
                              
                              {(week.items?.length ?? 0) === 0 && (
                                 <div className="col-span-full py-8 text-center border-2 border-dashed border-border/40 rounded-xl">
                                    <p className="text-sm text-muted-foreground">No resources added for this week yet.</p>
                                 </div>
                              )}
                            </div>
                          </div>

                          {/* Admin Control Bar */}
                          {isAdmin && (
                            <div className="pt-4 border-t border-border/50 flex flex-wrap gap-2 justify-end">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-xs font-semibold h-8 border-primary/30 text-primary hover:bg-primary/5"
                                onClick={() => {
                                  const id = parseInt(week.id.toString().replace('week-', ''));
                                  if (!isNaN(id)) {
                                    setAddItemWeek({ id, title: week.title });
                                  }
                                }}
                              >
                                <Plus className="w-3.5 h-3.5 mr-1.5" />
                                Add New Content
                              </Button>
                            </div>
                          )}

                          {/* Student Progress Actions */}
                          {!isAdmin && (
                            <div className="pt-4 border-t border-border/50 flex justify-between items-center">
                              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-[0.2em]">Track Your Milestone</span>
                              {week.isCompleted ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleMarkIncomplete(week.id)}
                                  className="text-muted-foreground h-9"
                                >
                                  <CheckCircle2 className="w-4 h-4 mr-2 text-green-600" />
                                  Completed
                                </Button>
                              ) : (
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => handleMarkComplete(week.id)}
                                  className="h-9"
                                >
                                  <CheckCircle2 className="w-4 h-4 mr-2" />
                                  Mark as Completed
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </Card>
            );
          })
        ) : (
          <Card className="border-dashed border-2 animate-fade-in">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="p-4 rounded-full bg-muted mb-4">
                <BookOpen className="w-12 h-12 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold text-foreground">No Weeks Added Yet</h3>
              <p className="text-muted-foreground max-w-sm mt-3 mb-6">
                {isAdmin 
                  ? "Your curriculum is waiting to be built. Start by creating the first week of content." 
                  : "The learning path is being prepared. Check back soon for the first week of content!"}
              </p>
              {isAdmin && (
                <Button variant="gradient" onClick={() => setIsAddDialogOpen(true)} className="gap-2 shadow-lg">
                  <Plus className="w-4 h-4" />
                  Create First Week
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dialogs */}
      <AddWeekDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        nextWeekNumber={weeks.length + 1}
      />
      
      {addItemWeek && (
        <AddWeekItemDialog
          open={!!addItemWeek}
          onOpenChange={(open) => !open && setAddItemWeek(null)}
          weekId={addItemWeek.id}
          weekTitle={addItemWeek.title}
        />
      )}

      {editWeekId !== null && (
        <EditWeekDialog
          open={editWeekId !== null}
          onOpenChange={(open) => !open && setEditWeekId(null)}
          weekId={editWeekId}
        />
      )}

      {editItemId !== null && (
        <EditWeekItemDialog
          open={editItemId !== null}
          onOpenChange={(open) => {
            if (!open) {
              setEditItemId(null);
              setEditItemWeekId(null);
            }
          }}
          itemId={editItemId}
          weekId={editItemWeekId || 0}
        />
      )}

      {viewItemId !== null && (
        <ViewItemProgressDialog
          open={viewItemId !== null}
          onOpenChange={(open) => !open && setViewItemId(null)}
          itemId={viewItemId}
        />
      )}

      <DeleteConfirmationDialog
        open={deleteWeekId !== null}
        onOpenChange={(open) => !open && setDeleteWeekId(null)}
        onConfirm={handleDeleteWeek}
        title="Delete Week?"
        description="This will permanently delete this week and all its items. This action cannot be undone."
        isLoading={deleteWeek.isPending}
      />

      <DeleteConfirmationDialog
        open={deleteItemId !== null}
        onOpenChange={(open) => !open && setDeleteItemId(null)}
        onConfirm={handleDeleteItem}
        title="Delete Item?"
        description="This will permanently delete this item from the week. This action cannot be undone."
        isLoading={deleteItem.isPending}
      />
    </div>
  );
}
