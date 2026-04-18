'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { notificationService } from '@/lib/services';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';
import {
  Bell,
  CheckCheck,
  Trash2,
  FileText,
  CheckCircle2,
  XCircle,
  Ban,
  Clock,
  Filter,
  Inbox,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

// Notification type config
const notificationConfig: Record<string, { icon: any; color: string; bg: string; label: string }> = {
  leave_applied: { icon: FileText, color: '#6366f1', bg: 'rgba(99, 102, 241, 0.1)', label: 'Applied' },
  leave_approved: { icon: CheckCircle2, color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', label: 'Approved' },
  leave_rejected: { icon: XCircle, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', label: 'Rejected' },
  leave_cancelled: { icon: Ban, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', label: 'Cancelled' },
  leave_reminder: { icon: Clock, color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)', label: 'Reminder' },
  system: { icon: Bell, color: '#64748b', bg: 'rgba(100, 116, 139, 0.1)', label: 'System' },
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await notificationService.getNotifications({ filter, page, limit: 15 });
      setNotifications(res.data || []);
      setPagination(res.meta || null);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [filter, page]);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [fetchNotifications, fetchUnreadCount]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)),
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      toast.error('Failed to mark as read');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to mark all as read');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      toast.success('Notification deleted');
      fetchUnreadCount();
    } catch {
      toast.error('Failed to delete notification');
    }
  };

  // Group notifications by date
  const groupedNotifications = notifications.reduce((groups: Record<string, any[]>, notif) => {
    const date = new Date(notif.createdAt);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    let label = '';
    if (diffDays === 0) label = 'Today';
    else if (diffDays === 1) label = 'Yesterday';
    else if (diffDays < 7) label = 'This Week';
    else if (diffDays < 30) label = 'This Month';
    else label = 'Older';

    if (!groups[label]) groups[label] = [];
    groups[label].push(notif);
    return groups;
  }, {});

  const dateOrder = ['Today', 'Yesterday', 'This Week', 'This Month', 'Older'];

  return (
    <div className="animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Notifications
          </h1>
          <p className="text-sm mt-1 font-medium" style={{ color: 'var(--text-muted)' }}>
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
              : 'You are all caught up!'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Filter Tabs */}
          <div
            className="flex rounded-2xl p-1 border"
            style={{ background: 'var(--surface-secondary)', borderColor: 'var(--border-light)' }}
          >
            <button
              onClick={() => { setFilter('all'); setPage(1); }}
              className="px-4 py-2 text-xs font-bold rounded-xl transition-all"
              style={{
                background: filter === 'all' ? 'var(--surface)' : 'transparent',
                color: filter === 'all' ? 'var(--text-primary)' : 'var(--text-muted)',
                boxShadow: filter === 'all' ? '0 2px 8px var(--card-shadow)' : 'none',
              }}
            >
              All
            </button>
            <button
              onClick={() => { setFilter('unread'); setPage(1); }}
              className="px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2"
              style={{
                background: filter === 'unread' ? 'var(--surface)' : 'transparent',
                color: filter === 'unread' ? 'var(--text-primary)' : 'var(--text-muted)',
                boxShadow: filter === 'unread' ? '0 2px 8px var(--card-shadow)' : 'none',
              }}
            >
              <Filter size={12} />
              Unread
              {unreadCount > 0 && (
                <span
                  className="px-1.5 py-0.5 text-[10px] font-black rounded-full text-white"
                  style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}
                >
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          {/* Mark All Read Button */}
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-2xl transition-all hover:scale-105"
              style={{
                color: 'var(--primary-text)',
                background: 'var(--primary-light)',
                border: '1px solid var(--primary-lighter)',
              }}
            >
              <CheckCheck size={14} />
              Mark All Read
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="modern-card overflow-hidden">
        {loading ? (
          <div className="px-8 py-16 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-3 border-t-transparent" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--primary)' }} />
            <p className="text-sm mt-4 font-semibold" style={{ color: 'var(--text-muted)' }}>Loading notifications…</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="px-8 py-20 text-center">
            <div
              className="h-20 w-20 mx-auto rounded-3xl flex items-center justify-center mb-6"
              style={{ background: 'var(--surface-secondary)' }}
            >
              <Inbox size={36} style={{ color: 'var(--text-muted)' }} />
            </div>
            <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
              {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
            </h3>
            <p className="text-sm mt-2 max-w-sm mx-auto" style={{ color: 'var(--text-muted)' }}>
              {filter === 'unread'
                ? 'All notifications have been read. Switch to "All" to view your notification history.'
                : 'When leave applications are submitted, approved, or rejected, notifications will appear here.'}
            </p>
            {filter === 'unread' && (
              <button
                onClick={() => setFilter('all')}
                className="mt-4 px-4 py-2 text-xs font-bold rounded-xl transition-all"
                style={{ color: 'var(--primary-text)', background: 'var(--primary-light)' }}
              >
                View All Notifications
              </button>
            )}
          </div>
        ) : (
          <>
            {dateOrder.map((dateLabel) => {
              const group = groupedNotifications[dateLabel];
              if (!group || group.length === 0) return null;

              return (
                <div key={dateLabel}>
                  {/* Date Group Header */}
                  <div
                    className="px-6 py-3 sticky top-0 z-10 backdrop-blur-sm"
                    style={{
                      background: 'var(--surface-secondary)',
                      borderBottom: '1px solid var(--border-light)',
                    }}
                  >
                    <span className="text-[11px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                      {dateLabel}
                    </span>
                  </div>

                  {/* Notification Items */}
                  {group.map((n: any) => {
                    const config = notificationConfig[n.type] || notificationConfig.system;
                    const Icon = config.icon;

                    return (
                      <div
                        key={n._id}
                        className="relative flex items-start gap-4 px-6 py-5 transition-all group"
                        style={{
                          background: n.isRead ? 'transparent' : 'var(--primary-light)',
                          borderBottom: '1px solid var(--border-light)',
                        }}
                        onMouseEnter={(e) => {
                          if (n.isRead) e.currentTarget.style.background = 'var(--surface-hover)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = n.isRead ? 'transparent' : 'var(--primary-light)';
                        }}
                      >
                        {/* Unread indicator */}
                        {!n.isRead && (
                          <div
                            className="absolute left-2 top-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full animate-pulse"
                            style={{ background: 'var(--primary)', boxShadow: '0 0 8px var(--primary-shadow)' }}
                          />
                        )}

                        {/* Icon */}
                        <div
                          className="h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 mt-0.5"
                          style={{ background: config.bg }}
                        >
                          <Icon size={20} style={{ color: config.color }} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2.5 mb-1">
                                <p
                                  className={`text-sm leading-snug ${n.isRead ? 'font-semibold' : 'font-bold'}`}
                                  style={{ color: 'var(--text-primary)' }}
                                >
                                  {n.title}
                                </p>
                                <span
                                  className="px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-md"
                                  style={{ color: config.color, background: config.bg }}
                                >
                                  {config.label}
                                </span>
                              </div>
                              <p
                                className="text-sm leading-relaxed"
                                style={{ color: 'var(--text-secondary)' }}
                              >
                                {n.message}
                              </p>
                              <div className="flex items-center gap-3 mt-2">
                                <span className="text-[11px] font-bold" style={{ color: 'var(--text-muted)' }}>
                                  {formatDate(n.createdAt)}
                                </span>
                                {n.actorId?.name && (
                                  <>
                                    <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>•</span>
                                    <span className="text-[11px] font-semibold" style={{ color: 'var(--text-muted)' }}>
                                      by {n.actorId.name}
                                    </span>
                                    {n.actorId.role && (
                                      <span
                                        className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-md"
                                        style={{ color: 'var(--text-muted)', background: 'var(--surface-secondary)' }}
                                      >
                                        {n.actorId.role.replace('_', ' ')}
                                      </span>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                              {!n.isRead && (
                                <button
                                  onClick={() => handleMarkAsRead(n._id)}
                                  className="p-2 rounded-xl transition-all hover:scale-110"
                                  style={{ color: 'var(--primary-text)' }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'var(--primary-light)';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'transparent';
                                  }}
                                  title="Mark as read"
                                >
                                  <CheckCircle2 size={16} />
                                </button>
                              )}
                              <button
                                onClick={() => handleDelete(n._id)}
                                className="p-2 rounded-xl transition-all hover:scale-110 text-rose-500"
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = 'transparent';
                                }}
                                title="Delete notification"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div
                className="px-6 py-4 flex items-center justify-between"
                style={{ borderTop: '1px solid var(--border-light)' }}
              >
                <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                  Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl transition-all disabled:opacity-40"
                    style={{ color: 'var(--text-secondary)', background: 'var(--surface-secondary)' }}
                  >
                    <ChevronLeft size={14} />
                    Previous
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                    disabled={page >= pagination.totalPages}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl transition-all disabled:opacity-40"
                    style={{ color: 'var(--text-secondary)', background: 'var(--surface-secondary)' }}
                  >
                    Next
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
