import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Can } from '@casl/react';
import {
  Home,
  Clock,
  FileText,
  CalendarCheck,
  ClipboardCheck,
  Users,
  Tags,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { userRoleLabel } from '../enums/UserRole';
import type { Actions, Subjects } from '../auth/abilities';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface NavItem {
  to: string;
  label: string;
  icon: ReactNode;
  ability?: { I: Actions; a: Subjects };
}

const items: NavItem[] = [
  { to: '/home', label: 'Home', icon: <Home className="h-4 w-4" /> },
  {
    to: '/attendance',
    label: 'Check-in / out',
    icon: <Clock className="h-4 w-4" />,
    ability: { I: 'create', a: 'Attendance' },
  },
  { to: '/timesheet', label: 'Timesheet', icon: <FileText className="h-4 w-4" /> },
  {
    to: '/leaves',
    label: 'Apply Leave',
    icon: <CalendarCheck className="h-4 w-4" />,
    ability: { I: 'create', a: 'LeaveRequest' },
  },
  {
    to: '/leaves/approve',
    label: 'Leave Approval',
    icon: <ClipboardCheck className="h-4 w-4" />,
    ability: { I: 'approve', a: 'LeaveRequest' },
  },
  {
    to: '/users',
    label: 'User Management',
    icon: <Users className="h-4 w-4" />,
    ability: { I: 'manage', a: 'User' },
  },
  {
    to: '/leave-types',
    label: 'Leave Configuration',
    icon: <Tags className="h-4 w-4" />,
    ability: { I: 'manage', a: 'LeaveType' },
  },
];

export function Layout() {
  const { user, ability, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  if (!user || !ability) return null;

  const link = (item: NavItem) => (
    <NavLink
      to={item.to}
      end={item.to === '/home'}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
          isActive
            ? 'bg-secondary text-foreground'
            : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
        )
      }
    >
      {item.icon}
      <span>{item.label}</span>
    </NavLink>
  );

  const initial = user.username.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Top bar */}
      <header className="fixed top-0 left-0 right-0 z-40 h-16 border-b bg-card/90 backdrop-blur supports-[backdrop-filter]:bg-card/75">
        <div className="flex h-full items-center justify-between gap-3 px-4 md:px-6">
          <div className="flex items-center gap-2 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden shrink-0"
              onClick={() => setSidebarOpen((o) => !o)}
              aria-label="Toggle menu"
            >
              {sidebarOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
            <h1 className="text-base font-semibold tracking-tight truncate">
              Employee Attendance Portal
            </h1>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Badge variant="secondary" className="hidden sm:inline-flex">
              {userRoleLabel(user.role.name)}
            </Badge>
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold">
                {initial}
              </div>
              <span className="text-sm font-medium hidden sm:inline">
                {user.username}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              title="Logout"
              aria-label="Logout"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-foreground/20 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-16 bottom-0 left-0 z-30 w-64 border-r bg-card transition-transform duration-200 ease-out',
          'md:translate-x-0',
          sidebarOpen
            ? 'translate-x-0'
            : '-translate-x-full md:translate-x-0'
        )}
      >
        <nav className="p-3 space-y-1">
          {items.map((item) =>
            item.ability ? (
              <Can
                key={item.to}
                I={item.ability.I}
                a={item.ability.a}
                ability={ability}
              >
                {link(item)}
              </Can>
            ) : (
              <div key={item.to}>{link(item)}</div>
            )
          )}
        </nav>
      </aside>

      {/* Main */}
      <main className="pt-16 md:pl-64">
        <div className="mx-auto max-w-7xl px-4 md:px-8 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
