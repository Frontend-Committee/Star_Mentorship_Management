import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { Menu, Star } from 'lucide-react';
import { useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

import { Footer } from './Footer';

export default function DashboardLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between p-4 bg-background/80 backdrop-blur-md border-b h-16">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-white/10 dark:bg-white/90">
            <img src="/MentorshipWebsiteIcon.svg" alt="STAR Logo" className="w-full h-full object-contain" />
          </div>
          <span className="font-heading font-bold text-foreground">STAR</span>
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
          "flex-1 pt-16 lg:pt-0 transition-all duration-300 flex flex-col min-h-screen"
        )}
      >
        <div className="p-4 sm:p-6 lg:p-8 flex-1">
          <Outlet />
        </div>
        <Footer />
      </main>
    </div>
  );
}
