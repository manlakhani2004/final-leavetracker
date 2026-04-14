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
    <header
      className="sticky top-0 z-40 backdrop-blur-xl border-b"
      style={{
        background: 'var(--topbar-bg)',
        borderColor: 'var(--topbar-border)'
      }}
    >
      <div className="flex h-20 items-center justify-between px-8 sm:px-10 lg:px-12">
        {/* Left Section: Mobile Menu & Organization */}
        <div className="flex items-center gap-6">
          <button
            type="button"
            className="p-2 lg:hidden rounded-xl transition-all"
            style={{ color: 'var(--text-muted)' }}
            onClick={onMenuClick}
          >
            <Menu size={24} />
          </button>

          <div
            className="flex items-center gap-4 px-4 py-2 rounded-2xl border shadow-sm animate-in fade-in slide-in-from-left duration-700"
            style={{
              background: 'var(--topbar-search-bg)',
              borderColor: 'var(--topbar-search-border)'
            }}
          >
            <div
              className="h-2.5 w-2.5 rounded-full animate-pulse"
              style={{
                background: 'var(--status-dot)',
                boxShadow: `0 0 10px var(--primary-shadow)`
              }}
            />
            <span
              className="text-sm font-bold tracking-tight whitespace-nowrap"
              style={{ color: 'var(--topbar-text)' }}
            >
              {organization?.name || 'Organization'}
            </span>
          </div>
        </div>

        {/* Right Section: Search, Notifications, Profile */}
        <div className="flex items-center gap-8">
          {/* Search Bar */}
          <div className="hidden md:block relative group">
            {/* <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors"
              style={{ color: 'var(--text-muted)' }}
            /> */}
            {/* <input
              type="text"
              placeholder="Quick search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-72 pl-12 pr-6 py-2.5 border rounded-2xl focus:outline-none focus:ring-2 text-sm transition-all"
              style={{
                background: 'var(--topbar-search-bg)',
                borderColor: 'var(--topbar-search-border)',
                color: 'var(--topbar-text)',
              }}
            /> */}
          </div>

          <div className="flex items-center gap-4">
            {/* <button
              className="relative p-2.5 rounded-2xl transition-all group"
              style={{ color: 'var(--text-muted)' }}
            >
              <Bell size={20} />
              <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-rose-500 rounded-full ring-2 ring-white animate-bounce" />
            </button> */}

            <div className="h-8 w-px" style={{ background: 'var(--border)' }} />

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-4 p-1 rounded-2xl transition-all group"
              >
                <div
                  className="h-10 w-10 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-lg ring-2 ring-white group-hover:scale-105 transition-all"
                  style={{
                    background: `linear-gradient(135deg, var(--avatar-from), var(--avatar-to))`,
                    boxShadow: `0 10px 15px -3px var(--avatar-shadow)`
                  }}
                >
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="hidden sm:flex flex-col items-start pr-2">
                  <p
                    className="text-sm font-bold transition-colors"
                    style={{ color: 'var(--topbar-text)' }}
                  >
                    {user?.name || 'User'}
                  </p>
                  <p
                    className="text-[10px] font-bold tracking-wider uppercase"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {user?.role?.replace('_', ' ') || 'Role'}
                  </p>
                </div>
                <ChevronDown className={cn(
                  "hidden sm:block h-4 w-4 transition-transform duration-300",
                  showProfileMenu && "rotate-180"
                )} style={{ color: 'var(--text-muted)' }} />
              </button>

              {showProfileMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowProfileMenu(false)} />
                  <div
                    className="absolute right-0 mt-4 w-64 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] ring-1 p-2 z-20 animate-in fade-in zoom-in-95 duration-200 origin-top-right"
                    style={{
                      background: 'var(--surface)',
                      borderColor: 'var(--border-light)',
                    }}
                  >
                    <div className="px-4 py-4" style={{ borderBottom: `1px solid var(--border-light)` }}>
                      <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{user?.name}</p>
                      <p className="text-xs truncate font-medium" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
                    </div>

                    <div className="py-2">
                      <a
                        href="/profile"
                        className="flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-2xl transition-all"
                        style={{ color: 'var(--text-secondary)' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'var(--primary-light)';
                          e.currentTarget.style.color = 'var(--primary-text)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.color = 'var(--text-secondary)';
                        }}
                      >
                        <UserCircle size={18} />
                        My Profile
                      </a>
                      <a
                        href="/dashboard"
                        className="flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-2xl transition-all"
                        style={{ color: 'var(--text-secondary)' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'var(--primary-light)';
                          e.currentTarget.style.color = 'var(--primary-text)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.color = 'var(--text-secondary)';
                        }}
                      >
                        <LayoutDashboard size={18} />
                        My Dashboard
                      </a>
                      <a
                        href="/settings"
                        className="flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-2xl transition-all"
                        style={{ color: 'var(--text-secondary)' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'var(--primary-light)';
                          e.currentTarget.style.color = 'var(--primary-text)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.color = 'var(--text-secondary)';
                        }}
                      >
                        <Settings size={18} />
                        Settings
                      </a>
                    </div>

                    <div className="pt-2 mt-2" style={{ borderTop: `1px solid var(--border-light)` }}>
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
