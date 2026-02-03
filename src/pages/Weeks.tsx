import { useState, useMemo } from 'react';
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
import { useWeeks, useDeleteWeek, useDeleteWeekItem } from '@/features/weeks/hooks';
import { DeleteConfirmationDialog } from '@/components/dialogs/DeleteConfirmationDialog';
import { mockWeekContent } from '@/data/mockData';
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
  const [viewItemId, setViewItemId] = useState<number | null>(null);
  const [deleteWeekId, setDeleteWeekId] = useState<number | null>(null);
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);
  
  // Mutations
  const deleteWeek = useDeleteWeek();
  const deleteItem = useDeleteWeekItem();
  
  // Fetch weeks from API (role-based)
  const { data: apiWeeks, isLoading, error } = useWeeks(user?.role);

  // Use mock data if API returns 404 or 500 (endpoint not implemented or crashing)
  const useMockData = error && typeof error === 'object' && 'response' in error && 
    [404, 500].includes((error as { response?: { status?: number } }).response?.status ?? 0);

  // Transform API data to UI format, or use mock data as fallback
  const weeks = useMemo<WeekContent[]>(() => {
    if (useMockData) {
      console.log('Using mock data - API endpoint not available yet');
      return mockWeekContent;
    }

    if (!apiWeeks) return [];

    return apiWeeks.map((week: any) => {
      // For students, find their specific progress entry in the array
      // Handle both member API (week.items) and admin API (week.week_items)
      const items = week.week_items || week.items || [];
      const isCompleted = items.length > 0 && items.every((item: any) => 
        Array.isArray(item.week_progress) && item.week_progress.some((p: any) => p.is_finished && (!user?.id || p.user?.id === user.id || !p.user))
      );
      
      return {
        id: week.id?.toString() ?? `week-${week.number}`,
        weekNumber: week.number,
        title: week.title,
        description: (items.length > 0) ? items[0].notes || '' : '', 
        isCompleted,
        // Store all items for direct display
        items: items,
        // Fallbacks for legacy components
        notes: items.find(item => item.title.toLowerCase().includes('note'))?.resource,
        slides: items.find(item => item.title.toLowerCase().includes('slide'))?.resource,
        challengeLink: items.find(item => item.title.toLowerCase().includes('challenge'))?.resource,
        formLink: items.find(item => item.title.toLowerCase().includes('form'))?.resource,
      };
    });
  }, [apiWeeks, useMockData, user?.id]);

  const completedWeeks = weeks.filter((w) => w.isCompleted).length;
  const progressPercentage = weeks.length > 0 ? Math.round((completedWeeks / weeks.length) * 100) : 0;

  const handleMarkComplete = (weekId: string) => {
    toast({
      title: 'Week Completed!',
      description: 'Great progress! Keep up the good work.',
    });
  };

  const handleMarkIncomplete = (weekId: string) => {
    console.log('Mark incomplete:', weekId);
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
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading weeks...</p>
        </div>
      </div>
    );
  }

  if (error && !useMockData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <AlertCircle className="w-8 h-8 mx-auto text-destructive" />
          <div>
            <p className="font-semibold text-foreground">Failed to load weeks</p>
            <p className="text-sm text-muted-foreground">Please try again later</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      {useMockData && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30 rounded-lg p-4 animate-fade-in">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Using Demo Data
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                The backend API endpoint is not available yet. Displaying sample data for demonstration purposes.
              </p>
            </div>
          </div>
        </div>
      )}

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
                        </div>
                        <h3 className="font-semibold text-foreground mt-1 text-sm sm:text-base truncate">
                          {week.title}
                        </h3>
                      </div>
                      {isAdmin && !useMockData && (
                        <div className="flex items-center gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              const id = parseInt(week.id.toString().replace('week-', ''));
                              if (!isNaN(id)) setEditWeekId(id);
                            }}
                            title="Edit week details"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0 ml-2"
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
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {(week.items || []).map((item) => {
                              const isSlide = item.title?.toLowerCase().includes('slide');
                              const isQuiz = item.title?.toLowerCase().includes('quiz') || item.title?.toLowerCase().includes('form');
                              const isNote = item.title?.toLowerCase().includes('note');
                              
                              return (
                                <div key={item.id} className="group relative bg-card hover:bg-muted/50 border border-border/50 rounded-xl p-3 flex items-center justify-between transition-all duration-200 shadow-sm hover:shadow-md">
                                  <div className="flex items-center gap-3 overflow-hidden">
                                     <div className={`p-2 rounded-lg ${isSlide ? 'bg-orange-100 text-orange-600' : isQuiz ? 'bg-purple-100 text-purple-600' : isNote ? 'bg-blue-100 text-blue-600' : 'bg-primary/10 text-primary'}`}>
                                       {isSlide ? <Presentation className="w-4 h-4" /> : isQuiz ? <ClipboardList className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                                     </div>
                                     <div className="min-w-0">
                                       <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">{item.title}</p>
                                       <p className="text-[10px] text-muted-foreground uppercase">{isSlide ? 'Slideshow' : isQuiz ? 'Activity' : isNote ? 'Documentation' : 'Resource'}</p>
                                     </div>
                                  </div>

                                  <div className="flex items-center gap-1">
                                    {(Array.isArray(item.week_progress) && item.week_progress.some(p => p.is_finished && (!user?.id || p.user?.id === user.id))) && !isAdmin && (
                                      <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 border-none text-[10px] h-6 px-2">
                                        <CheckCircle2 className="w-3 h-3 mr-1" />
                                        Finished
                                      </Badge>
                                    )}

                                    {isAdmin && (
                                      <div className="flex items-center gap-2 mr-2">
                                        {Array.isArray(item.week_progress) && item.week_progress.length > 0 ? (
                                           <Badge 
                                             variant="outline" 
                                             className="text-[10px] h-6 border-primary/20 bg-primary/5 text-primary cursor-pointer hover:bg-primary/10 transition-colors"
                                             onClick={(e) => {
                                               e.stopPropagation();
                                               setViewItemId(item.id!);
                                             }}
                                           >
                                             {item.week_progress.filter((p: WeekProgress) => p.is_finished).length} / {item.week_progress.length} Done
                                           </Badge>
                                        ) : (
                                          <Badge variant="outline" className="text-[10px] h-6 text-muted-foreground italic">
                                            No tracking
                                          </Badge>
                                        )}
                                      </div>
                                    )}

                                    {item.resource && (
                                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary" asChild title="View external resource">
                                        <a href={item.resource} target="_blank" rel="noopener noreferrer">
                                          <ExternalLink className="w-4 h-4" />
                                        </a>
                                      </Button>
                                    )}
                                    
                                    {isAdmin && (
                                      <>
                                        <Button 
                                          variant="ghost" 
                                          size="icon" 
                                          className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            if (item.id !== undefined) setEditItemId(item.id);
                                          }}
                                          title="Edit item details"
                                        >
                                          <Pencil className="w-3.5 h-3.5" />
                                        </Button>
                                        <Button 
                                          variant="ghost" 
                                          size="icon" 
                                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
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
        })}
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
          onOpenChange={(open) => !open && setEditItemId(null)}
          itemId={editItemId}
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
