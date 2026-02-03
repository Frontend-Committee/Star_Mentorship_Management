import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  BookOpen,
  FolderKanban,
  CalendarCheck,
  Bell,
  MessageSquare,
  Settings,
  Users,
  LogOut,
  Star,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  ListTodo,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const memberNavItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: BookOpen, label: 'Weeks', path: '/weeks' },
  // { icon: FolderKanban, label: 'Projects', path: '/projects' },
  { icon: ListTodo, label: 'Tasks', path: '/tasks' },
  { icon: CalendarCheck, label: 'Attendance', path: '/attendance' },
  { icon: Bell, label: 'Announcements', path: '/announcements' },
  { icon: MessageSquare, label: 'Feedback', path: '/feedback' },
  { icon: Users, label: 'Profile', path: '/profile' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

const adminNavItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: BookOpen, label: 'Content', path: '/weeks' },
  // { icon: FolderKanban, label: 'Projects', path: '/projects' },
  { icon: ListTodo, label: 'Tasks', path: '/tasks' },
  { icon: CalendarCheck, label: 'Attendance', path: '/attendance' },
  { icon: Bell, label: 'Announcements', path: '/announcements' },
  { icon: Users, label: 'Members', path: '/members' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

function SidebarContent({
  isCollapsed,
  onCollapse,
  onNavClick,
}: {
  isCollapsed: boolean;
  onCollapse?: () => void;
  onNavClick?: () => void;
}) {
  const { user, logout } = useAuth();
  const navItems = user?.role === 'admin' ? adminNavItems : memberNavItems;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg overflow-hidden shrink-0">
          <img src="/logo-removebg-preview.png" alt="STAR Logo" className="w-full h-full object-contain" />
        </div>
        {!isCollapsed && (
          <div className="overflow-hidden">
            <h1 className="font-heading font-bold text-sidebar-foreground truncate">
              STAR
            </h1>
            <p className="text-xs text-sidebar-foreground/60 truncate">
              {user?.committee ? `Committee #${user.committee}` : 'Member'}
            </p>
          </div>
        )}
      </div>

      {/* Navigation ... */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onNavClick}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-primary'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
              )
            }
          >
            <item.icon className="w-5 h-5 shrink-0" />
            {!isCollapsed && (
              <span className="text-sm font-medium truncate">{item.label}</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 mt-auto space-y-3">
        {!isCollapsed && (
          <div className="px-3 py-2 text-xs font-medium text-sidebar-foreground/40 uppercase tracking-wider">
            Account
          </div>
        )}
        
        <div className={cn(
          "flex items-center gap-3 p-2 rounded-lg bg-sidebar-accent/50 border border-sidebar-border",
          isCollapsed && "justify-center p-0 w-10 h-10 rounded-full border-none bg-transparent"
        )}>
          <Avatar className="w-8 h-8 border-2 border-background shadow-sm shrink-0">
            {user?.img && <AvatarImage src={user.img} alt={`${user.first_name} ${user.last_name}`} />}
            <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-xs font-bold">
              {user?.first_name?.[0]}
              {user?.last_name?.[0]}
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-xs text-sidebar-foreground/60 truncate">
                {user?.email}
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-2">
           {!isCollapsed && <div className="flex-1"><ThemeToggle /></div>}
           <Button
             variant="ghost"
             size="icon"
             className={cn("text-sidebar-foreground/70 hover:text-destructive hover:bg-destructive/10", !isCollapsed && "shrink-0")}
             onClick={logout}
             title="Sign out"
           >
             <LogOut className="w-5 h-5" />
           </Button>
        </div>
        {isCollapsed && (
            <div className="flex justify-center mt-2">
                <ThemeToggle />
            </div>
        )}
      </div>
    </div>
  );
}

export function Sidebar({ 
    open, 
    setOpen,
    isCollapsed,
    setIsCollapsed
}: { 
    open: boolean; 
    setOpen: (open: boolean) => void;
    isCollapsed: boolean;
    setIsCollapsed: (collapsed: boolean) => void;
}) {
  const location = useLocation();

  // Close mobile menu on route change
  useEffect(() => {
    setOpen(false);
  }, [location.pathname, setOpen]);

  return (
    <>
      {/* Mobile Sidebar */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="p-0 w-[280px] bg-sidebar border-r border-sidebar-border">
          <SidebarContent isCollapsed={false} onNavClick={() => setOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col h-screen sticky top-0 bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out",
          isCollapsed ? "w-[80px]" : "w-[280px]"
        )}
      >
        <SidebarContent isCollapsed={isCollapsed} />
        
        {/* Collapse Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute -right-3 top-20 w-6 h-6 rounded-full border border-border bg-background shadow-sm text-muted-foreground hover:text-foreground hidden lg:flex"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? (
            <ChevronRight className="w-3 h-3" />
          ) : (
            <ChevronLeft className="w-3 h-3" />
          )}
        </Button>
      </aside>
    </>
  );
}
