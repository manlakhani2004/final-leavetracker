'use client';

import React, { useEffect, useState } from 'react';
import { reportService } from '@/lib/services';
import { Select } from '@/components/ui/Select';
import { StatCard } from '@/components/ui/StatCard';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { ArrowLeft, BarChart3, TrendingUp, Users, FileText, CalendarDays, CheckCircle, Clock, Trophy, XCircle, Ban } from 'lucide-react';

export default function OrgSummaryReport() {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());

  const years = Array.from({ length: 5 }, (_, i) => ({
    value: String(new Date().getFullYear() - i),
    label: String(new Date().getFullYear() - i),
  }));

  useEffect(() => {
    loadReport();
  }, [year]);

  const loadReport = async () => {
    try {
      setLoading(true);
      const data = await reportService.getOrgSummaryReport({ year });
      setReport(data);
    } catch (error) {
      console.error('Failed to load report:', error);
      toast.error('Failed to load organization summary');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !report) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  const overview = report?.overview || {};

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
                style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}
              >
                <BarChart3 size={20} className="text-white" />
              </div>
              <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Organization Summary
              </h1>
            </div>
            <p className="mt-1 ml-[52px]" style={{ color: 'var(--text-muted)' }}>
              High-level snapshot of leave usage across the organization for {year}
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

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <StatCard
          icon={<Users size={24} />}
          title="Total Employees"
          value={overview.totalEmployees || 0}
          subtitle="Active members"
          color="indigo"
        />
        <StatCard
          icon={<FileText size={24} />}
          title="Total Applications"
          value={overview.totalApplications || 0}
          subtitle={`${year} submissions`}
          color="blue"
        />
        <StatCard
          icon={<CalendarDays size={24} />}
          title="Days Consumed"
          value={overview.totalDaysConsumed || 0}
          subtitle="Approved leave days"
          color="rose"
        />
      </div>

      {/* Second Row Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div
          className="modern-card rounded-2xl p-5 flex items-center gap-4"
        >
          <div
            className="h-12 w-12 rounded-xl flex items-center justify-center shrink-0 text-white"
            style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
          >
            <BarChart3 size={20} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Avg / Employee
            </p>
            <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {overview.avgLeavesPerEmployee || 0}
            </p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>days per person</p>
          </div>
        </div>

        <div
          className="modern-card rounded-2xl p-5 flex items-center gap-4"
        >
          <div
            className="h-12 w-12 rounded-xl flex items-center justify-center shrink-0 text-white"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
          >
            <CheckCircle size={20} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Approval Rate
            </p>
            <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {overview.approvalRate || 0}%
            </p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>of decided applications</p>
          </div>
        </div>

        <div
          className="modern-card rounded-2xl p-5 flex items-center gap-4"
        >
          <div
            className="h-12 w-12 rounded-xl flex items-center justify-center shrink-0 text-white"
            style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
          >
            <Clock size={20} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Avg Turnaround
            </p>
            <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {overview.avgTurnaroundHours > 24
                ? `${Math.round(overview.avgTurnaroundHours / 24)}d`
                : `${overview.avgTurnaroundHours || 0}h`}
            </p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>approval time</p>
          </div>
        </div>

        <div
          className="modern-card rounded-2xl p-5 flex items-center gap-4"
        >
          <div
            className="h-12 w-12 rounded-xl flex items-center justify-center shrink-0 text-white"
            style={{ background: 'linear-gradient(135deg, #ec4899, #be185d)' }}
          >
            <Trophy size={20} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Most Used Type
            </p>
            <p className="text-lg font-bold truncate" style={{ color: 'var(--text-primary)' }}>
              {overview.mostUsedLeaveType?.name || 'N/A'}
            </p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {overview.mostUsedLeaveType?.count || 0} applications, {overview.mostUsedLeaveType?.days || 0} days
            </p>
          </div>
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="modern-card rounded-2xl overflow-hidden">
        <div
          className="px-6 py-5 border-b"
          style={{ background: 'var(--surface-secondary)', borderColor: 'var(--border)' }}
        >
          <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
            Application Status Breakdown
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Approved', count: report?.statusBreakdown?.approved || 0, color: '#10b981', icon: <CheckCircle size={28} /> },
              { label: 'Pending', count: report?.statusBreakdown?.pending || 0, color: '#f59e0b', icon: <Clock size={28} /> },
              { label: 'Rejected', count: report?.statusBreakdown?.rejected || 0, color: '#ef4444', icon: <XCircle size={28} /> },
              { label: 'Cancelled', count: report?.statusBreakdown?.cancelled || 0, color: '#6b7280', icon: <Ban size={28} /> },
            ].map((item, idx) => {
              const total = report?.statusBreakdown?.total || 1;
              const percent = Math.round((item.count / total) * 100);
              return (
                <div key={idx} className="text-center p-4 rounded-xl" style={{ background: 'var(--surface-secondary)' }}>
                  <div className="flex justify-center mb-2" style={{ color: item.color }}>{item.icon}</div>
                  <p className="text-2xl font-bold" style={{ color: item.color }}>{item.count}</p>
                  <p className="text-xs font-semibold uppercase tracking-wider mt-1" style={{ color: 'var(--text-muted)' }}>
                    {item.label}
                  </p>
                  <div className="mt-2 w-full rounded-full h-1.5" style={{ backgroundColor: 'rgba(0,0,0,0.1)' }}>
                    <div
                      className="h-1.5 rounded-full transition-all duration-700"
                      style={{ width: `${percent}%`, backgroundColor: item.color }}
                    />
                  </div>
                  <p className="text-xs mt-1 font-bold" style={{ color: item.color }}>{percent}%</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Leave Type Usage */}
      {report?.leaveTypeStats?.length > 0 && (
        <div className="modern-card rounded-2xl overflow-hidden">
          <div
            className="px-6 py-5 border-b"
            style={{ background: 'var(--surface-secondary)', borderColor: 'var(--border)' }}
          >
            <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
              Leave Type Usage
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full" style={{ borderCollapse: 'separate', borderSpacing: '0' }}>
              <thead>
                <tr style={{ background: 'var(--surface-secondary)' }}>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Leave Type</th>
                  <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Applications</th>
                  <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Total Days</th>
                  <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Share</th>
                </tr>
              </thead>
              <tbody>
                {report.leaveTypeStats.map((stat: any, index: number) => {
                  const totalCount = report.leaveTypeStats.reduce((s: number, st: any) => s + st.count, 0);
                  const share = totalCount > 0 ? Math.round((stat.count / totalCount) * 100) : 0;
                  const colors = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];
                  const color = colors[index % colors.length];

                  return (
                    <tr
                      key={index}
                      className="transition-colors"
                      style={{ borderBottom: '1px solid var(--border)' }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--surface-hover)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: color }}
                          />
                          <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                            {stat.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
                        {stat.count}
                      </td>
                      <td className="px-6 py-4 text-center text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
                        {stat.days}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 justify-center">
                          <div className="w-16 rounded-full h-2" style={{ backgroundColor: 'var(--surface-secondary)' }}>
                            <div
                              className="h-2 rounded-full transition-all"
                              style={{ width: `${share}%`, backgroundColor: color }}
                            />
                          </div>
                          <span className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>{share}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Monthly Trend */}
      <div className="modern-card rounded-2xl overflow-hidden">
        <div
          className="px-6 py-5 border-b flex items-center gap-2"
          style={{ background: 'var(--surface-secondary)', borderColor: 'var(--border)' }}
        >
          <TrendingUp size={18} style={{ color: 'var(--primary)' }} />
          <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
            Monthly Trend
          </h3>
        </div>
        <div className="p-6">
          <div className="flex items-end gap-3 h-56">
            {report?.monthlyTrend?.map((month: any, index: number) => {
              const maxApps = Math.max(...(report?.monthlyTrend?.map((m: any) => m.totalApplications) || [1]), 1);
              const totalHeight = (month.totalApplications / maxApps) * 100;
              const approvedHeight = month.totalApplications > 0
                ? (month.approved / month.totalApplications) * totalHeight
                : 0;
              const isCurrentMonth = month.monthIndex === new Date().getMonth() && year === new Date().getFullYear();

              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-1 group">
                  {/* Tooltip on hover */}
                  <div
                    className="text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity text-center"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    <span>{month.totalApplications}</span>
                  </div>
                  {/* Bar */}
                  <div className="w-full flex flex-col justify-end items-center" style={{ height: '160px' }}>
                    <div className="w-full max-w-[36px] flex flex-col justify-end" style={{ height: '160px' }}>
                      {/* Total bar */}
                      <div
                        className="w-full rounded-t-md transition-all duration-500 relative"
                        style={{
                          height: `${Math.max(4, totalHeight)}%`,
                          background: isCurrentMonth
                            ? 'linear-gradient(180deg, #f59e0b, #ef4444)'
                            : 'linear-gradient(180deg, rgba(245, 158, 11, 0.4), rgba(239, 68, 68, 0.4))',
                          boxShadow: isCurrentMonth ? '0 -4px 12px rgba(245, 158, 11, 0.3)' : 'none',
                        }}
                      >
                        {/* Approved overlay */}
                        <div
                          className="absolute bottom-0 left-0 right-0 rounded-t-sm"
                          style={{
                            height: `${approvedHeight > 0 ? (approvedHeight / totalHeight) * 100 : 0}%`,
                            background: isCurrentMonth
                              ? 'rgba(16, 185, 129, 0.7)'
                              : 'rgba(16, 185, 129, 0.4)',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  {/* Days label */}
                  <span
                    className="text-[9px] font-bold"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {month.totalDays}d
                  </span>
                  {/* Month label */}
                  <span
                    className="text-[10px] font-bold uppercase"
                    style={{ color: isCurrentMonth ? 'var(--primary)' : 'var(--text-muted)' }}
                  >
                    {month.month}
                  </span>
                </div>
              );
            })}
          </div>
          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-sm" style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }} />
              <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Total Applications</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-sm" style={{ background: '#10b981' }} />
              <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Approved</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
