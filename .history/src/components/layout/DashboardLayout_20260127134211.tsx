import { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Sidebar } from './Sidebar';
import { Button } from '@/components/ui/button';
import { Menu, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DashboardLayout() {
  const { isAuthenticated } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
        {/* Mobile Header */}
        <div className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between p-4 bg-background/80 backdrop-blur-md border-b h-16">
             <div className="flex items-center gap-2">
                 <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent shrink-0">
                    <Star className="w-4 h-4 text-primary-foreground" />
                 </div>
                 <span className="font-heading font-bold text-foreground">Star Union</span>
             </div>
             <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
                 <Menu className="w-5 h-5" />
             </Button>
        </div>

      <Sidebar 
        open={sidebarOpen} 
        setOpen={setSidebarOpen} 
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />
      
      {/* Add padding-top on mobile for the fixed header */}
      <main 
        className={cn(
            "pt-16 lg:pt-0 transition-all duration-300",
            isCollapsed ? "lg:pl-[80px]" : "lg:pl-[280px]"
        )}
      >
        <div className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
