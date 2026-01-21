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
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const memberNavItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: BookOpen, label: 'Weeks', path: '/weeks' },
  { icon: FolderKanban, label: 'Projects', path: '/projects' },
  { icon: CalendarCheck, label: 'Attendance', path: '/attendance' },
  { icon: Bell, label: 'Announcements', path: '/announcements' },
  { icon: MessageSquare, label: 'Feedback', path: '/feedback' },
  { icon: Users, label: 'Profile', path: '/profile' },
];

const adminNavItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: BookOpen, label: 'Content', path: '/weeks' },
  { icon: FolderKanban, label: 'Projects', path: '/projects' },
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
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-sidebar-primary to-accent shrink-0">
          <Star className="w-5 h-5 text-sidebar-primary-foreground" />
        </div>
        {!isCollapsed && (
          <div className="overflow-hidden">
            <h1 className="font-heading font-bold text-sidebar-foreground truncate">
              STAR
            </h1>
            <p className="text-xs text-sidebar-foreground/60 truncate">
              {user?.committee} Committee
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
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

      {/* User Section */}
      <div className="p-3 border-t border-sidebar-border">
        {!isCollapsed && (
          <div className="flex items-center gap-3 p-2 mb-2">
            <Avatar className="w-9 h-9">
              <AvatarFallback className="bg-sidebar-accent text-sidebar-foreground text-sm">
                {user?.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {user?.name}
              </p>
              <p className="text-xs text-sidebar-foreground/60 capitalize truncate">
                {user?.role}
              </p>
            </div>
          </div>
        )}
        <div
          className={cn(
            'flex items-center gap-2',
            isCollapsed ? 'justify-center' : 'justify-between'
          )}
        >
          <Button
            variant="ghost"
            className={cn(
              'flex-1 justify-start gap-3 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50',
              isCollapsed && 'justify-center flex-none'
            )}
            onClick={logout}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span>Sign out</span>}
          </Button>
          {!isCollapsed && <ThemeToggle />}
        </div>
      </div>
    </div>
  );
}

export default function Sidebar() {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-sidebar border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-sidebar-primary to-accent">
            <Star className="w-5 h-5 text-sidebar-primary-foreground" />
          </div>
          <h1 className="font-heading font-bold text-sidebar-foreground">STAR</h1>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-sidebar-foreground">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64 bg-sidebar border-sidebar-border">
              <SidebarContent
                isCollapsed={false}
                onNavClick={() => setIsMobileOpen(false)}
              />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden lg:flex fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 flex-col',
          isCollapsed ? 'w-16' : 'w-64'
        )}
      >
        <SidebarContent isCollapsed={isCollapsed} onCollapse={() => setIsCollapsed(!isCollapsed)} />

        {/* Collapse Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-sidebar border border-sidebar-border rounded-full flex items-center justify-center text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </aside>
    </>
  );
}
