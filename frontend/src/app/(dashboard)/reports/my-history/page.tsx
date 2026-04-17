'use client';

import React, { useEffect, useState } from 'react';
import { reportService, leaveTypeService } from '@/lib/services';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { StatCard } from '@/components/ui/StatCard';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { ArrowLeft, Calendar, FileText, CheckCircle, XCircle, Clock, Ban, BarChart3, Inbox } from 'lucide-react';

export default function MyHistoryReport() {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());
  const [statusFilter, setStatusFilter] = useState('');
  const [leaveTypeFilter, setLeaveTypeFilter] = useState('');
  const [leaveTypes, setLeaveTypes] = useState<any[]>([]);
  const [page, setPage] = useState(1);

  const years = Array.from({ length: 5 }, (_, i) => ({
    value: String(new Date().getFullYear() - i),
    label: String(new Date().getFullYear() - i),
  }));

  useEffect(() => {
    leaveTypeService.getLeaveTypes().then(setLeaveTypes).catch(() => {});
  }, []);

  useEffect(() => {
    setPage(1);
  }, [year, statusFilter, leaveTypeFilter]);

  useEffect(() => {
    loadReport();
  }, [year, statusFilter, leaveTypeFilter, page]);

  const loadReport = async () => {
    try {
      setLoading(true);
      const data = await reportService.getMyHistoryReport({
        year,
        status: statusFilter || undefined,
        leaveTypeId: leaveTypeFilter || undefined,
        page,
        limit: 10,
      });
      setReport(data);
    } catch (error) {
      console.error('Failed to load report:', error);
      toast.error('Failed to load history report');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'pending';
      case 'approved': return 'approved';
      case 'rejected': return 'rejected';
      case 'cancelled': return 'cancelled';
      default: return 'default';
    }
  };

  if (loading && !report) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
                style={{ background: 'linear-gradient(135deg, #06b6d4, #3b82f6)' }}
              >
                <Calendar size={20} className="text-white" />
              </div>
              <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                My Leave History
              </h1>
            </div>
            <p className="mt-1 ml-[52px]" style={{ color: 'var(--text-muted)' }}>
              Complete log of all leave applications for {year}
            </p>
          </div>
        </div>
        <Select
          value={String(year)}
          onChange={(e) => setYear(Number(e.target.value))}
          options={years}
          className="w-32"
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          icon={<FileText size={20} />}
          title="Total"
          value={report?.stats?.totalApplications || 0}
          subtitle="Applications"
          color="indigo"
        />
        <StatCard
          icon={<CheckCircle size={20} />}
          title="Approved"
          value={report?.stats?.approved || 0}
          subtitle="Accepted"
          color="emerald"
        />
        <StatCard
          icon={<XCircle size={20} />}
          title="Rejected"
          value={report?.stats?.rejected || 0}
          subtitle="Declined"
          color="rose"
        />
        <StatCard
          icon={<Clock size={20} />}
          title="Pending"
          value={report?.stats?.pending || 0}
          subtitle="Awaiting"
          color="amber"
        />
        <StatCard
          icon={<Ban size={20} />}
          title="Cancelled"
          value={report?.stats?.cancelled || 0}
          subtitle="Withdrawn"
          color="purple"
        />
        <StatCard
          icon={<BarChart3 size={20} />}
          title="Days Taken"
          value={report?.stats?.totalDaysTaken || 0}
          subtitle="Approved days"
          color="blue"
        />
      </div>

      {/* Monthly Breakdown Chart */}
      <div className="modern-card rounded-2xl overflow-hidden">
        <div
          className="px-6 py-5 border-b"
          style={{ background: 'var(--surface-secondary)', borderColor: 'var(--border)' }}
        >
          <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
            Monthly Breakdown
          </h3>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            Approved leave days distributed by month
          </p>
        </div>
        <div className="p-6">
          <div className="flex items-end gap-2 h-48">
            {report?.monthlyBreakdown?.map((month: any, index: number) => {
              const maxDays = Math.max(...(report?.monthlyBreakdown?.map((m: any) => m.daysTaken) || [1]));
              const heightPercent = maxDays > 0 ? (month.daysTaken / maxDays) * 100 : 0;
              const isCurrentMonth = month.monthIndex === new Date().getMonth() && year === new Date().getFullYear();

              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-1 group">
                  {/* Value */}
                  <span
                    className="text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {month.daysTaken}d
                  </span>
                  {/* Bar */}
                  <div className="w-full flex flex-col justify-end" style={{ height: '140px' }}>
                    <div
                      className="w-full rounded-t-lg transition-all duration-500 min-h-[4px]"
                      style={{
                        height: `${Math.max(3, heightPercent)}%`,
                        background: isCurrentMonth
                          ? 'linear-gradient(180deg, #6366f1, #8b5cf6)'
                          : month.daysTaken > 0
                          ? 'linear-gradient(180deg, rgba(99, 102, 241, 0.5), rgba(139, 92, 246, 0.5))'
                          : 'var(--surface-secondary)',
                        boxShadow: isCurrentMonth ? '0 -4px 12px rgba(99, 102, 241, 0.3)' : 'none',
                      }}
                    />
                  </div>
                  {/* Label */}
                  <span
                    className="text-[10px] font-bold uppercase"
                    style={{
                      color: isCurrentMonth ? 'var(--primary)' : 'var(--text-muted)',
                    }}
                  >
                    {month.month}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Applications List */}
      <div className="modern-card rounded-2xl overflow-hidden">
        <div
          className="px-6 py-5 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          style={{ borderColor: 'var(--border)' }}
        >
          <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
            Leave Applications
          </h3>
          <div className="flex items-center gap-3 flex-wrap">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: '', label: 'All Status' },
                { value: 'pending', label: 'Pending' },
                { value: 'approved', label: 'Approved' },
                { value: 'rejected', label: 'Rejected' },
                { value: 'cancelled', label: 'Cancelled' },
              ]}
              className="w-36"
            />
            <Select
              value={leaveTypeFilter}
              onChange={(e) => setLeaveTypeFilter(e.target.value)}
              options={[
                { value: '', label: 'All Types' },
                ...leaveTypes.map((t) => ({
                  value: t._id || t.id,
                  label: t.name,
                })),
              ]}
              className="w-40"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full" style={{ borderCollapse: 'separate', borderSpacing: '0' }}>
            <thead>
              <tr style={{ background: 'var(--surface-secondary)' }}>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Type</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Duration</th>
                <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Days</th>
                <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Status</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Approver</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Applied</th>
              </tr>
            </thead>
            <tbody>
              {report?.applications?.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center" style={{ color: 'var(--text-muted)' }}>
                    <div className="flex justify-center mb-4 opacity-50">
                      <Inbox size={48} />
                    </div>
                    <p>No leave applications found</p>
                  </td>
                </tr>
              )}
              {report?.applications?.map((app: any) => (
                <tr
                  key={app.id}
                  className="transition-colors"
                  style={{ borderBottom: '1px solid var(--border)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--surface-hover)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                      {app.leaveType?.name || 'N/A'}
                    </p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {new Date(app.fromDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      {' — '}
                      {new Date(app.toDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border"
                      style={{
                        backgroundColor: 'var(--primary-light)',
                        color: 'var(--primary-text)',
                        borderColor: 'var(--primary-lighter)',
                      }}
                    >
                      {app.totalDays} days
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Badge variant={getStatusBadgeVariant(app.status)}>
                      {app.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {app.approvedBy?.name || '—'}
                    </p>
                    {app.approvedAt && (
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {new Date(app.approvedAt).toLocaleDateString()}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {new Date(app.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {report?.pagination?.total > report?.pagination?.limit && (
          <div
            className="px-6 py-4 border-t flex items-center justify-between"
            style={{ background: 'var(--surface-secondary)', borderColor: 'var(--border)' }}
          >
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Showing <span className="font-bold">{report.applications.length}</span> of {report.pagination.total} results
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="h-8 py-0"
              >
                Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={page * (report?.pagination?.limit || 10) >= report?.pagination?.total}
                className="h-8 py-0"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
