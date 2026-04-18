'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { notificationService } from '@/lib/services';
import {
  Menu,
  Bell,
  LogOut,
  Settings,
  ChevronDown,
  LayoutDashboard,
  UserCircle,
  CheckCheck,
  FileText,
  CheckCircle2,
  XCircle,
  Ban,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TopbarProps {
  onMenuClick: () => void;
  theme?: 'admin' | 'hr' | 'manager' | 'employee';
}

// Notification type config for icons and colors
const notificationConfig: Record<string, { icon: any; color: string; bg: string }> = {
  leave_applied: { icon: FileText, color: '#6366f1', bg: 'rgba(99, 102, 241, 0.1)' },
  leave_approved: { icon: CheckCircle2, color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
  leave_rejected: { icon: XCircle, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' },
  leave_cancelled: { icon: Ban, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
  leave_reminder: { icon: Clock, color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)' },
  system: { icon: Bell, color: '#64748b', bg: 'rgba(100, 116, 139, 0.1)' },
};

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const diff = now - new Date(dateStr).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function Topbar({ onMenuClick, theme = 'employee' }: TopbarProps) {
  const { user, organization, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);

  // Poll unread count every 30 seconds
  const fetchUnreadCount = useCallback(async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  // Fetch latest notifications when dropdown opens
  const openNotifications = async () => {
    setShowNotifications(true);
    setShowProfileMenu(false);
    setNotifLoading(true);
    try {
      const res = await notificationService.getNotifications({ limit: 8 });
      setNotifications(res.data || []);
    } catch {
      setNotifications([]);
    } finally {
      setNotifLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)),
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      // silently fail
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // silently fail
    }
  };

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

        {/* Right Section: Notifications, Profile */}
        <div className="flex items-center gap-8">
          <div className="hidden md:block relative group" />

          <div className="flex items-center gap-4">
            {/* ── Notification Bell ── */}
            <div className="relative">
              <button
                onClick={() => {
                  if (showNotifications) {
                    setShowNotifications(false);
                  } else {
                    openNotifications();
                  }
                }}
                className="relative p-2.5 rounded-2xl transition-all hover:scale-105"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--primary-light)';
                  e.currentTarget.style.color = 'var(--primary-text)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-muted)';
                }}
                id="notification-bell"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center h-5 min-w-5 px-1 text-[10px] font-black text-white rounded-full shadow-lg animate-in zoom-in duration-300"
                    style={{
                      background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                      boxShadow: '0 2px 8px rgba(239, 68, 68, 0.5)',
                    }}
                  >
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              {/* ── Notification Dropdown ── */}
              {showNotifications && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowNotifications(false)}
                  />
                  <div
                    className="absolute right-0 mt-4 w-[420px] max-h-[520px] rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.15)] ring-1 z-20 animate-in fade-in zoom-in-95 duration-200 origin-top-right flex flex-col overflow-hidden"
                    style={{
                      background: 'var(--surface)',
                      borderColor: 'var(--border-light)',
                    }}
                  >
                    {/* Header */}
                    <div
                      className="px-6 py-4 flex items-center justify-between shrink-0"
                      style={{ borderBottom: '1px solid var(--border-light)' }}
                    >
                      <div className="flex items-center gap-3">
                        <h3
                          className="text-sm font-black uppercase tracking-wider"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          Notifications
                        </h3>
                        {unreadCount > 0 && (
                          <span
                            className="px-2 py-0.5 text-[10px] font-black rounded-full text-white"
                            style={{
                              background: 'linear-gradient(135deg, var(--primary-gradient-from), var(--primary-gradient-to))',
                            }}
                          >
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllRead}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded-xl transition-all hover:scale-105"
                            style={{
                              color: 'var(--primary-text)',
                              background: 'var(--primary-light)',
                            }}
                          >
                            <CheckCheck size={13} />
                            Mark all read
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Notification List */}
                    <div className="flex-1 overflow-y-auto">
                      {notifLoading ? (
                        <div className="px-6 py-10 text-center">
                          <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--primary)' }} />
                          <p className="text-xs mt-3 font-semibold" style={{ color: 'var(--text-muted)' }}>Loading…</p>
                        </div>
                      ) : notifications.length === 0 ? (
                        <div className="px-6 py-14 text-center">
                          <div className="h-14 w-14 mx-auto rounded-2xl flex items-center justify-center mb-4" style={{ background: 'var(--surface-secondary)' }}>
                            <Bell size={24} style={{ color: 'var(--text-muted)' }} />
                          </div>
                          <p className="text-sm font-bold" style={{ color: 'var(--text-secondary)' }}>No notifications yet</p>
                          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>You're all caught up!</p>
                        </div>
                      ) : (
                        <div className="py-2">
                          {notifications.map((n: any) => {
                            const config = notificationConfig[n.type] || notificationConfig.system;
                            const Icon = config.icon;
                            return (
                              <button
                                key={n._id}
                                onClick={() => {
                                  if (!n.isRead) handleMarkAsRead(n._id);
                                }}
                                className={cn(
                                  'w-full flex items-start gap-3.5 px-6 py-4 text-left transition-all relative group',
                                  !n.isRead && 'hover:bg-opacity-50',
                                )}
                                style={{
                                  background: n.isRead ? 'transparent' : 'var(--primary-light)',
                                }}
                                onMouseEnter={(e) => {
                                  if (n.isRead) {
                                    e.currentTarget.style.background = 'var(--surface-hover)';
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = n.isRead ? 'transparent' : 'var(--primary-light)';
                                }}
                              >
                                {/* Unread indicator dot */}
                                {!n.isRead && (
                                  <div
                                    className="absolute left-2 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full"
                                    style={{ background: 'var(--primary)' }}
                                  />
                                )}
                                {/* Icon */}
                                <div
                                  className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                                  style={{ background: config.bg }}
                                >
                                  <Icon size={16} style={{ color: config.color }} />
                                </div>
                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                  <p
                                    className={cn('text-[13px] leading-snug', n.isRead ? 'font-medium' : 'font-bold')}
                                    style={{ color: 'var(--text-primary)' }}
                                  >
                                    {n.title}
                                  </p>
                                  <p
                                    className="text-xs mt-1 leading-relaxed line-clamp-2"
                                    style={{ color: 'var(--text-secondary)' }}
                                  >
                                    {n.message}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1.5">
                                    <span className="text-[10px] font-bold" style={{ color: 'var(--text-muted)' }}>
                                      {timeAgo(n.createdAt)}
                                    </span>
                                    {n.actorId?.name && (
                                      <>
                                        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>•</span>
                                        <span className="text-[10px] font-semibold" style={{ color: 'var(--text-muted)' }}>
                                          by {n.actorId.name}
                                        </span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                      <a
                        href="/notifications"
                        className="flex items-center justify-center gap-2 px-6 py-3.5 text-xs font-bold transition-all shrink-0"
                        style={{
                          color: 'var(--primary-text)',
                          borderTop: '1px solid var(--border-light)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'var(--primary-light)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        View All Notifications
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="h-8 w-px" style={{ background: 'var(--border)' }} />

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotifications(false); }}
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
                        href="/notifications"
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
                        <Bell size={18} />
                        Notifications
                        {unreadCount > 0 && (
                          <span className="ml-auto px-2 py-0.5 text-[10px] font-black rounded-full text-white"
                            style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}
                          >
                            {unreadCount}
                          </span>
                        )}
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
