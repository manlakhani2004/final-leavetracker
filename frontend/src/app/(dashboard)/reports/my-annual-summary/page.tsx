'use client';

import React, { useEffect, useState } from 'react';
import { reportService } from '@/lib/services';
import { Select } from '@/components/ui/Select';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { ArrowLeft, Star, BarChart3, CheckCircle, XCircle } from 'lucide-react';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function MyAnnualSummaryReport() {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());

  const years = Array.from({ length: 5 }, (_, i) => ({
    value: String(new Date().getFullYear() - i),
    label: String(new Date().getFullYear() - i),
  }));

  useEffect(() => { loadReport(); }, [year]);

  const loadReport = async () => {
    try {
      setLoading(true);
      const data = await reportService.getMyAnnualSummaryReport({ year });
      setReport(data);
    } catch {
      toast.error('Failed to load annual summary report');
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

  const byLeaveType: any[] = report?.byLeaveType || [];
  const monthly: any[] = report?.monthlyBreakdown || [];
  const summary = report?.summary || {};
  const maxMonthDays = Math.max(...monthly.map((m: any) => m.daysTaken), 1);

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/reports">
            <button className="h-10 w-10 rounded-xl flex items-center justify-center transition-all hover:scale-105"
              style={{ background: 'var(--surface-secondary)', color: 'var(--text-secondary)' }}>
              <ArrowLeft size={18} />
            </button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}>
                <Star size={20} className="text-white" />
              </div>
              <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Annual Summary
              </h1>
            </div>
            <p className="mt-1 ml-[52px]" style={{ color: 'var(--text-muted)' }}>
              Your year-end leave summary card for {year}
            </p>
          </div>
        </div>
        <Select value={String(year)} onChange={(e) => setYear(Number(e.target.value))}
          options={years} className="w-28"
        />
      </div>

      {/* Hero summary card */}
      <div className="rounded-2xl p-8"
        style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: 'Days Taken', value: summary.totalDaysTaken || 0 },
            { label: 'Applications', value: summary.totalApplications || 0 },
            { label: 'Approval Rate', value: `${summary.approvalRate || 0}%` },
            { label: 'Year', value: year },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-1">{s.label}</p>
              <p className="text-white text-4xl font-black">{s.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {[
          { label: 'Approved', value: summary.statusBreakdown?.approved || 0, color: '#10b981', icon: <CheckCircle size={20} className="text-white" /> },
          { label: 'Rejected', value: summary.statusBreakdown?.rejected || 0, color: '#ef4444', icon: <XCircle size={20} className="text-white" /> },
          { label: 'Pending', value: summary.statusBreakdown?.pending || 0, color: '#f59e0b', icon: <BarChart3 size={20} className="text-white" /> },
          { label: 'Cancelled', value: summary.statusBreakdown?.cancelled || 0, color: '#6b7280', icon: <XCircle size={20} className="text-white" /> },
        ].map((card, i) => (
          <div key={i} className="modern-card rounded-2xl p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: `linear-gradient(135deg, ${card.color}, ${card.color}cc)` }}>
              {card.icon}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{card.label}</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Monthly Bar Chart */}
      <div className="modern-card rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b flex items-center gap-2"
          style={{ background: 'var(--surface-secondary)', borderColor: 'var(--border)' }}>
          <BarChart3 size={18} style={{ color: 'var(--primary)' }} />
          <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Monthly Breakdown</h3>
        </div>
        <div className="p-6">
          <div className="flex items-end gap-2 h-40">
            {monthly.map((m: any, i: number) => {
              const heightPct = maxMonthDays > 0 ? (m.daysTaken / maxMonthDays) * 100 : 0;
              const isCurrentMonth = i === new Date().getMonth() && year === new Date().getFullYear();
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                  <p className="text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: 'var(--primary)' }}>
                    {m.daysTaken > 0 ? `${m.daysTaken}d` : ''}
                  </p>
                  <div className="w-full flex flex-col justify-end" style={{ height: '120px' }}>
                    <div
                      className="w-full rounded-t-md transition-all duration-500"
                      style={{
                        height: `${Math.max(heightPct, m.daysTaken > 0 ? 4 : 0)}%`,
                        background: isCurrentMonth
                          ? 'linear-gradient(180deg, #f59e0b, #ef4444)'
                          : 'linear-gradient(180deg, #6366f1, #8b5cf6)',
                      }}
                    />
                  </div>
                  <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>{m.month}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Leave Type Breakdown */}
      <div className="modern-card rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b" style={{ background: 'var(--surface-secondary)', borderColor: 'var(--border)' }}>
          <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>By Leave Type</h3>
        </div>
        <div className="p-6 space-y-5">
          {byLeaveType.length === 0 ? (
            <p className="text-center py-4" style={{ color: 'var(--text-muted)' }}>No leave data available.</p>
          ) : byLeaveType.map((lt: any, i: number) => (
            <div key={i}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                    {lt.leaveType?.name || '—'}
                  </span>
                  {lt.leaveType?.isPaid && (
                    <span className="ml-2 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded" style={{ background: '#10b98120', color: '#10b981' }}>Paid</span>
                  )}
                </div>
                <div className="flex items-center gap-6 text-xs" style={{ color: 'var(--text-muted)' }}>
                  <span>{lt.used}d used / {lt.effectiveAllocation}d allocated</span>
                  <span className="font-bold text-sm" style={{ color: lt.utilizationPercent > 80 ? '#ef4444' : 'var(--primary)' }}>
                    {lt.utilizationPercent}%
                  </span>
                </div>
              </div>
              <div className="h-3 rounded-full overflow-hidden" style={{ background: 'var(--surface-secondary)' }}>
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${lt.utilizationPercent}%`, background: 'linear-gradient(90deg, #6366f1, #f59e0b)' }} />
              </div>
              {lt.carryForwardEligibleNextYear > 0 && (
                <p className="text-xs mt-1" style={{ color: '#6366f1' }}>
                  🔄 {lt.carryForwardEligibleNextYear}d eligible to carry forward to next year
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
