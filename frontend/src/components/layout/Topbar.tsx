'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Menu, Bell, Search, LogOut, Settings, ChevronDown, LayoutDashboard, UserCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TopbarProps {
  onMenuClick: () => void;
  theme?: 'admin' | 'hr' | 'manager' | 'employee';
}

export function Topbar({ onMenuClick, theme = 'employee' }: TopbarProps) {
  const { user, organization, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-slate-200/50">
      <div className="flex h-20 items-center justify-between px-8 sm:px-10 lg:px-12">
        {/* Left Section: Mobile Menu & Organization */}
        <div className="flex items-center gap-6">
          <button
            type="button"
            className="p-2 text-slate-500 lg:hidden hover:bg-slate-100 rounded-xl transition-all"
            onClick={onMenuClick}
          >
            <Menu size={24} />
          </button>

          <div className="flex items-center gap-4 px-4 py-2 bg-slate-100/50 rounded-2xl border border-slate-200/50 shadow-sm animate-in fade-in slide-in-from-left duration-700">
            <div className="h-2.5 w-2.5 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
            <span className="text-sm font-bold text-slate-700 tracking-tight whitespace-nowrap">
              {organization?.name || 'Organization'}
            </span>
          </div>
        </div>

        {/* Right Section: Search, Notifications, Profile */}
        <div className="flex items-center gap-8">
          {/* Search Bar */}
          <div className="hidden md:block relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 transition-colors group-focus-within:text-indigo-500" />
            <input
              type="text"
              placeholder="Quick search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-72 pl-12 pr-6 py-2.5 bg-slate-100/50 border border-slate-200/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 text-sm transition-all placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2.5 text-slate-500 hover:bg-slate-100 rounded-2xl transition-all group">
              <Bell size={20} className="group-hover:text-indigo-600" />
              <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-rose-500 rounded-full ring-2 ring-white animate-bounce" />
            </button>

            <div className="h-8 w-px bg-slate-200" />

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-4 p-1 rounded-2xl hover:bg-slate-100 transition-all group"
              >
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-indigo-200 ring-2 ring-white group-hover:scale-105 transition-all">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="hidden sm:flex flex-col items-start pr-2">
                  <p className="text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                    {user?.role?.replace('_', ' ') || 'Role'}
                  </p>
                </div>
                <ChevronDown className={cn(
                  "hidden sm:block h-4 w-4 text-slate-400 transition-transform duration-300",
                  showProfileMenu && "rotate-180"
                )} />
              </button>

              {showProfileMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowProfileMenu(false)} />
                  <div className="absolute right-0 mt-4 w-64 rounded-3xl bg-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] ring-1 ring-slate-200/50 p-2 z-20 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                    <div className="px-4 py-4 border-b border-slate-100">
                      <p className="text-sm font-bold text-slate-900">{user?.name}</p>
                      <p className="text-xs text-slate-500 truncate font-medium">{user?.email}</p>
                    </div>
                    
                    <div className="py-2">
                      <a href="/profile" className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-2xl transition-all">
                        <UserCircle size={18} />
                        My Profile
                      </a>
                      <a href="/dashboard" className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-2xl transition-all">
                        <LayoutDashboard size={18} />
                        My Dashboard
                      </a>
                      {user?.role?.toLowerCase().includes('admin') && (
                        <a href="/settings" className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-2xl transition-all">
                          <Settings size={18} />
                          Settings
                        </a>
                      )}
                    </div>
                    
                    <div className="pt-2 mt-2 border-t border-slate-100">
                      <button
                        onClick={() => { logout(); setShowProfileMenu(false); }}
                        className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-rose-600 hover:bg-rose-50 rounded-2xl transition-all"
                      >
                        <LogOut size={18} />
                        Sign out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
