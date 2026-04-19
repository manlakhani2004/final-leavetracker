'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { auditLogService } from '@/lib/services';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';
import {
  ScrollText, Filter, RefreshCw, User, FileText, Building2,
  Calendar, Clock, ChevronLeft, ChevronRight, Activity,
} from 'lucide-react';

const ENTITY_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'leave_application', label: 'Leave Application' },
  { value: 'user', label: 'User' },
  { value: 'department', label: 'Department' },
  { value: 'leave_type', label: 'Leave Type' },
  { value: 'leave_balance', label: 'Leave Balance' },
  { value: 'holiday', label: 'Holiday' },
];

const ACTION_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'leave.apply':    { bg: '#dbeafe', text: '#1d4ed8', border: '#bfdbfe' },
  'leave.approve':  { bg: '#dcfce7', text: '#15803d', border: '#bbf7d0' },
  'leave.reject':   { bg: '#fee2e2', text: '#dc2626', border: '#fecaca' },
  'leave.cancel':   { bg: '#f3f4f6', text: '#6b7280', border: '#e5e7eb' },
  'leave.update':   { bg: '#fef9c3', text: '#a16207', border: '#fde68a' },
  'user.create':    { bg: '#ede9fe', text: '#7c3aed', border: '#ddd6fe' },
  'user.update':    { bg: '#fef3c7', text: '#d97706', border: '#fde68a' },
  'user.delete':    { bg: '#fee2e2', text: '#dc2626', border: '#fecaca' },
  'leave_balance.carry_forward': { bg: '#cffafe', text: '#0e7490', border: '#a5f3fc' },
};

const getActionStyle = (action: string) =>
  ACTION_COLORS[action] || { bg: '#f3f4f6', text: '#374151', border: '#e5e7eb' };

const getEntityIcon = (entityType: string) => {
  switch (entityType) {
    case 'leave_application': return <FileText size={14} />;
    case 'user': return <User size={14} />;
    case 'department': return <Building2 size={14} />;
    case 'leave_balance': return <Activity size={14} />;
    default: return <ScrollText size={14} />;
  }
};

