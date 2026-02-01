import { useState } from 'react';
import { useTasks, useCreateTask } from '../features/tasks/hooks';
import { useMe } from '../features/auth/hooks';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export default function TasksListPage() {
  const { data: user } = useMe();
  const { data: tasks, isLoading, error } = useTasks();
  const createTask = useCreateTask();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', committee: '' });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTask.mutateAsync(newTask);
      setIsDialogOpen(false);
      setNewTask({ title: '', description: '', committee: '' });
      toast.success('Task created successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to create task');
    }
  };

  if (isLoading) return <div className="p-8 text-center">Loading tasks...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error loading tasks</div>;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
        {user?.role === 'admin' && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>Create Task</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input 
                    id="title"
                    value={newTask.title} 
                    onChange={e => setNewTask({...newTask, title: e.target.value})} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description"
                    value={newTask.description} 
                    onChange={e => setNewTask({...newTask, description: e.target.value})} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="committee">Committee</Label>
                  <Input 
                    id="committee"
                    value={newTask.committee} 
                    onChange={e => setNewTask({...newTask, committee: e.target.value})} 
                    required 
                  />
                </div>
                <div className="flex justify-end gap-2">
                   <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                   <Button type="submit" disabled={createTask.isPending}>
                    {createTask.isPending ? 'Creating...' : 'Create'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {tasks?.map(task => (
          <Link key={task.id} to={`/tasks/${task.id}`} className="block h-full">
            <Card className="h-full hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4 border-l-primary">
              <CardHeader>
                <CardTitle className="text-xl">{task.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground line-clamp-3">{task.description}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t">
                  <span className="bg-secondary px-2 py-1 rounded">
                    {task.committee}
                  </span>
                  <span>
                    {new Date(task.created_at).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
        {tasks?.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground">
                No tasks found.
            </div>
        )}
      </div>
    </div>
  );
}
