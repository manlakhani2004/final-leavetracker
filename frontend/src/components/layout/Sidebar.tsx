'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Calendar,
  CheckSquare,
  Users,
  Settings,
  FileText,
  Clock,
  ChevronLeft,
  ChevronRight,
  UserCircle,
  Building2,
  BarChart3,
  ShieldAlert,
} from 'lucide-react';

interface NavigationItem {
  name: string;
  href: string;
  icon: any;
  roles?: string[];
}

const navigation: NavigationItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['all'] },
  { name: 'My Leaves', href: '/leaves', icon: Calendar, roles: ['all'] },
  { name: 'Apply Leave', href: '/leaves/apply', icon: FileText, roles: ['all'] },
  { name: 'Approvals', href: '/approvals', icon: CheckSquare, roles: ['org_admin', 'hr_manager', 'manager'] },
  { name: 'Team', href: '/team', icon: Users, roles: ['org_admin', 'hr_manager', 'manager'] },
  { name: 'Departments', href: '/departments', icon: Building2, roles: ['org_admin', 'hr_manager'] },
  { name: 'Users', href: '/users', icon: Users, roles: ['org_admin', 'hr_manager'] },
  { name: 'Leave Types', href: '/leave-types', icon: FileText, roles: ['org_admin', 'hr_manager'] },
  { name: 'Holidays', href: '/holidays', icon: Clock, roles: ['org_admin', 'hr_manager', 'manager'] },
  { name: 'Reports', href: '/reports', icon: BarChart3, roles: ['all'] },
  { name: 'AI Alerts', href: '/ai-alerts', icon: ShieldAlert, roles: ['org_admin', 'hr_manager'] },
  { name: 'Profile', href: '/profile', icon: UserCircle, roles: ['all'] },
  { name: 'Settings', href: '/settings', icon: Settings, roles: ['all'] },
];

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
  theme?: 'admin' | 'hr' | 'manager' | 'employee';
}

export function Sidebar({ collapsed = false, onToggle, theme = 'employee' }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  const filteredNavigation = navigation.filter((item) => {
    if (!user) return false;
    if (item.roles?.includes('all')) return true;
    return item.roles?.includes(user.role);
  });

  return (
    <div 
      className={cn(
        "flex h-full flex-col transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-visible",
        collapsed ? "w-24" : "w-80"
      )}
      style={{ background: 'var(--sidebar)' }}
    >
      {/* Toggle Button Container */}
      <div className="relative h-4 w-full">
        <button
          onClick={onToggle}
          className="absolute -right-2 top-8 flex h-8 w-8 items-center justify-center rounded-full border shadow-sm transition-all duration-300 hover:scale-110 z-50 mr-5"
          style={{
            background: 'var(--surface)',
            borderColor: 'var(--border)',
            color: 'var(--text-secondary)',
          }}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 px-6 py-10">
        {!collapsed && (
          <p 
            className="mb-4 px-2 text-[10px] font-bold uppercase tracking-[0.2em]"
            style={{ color: 'var(--text-muted)' }}
          >
            Main Menu
          </p>
        )}
        {filteredNavigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group relative flex items-center rounded-2xl p-3.5 text-sm font-semibold transition-all duration-300',
                collapsed ? "justify-center" : "gap-x-4"
              )}
              style={isActive ? {
                background: 'var(--sidebar-active)',
                color: 'var(--sidebar-active-text)',
                boxShadow: `0 8px 20px -6px var(--primary-shadow)`,
              } : {
                color: 'var(--sidebar-foreground)',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'var(--sidebar-hover-bg)';
                  e.currentTarget.style.color = 'var(--sidebar-hover-text)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--sidebar-foreground)';
                }
              }}
            >
              <item.icon
                size={20}
                className="shrink-0 transition-transform duration-300 group-hover:scale-110"
              />
              {!collapsed && <span className="truncate">{item.name}</span>}
              {collapsed && (
                <div 
                  className="absolute left-[calc(100%+1.5rem)] rounded-lg px-3 py-1.5 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 whitespace-nowrap z-50 shadow-xl pointer-events-none"
                  style={{ background: 'var(--foreground)' }}
                >
                  {item.name}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      {user && (
        <div className="mt-auto p-6" style={{ borderTop: `1px solid var(--border-light)` }}>
          <div className={cn(
            "flex items-center rounded-2xl p-3 transition-colors",
            collapsed ? "justify-center" : "gap-x-4"
          )}
          style={!collapsed ? { background: 'var(--surface-hover)' } : {}}
          >
            <div 
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white font-bold shadow-lg ring-2 ring-white"
              style={{ 
                background: `linear-gradient(135deg, var(--avatar-from), var(--avatar-to))`,
                boxShadow: `0 10px 15px -3px var(--avatar-shadow)`
              }}
            >
              {user.name?.charAt(0).toUpperCase()}
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{user.name}</p>
                <p className="truncate text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  {user.role?.replace('_', ' ')}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