export default function AuditLogPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Filters
  const [entityType, setEntityType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const loadLogs = useCallback(async () => {
    try {
      setLoading(true);
      const [logsRes, statsRes] = await Promise.all([
        auditLogService.getLogs({
          entityType: entityType || undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          page,
          limit: 20,
        }),
        auditLogService.getStats(),
      ]);
      setLogs(logsRes.data || []);
      setTotal(logsRes.meta?.total || 0);
      setTotalPages(logsRes.meta?.totalPages || 1);
      setStats(statsRes);
    } catch {
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  }, [entityType, startDate, endDate, page]);

  useEffect(() => { loadLogs(); }, [loadLogs]);

  const handleReset = () => {
    setEntityType(''); setStartDate(''); setEndDate(''); setPage(1);
  };

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div
              className="h-10 w-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
            >
              <ScrollText size={20} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Audit Log
            </h1>
          </div>
          <p className="ml-[52px]" style={{ color: 'var(--text-muted)' }}>
            Complete trail of all system actions and changes
          </p>
        </div>
        <Button
          onClick={loadLogs}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw size={16} />
          Refresh
        </Button>
      </div>

      {/* Stats Row */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Events', value: stats.total, color: '#6366f1', icon: <ScrollText size={20} /> },
            { label: 'Last 30 Days', value: stats.last30Days, color: '#06b6d4', icon: <Calendar size={20} /> },
            ...(stats.byEntityType || []).slice(0, 2).map((e: any) => ({
              label: e._id.replace('_', ' '),
              value: e.count,
              color: '#10b981',
              icon: getEntityIcon(e._id),
            })),
          ].map((stat, i) => (
            <div key={i} className="modern-card rounded-2xl p-5 flex items-center gap-4">
              <div
                className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${stat.color}20`, color: stat.color }}
              >
                {stat.icon}
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  {stat.label}
                </p>
                <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="modern-card rounded-2xl p-5">
        <div className="flex flex-wrap items-center gap-4">
          <Filter size={16} style={{ color: 'var(--text-muted)' }} />
          <Select
            value={entityType}
            onChange={(e) => { setEntityType(e.target.value); setPage(1); }}
            options={ENTITY_TYPES}
            className="w-48"
          />
          <div className="flex items-center gap-2">
            <Calendar size={14} style={{ color: 'var(--text-muted)' }} />
            <input
              type="date"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
              className="rounded-lg border px-3 py-2 text-sm"
              style={{
                background: 'var(--surface-secondary)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
            />
            <span style={{ color: 'var(--text-muted)' }}>—</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
              className="rounded-lg border px-3 py-2 text-sm"
              style={{
                background: 'var(--surface-secondary)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
            />
          </div>
          <Button onClick={handleReset} variant="ghost" size="sm">Reset</Button>
          <p className="ml-auto text-sm" style={{ color: 'var(--text-muted)' }}>
            {total} event{total !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Log Table */}
      <div className="modern-card rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500" />
          </div>
        ) : logs.length === 0 ? (
          <div className="py-16 text-center" style={{ color: 'var(--text-muted)' }}>
            <ScrollText size={40} className="mx-auto mb-3 opacity-30" />
            <p>No audit log entries found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
              <thead>
                <tr style={{ background: 'var(--surface-secondary)' }}>
                  {['Time', 'Actor', 'Action', 'Entity', 'Description', ''].map((h) => (
                    <th key={h} className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider"
                      style={{ color: 'var(--text-muted)' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => {
                  const style = getActionStyle(log.action);
                  const isExpanded = expanded === log._id;
                  return (
                    <React.Fragment key={log._id}>
                      <tr
                        className="cursor-pointer transition-colors"
                        style={{ borderBottom: '1px solid var(--border)' }}
                        onClick={() => setExpanded(isExpanded ? null : log._id)}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-hover)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                      >
                        <td className="px-5 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Clock size={12} style={{ color: 'var(--text-muted)' }} />
                            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                              {new Date(log.createdAt).toLocaleDateString()}<br />
                              <span className="text-[10px]">{new Date(log.createdAt).toLocaleTimeString()}</span>
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <div
                              className="h-7 w-7 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                            >
                              {log.actorName?.charAt(0)?.toUpperCase()}
                            </div>
                            <div>
                              <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{log.actorName}</p>
                              <p className="text-[10px] uppercase" style={{ color: 'var(--text-muted)' }}>{log.actorRole?.replace('_', ' ')}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold border"
                            style={{ background: style.bg, color: style.text, borderColor: style.border }}
                          >
                            {log.action}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-1.5">
                            <span style={{ color: 'var(--text-muted)' }}>{getEntityIcon(log.entityType)}</span>
                            <div>
                              <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                                {log.entityType?.replace('_', ' ')}
                              </p>
                              {log.entityName && (
                                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{log.entityName}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{log.description}</p>
                        </td>
                        <td className="px-5 py-3 text-right">
                          {(log.previousValues || log.newValues) && (
                            <span className="text-xs" style={{ color: 'var(--primary)' }}>
                              {isExpanded ? '▲' : '▼'}
                            </span>
                          )}
                        </td>
                      </tr>
                      {isExpanded && (log.previousValues || log.newValues) && (
                        <tr style={{ borderBottom: '1px solid var(--border)' }}>
                          <td colSpan={6} className="px-5 py-4" style={{ background: 'var(--surface-secondary)' }}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {log.previousValues && (
                                <div>
                                  <p className="text-xs font-bold mb-2" style={{ color: '#ef4444' }}>Before</p>
                                  <pre className="text-xs p-3 rounded-lg overflow-auto"
                                    style={{ background: '#fee2e2', color: '#7f1d1d', maxHeight: 120 }}>
                                    {JSON.stringify(log.previousValues, null, 2)}
                                  </pre>
                                </div>
                              )}
                              {log.newValues && (
                                <div>
                                  <p className="text-xs font-bold mb-2" style={{ color: '#16a34a' }}>After</p>
                                  <pre className="text-xs p-3 rounded-lg overflow-auto"
                                    style={{ background: '#dcfce7', color: '#14532d', maxHeight: 120 }}>
                                    {JSON.stringify(log.newValues, null, 2)}
                                  </pre>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-5 py-4 border-t flex items-center justify-between"
            style={{ background: 'var(--surface-secondary)', borderColor: 'var(--border)' }}>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Page {page} of {totalPages} &nbsp;·&nbsp; {total} total
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage(p => p - 1)} disabled={page === 1}
                className="h-8 py-0">
                <ChevronLeft size={14} />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page >= totalPages}
                className="h-8 py-0">
                <ChevronRight size={14} />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
