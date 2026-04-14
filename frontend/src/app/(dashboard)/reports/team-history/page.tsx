'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { reportService, leaveTypeService } from '@/lib/services';
import { Select } from '@/components/ui/Select';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { ArrowLeft, ClipboardList, Search, ChevronLeft, ChevronRight } from 'lucide-react';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  approved: { label: 'Approved', color: '#10b981', bg: '#10b98120' },
  hr_approved: { label: 'Approved', color: '#10b981', bg: '#10b98120' },
  rejected: { label: 'Rejected', color: '#ef4444', bg: '#ef444420' },
  pending: { label: 'Pending', color: '#f59e0b', bg: '#f59e0b20' },
  manager_approved: { label: 'Mgr Approved', color: '#6366f1', bg: '#6366f120' },
  cancelled: { label: 'Cancelled', color: '#6b7280', bg: '#6b728020' },
};

export default function TeamHistoryReport() {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());
  const [statusFilter, setStatusFilter] = useState('');
  const [leaveTypeId, setLeaveTypeId] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [leaveTypes, setLeaveTypes] = useState<any[]>([]);

  const years = Array.from({ length: 5 }, (_, i) => ({
    value: String(new Date().getFullYear() - i),
    label: String(new Date().getFullYear() - i),
  }));

  useEffect(() => {
    leaveTypeService.getLeaveTypes().then(setLeaveTypes).catch(() => {});
  }, []);

  useEffect(() => {
    setPage(1);
  }, [year, statusFilter, leaveTypeId]);

  useEffect(() => {
    loadReport();
  }, [year, statusFilter, leaveTypeId, page]);

  const loadReport = async () => {
    try {
      setLoading(true);
      const params: any = { year, page, limit: 20 };
      if (statusFilter) params.status = statusFilter;
      if (leaveTypeId) params.leaveTypeId = leaveTypeId;
      const data = await reportService.getTeamHistoryReport(params);
      setReport(data);
    } catch {
      toast.error('Failed to load team history report');
    } finally {
      setLoading(false);
    }
  };

  const applications: any[] = report?.applications || [];

  const filteredApps = useMemo(() => {
    if (!search.trim()) return applications;
    const q = search.toLowerCase();
    return applications.filter((a) => {
      const emp = a.employee as any;
      return (
        emp?.name?.toLowerCase().includes(q) ||
        emp?.email?.toLowerCase().includes(q) ||
        (a.leaveType as any)?.name?.toLowerCase().includes(q)
      );
    });
  }, [applications, search]);

  const pagination = report?.pagination;

  const formatDate = (d: string) =>
    d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/reports">
            <button
              className="h-10 w-10 rounded-xl flex items-center justify-center transition-all hover:scale-105"
              style={{ background: 'var(--surface-secondary)', color: 'var(--text-secondary)' }}
            >
              <ArrowLeft size={18} />
            </button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <div
                className="h-10 w-10 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}
              >
                <ClipboardList size={20} className="text-white" />
              </div>
              <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Team Leave History
              </h1>
            </div>
            <p className="mt-1 ml-[52px]" style={{ color: 'var(--text-muted)' }}>
              Detailed log of all team leave applications for {year}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: '', label: 'All Statuses' },
              { value: 'approved', label: 'Approved' },
              { value: 'pending', label: 'Pending' },
              { value: 'rejected', label: 'Rejected' },
              { value: 'cancelled', label: 'Cancelled' },
            ]}
            className="w-40"
          />
          <Select
            value={leaveTypeId}
            onChange={(e) => setLeaveTypeId(e.target.value)}
            options={[
              { value: '', label: 'All Leave Types' },
              ...leaveTypes.map((lt) => ({ value: lt._id, label: lt.name })),
            ]}
            className="w-44"
          />
          <Select
            value={String(year)}
            onChange={(e) => { setYear(Number(e.target.value)); }}
            options={years}
            className="w-32"
          />
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Total', value: report?.stats?.totalApplications || 0, color: '#6366f1' },
          { label: 'Approved', value: report?.stats?.approved || 0, color: '#10b981' },
          { label: 'Pending', value: report?.stats?.pending || 0, color: '#f59e0b' },
          { label: 'Rejected', value: report?.stats?.rejected || 0, color: '#ef4444' },
          { label: 'Cancelled', value: report?.stats?.cancelled || 0, color: '#6b7280' },
          { label: 'Days Taken', value: `${report?.stats?.totalDaysTaken || 0}d`, color: '#06b6d4' },
        ].map((s, i) => (
          <div key={i} className="modern-card rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs font-semibold uppercase tracking-wider mt-1" style={{ color: 'var(--text-muted)' }}>
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div
        className="flex items-center gap-2 px-4 py-3 rounded-xl"
        style={{ background: 'var(--surface-secondary)', border: '1px solid var(--border)' }}
      >
        <Search size={16} style={{ color: 'var(--text-muted)' }} />
        <input
          type="text"
          placeholder="Search by employee name, email, or leave type..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent flex-1 text-sm outline-none"
          style={{ color: 'var(--text-primary)' }}
        />
      </div>

      {/* Applications Table */}
      <div className="modern-card rounded-2xl overflow-hidden">
        <div
          className="px-6 py-5 border-b flex items-center justify-between"
          style={{ background: 'var(--surface-secondary)', borderColor: 'var(--border)' }}
        >
          <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
            Leave Applications
          </h3>
          {pagination && (
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {pagination.total} total records
            </span>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead>
              <tr style={{ background: 'var(--surface-secondary)' }}>
                {['Employee', 'Leave Type', 'From', 'To', 'Days', 'Status', 'Reason', 'Applied On'].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto" />
                  </td>
                </tr>
              ) : filteredApps.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
                    No applications found for the selected filters.
                  </td>
                </tr>
              ) : (
                filteredApps.map((app: any) => {
                  const statusKey = app.status as string;
                  const sc = STATUS_CONFIG[statusKey] || { label: statusKey, color: '#6b7280', bg: '#6b728020' };
                  const emp = app.employee as any;
                  return (
                    <tr
                      key={app.id}
                      style={{ borderBottom: '1px solid var(--border)' }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--surface-hover)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                      <td className="px-5 py-4">
                        <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                          {emp?.name || '—'}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {emp?.designation || emp?.email || ''}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className="text-xs font-semibold px-2 py-1 rounded-full"
                          style={{ background: 'var(--surface-secondary)', color: 'var(--text-secondary)' }}
                        >
                          {(app.leaveType as any)?.name || '—'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {formatDate(app.fromDate)}
                      </td>
                      <td className="px-5 py-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {formatDate(app.toDate)}
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                          {app.totalDays}d
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className="text-xs font-bold px-2.5 py-1 rounded-full"
                          style={{ background: sc.bg, color: sc.color }}
                        >
                          {sc.label}
                        </span>
                      </td>
                      <td className="px-5 py-4 max-w-[180px]">
                        <p
                          className="text-xs truncate"
                          style={{ color: 'var(--text-muted)' }}
                          title={app.rejectionReason || app.reason}
                        >
                          {app.rejectionReason
                            ? <span style={{ color: '#ef4444' }}>❌ {app.rejectionReason}</span>
                            : app.reason || '—'}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-xs" style={{ color: 'var(--text-muted)' }}>
                        {formatDate(app.createdAt)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div
            className="px-6 py-4 flex items-center justify-between border-t"
            style={{ background: 'var(--surface-secondary)', borderColor: 'var(--border)' }}
          >
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Page {pagination.page} of {pagination.totalPages} · {pagination.total} records
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="h-8 w-8 rounded-lg flex items-center justify-center disabled:opacity-40 transition-all hover:scale-105"
                style={{ background: 'var(--surface-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
              >
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                let p = i + 1;
                if (pagination.totalPages > 5 && page > 3) {
                  p = page - 2 + i;
                  if (p > pagination.totalPages) p = pagination.totalPages - (4 - i);
                }
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className="h-8 w-8 rounded-lg text-xs font-bold flex items-center justify-center transition-all"
                    style={{
                      background: page === p ? 'var(--primary)' : 'var(--surface-secondary)',
                      color: page === p ? 'white' : 'var(--text-muted)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages}
                className="h-8 w-8 rounded-lg flex items-center justify-center disabled:opacity-40 transition-all hover:scale-105"
                style={{ background: 'var(--surface-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
