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
  { name: 'Profile', href: '/profile', icon: UserCircle, roles: ['all'] },
  { name: 'Settings', href: '/settings', icon: Settings, roles: ['org_admin'] },
];

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
  theme?: 'admin' | 'hr' | 'manager' | 'employee';
}

const themeColors = {
  admin: {
    active: 'bg-indigo-600 text-white shadow-[0_8px_20px_-6px_rgba(79,70,229,0.5)]',
    hover: 'hover:bg-indigo-50 hover:text-indigo-600',
    iconActive: 'text-white',
    iconInactive: 'text-slate-400 group-hover:text-indigo-500',
    accent: 'bg-indigo-600',
  },
  hr: {
    active: 'bg-rose-500 text-white shadow-[0_8px_20px_-6px_rgba(244,63,94,0.5)]',
    hover: 'hover:bg-rose-50 hover:text-rose-600',
    iconActive: 'text-white',
    iconInactive: 'text-slate-400 group-hover:text-rose-500',
    accent: 'bg-rose-500',
  },
  manager: {
    active: 'bg-blue-600 text-white shadow-[0_8px_20px_-6px_rgba(37,99,235,0.5)]',
    hover: 'hover:bg-blue-50 hover:text-blue-600',
    iconActive: 'text-white',
    iconInactive: 'text-slate-400 group-hover:text-blue-500',
    accent: 'bg-blue-600',
  },
  employee: {
    active: 'bg-emerald-600 text-white shadow-[0_8px_20px_-6px_rgba(5,150,105,0.5)]',
    hover: 'hover:bg-emerald-50 hover:text-emerald-600',
    iconActive: 'text-white',
    iconInactive: 'text-slate-400 group-hover:text-emerald-500',
    accent: 'bg-emerald-600',
  },
};

export function Sidebar({ collapsed = false, onToggle, theme = 'employee' }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const colors = themeColors[theme];

  const filteredNavigation = navigation.filter((item) => {
    if (!user) return false;
    if (item.roles?.includes('all')) return true;
    return item.roles?.includes(user.role);
  });

  return (
    <div className={cn(
      "flex h-full flex-col bg-white transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]",
      collapsed ? "w-24" : "w-80"
    )}>
      {/* Toggle Button Container */}
      <div className="relative h-4 w-full">
        <button
          onClick={onToggle}
          className={cn(
            "absolute -right-4 top-8 flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition-all duration-300 hover:scale-110 hover:text-indigo-600 z-50",
          )}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 px-6 py-10">
        {!collapsed && (
          <p className="mb-4 px-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
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
                isActive ? colors.active : colors.hover,
                collapsed ? "justify-center" : "gap-x-4"
              )}
            >
              <item.icon 
                size={20}
                className={cn(
                  "shrink-0 transition-transform duration-300 group-hover:scale-110",
                  isActive ? colors.iconActive : colors.iconInactive
                )} 
              />
              {!collapsed && <span className="truncate">{item.name}</span>}
              {collapsed && (
                <div className="absolute left-[calc(100%+1.5rem)] rounded-lg bg-slate-900 px-3 py-1.5 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 whitespace-nowrap z-50 shadow-xl pointer-events-none">
                  {item.name}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      {user && (
        <div className="mt-auto border-t border-slate-100 p-6">
          <div className={cn(
            "flex items-center rounded-2xl p-3 transition-colors",
            collapsed ? "justify-center" : "gap-x-4 bg-slate-50/50"
          )}>
            <div className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white font-bold shadow-lg shadow-indigo-200 ring-2 ring-white",
              colors.accent
            )}>
              {user.name?.charAt(0).toUpperCase()}
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-slate-900">{user.name}</p>
                <p className="truncate text-[10px] font-bold uppercase tracking-wider text-slate-500">
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
