'use client';

import React, { useEffect, useState } from 'react';
import { reportService, leaveTypeService } from '@/lib/services';
import { Select } from '@/components/ui/Select';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { ArrowLeft, TrendingUp, BarChart2, CalendarDays, FileText, BarChart3, Mountain } from 'lucide-react';

const TYPE_COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#14b8a6'];

export default function MonthlyTrendReport() {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());
  const [leaveTypeId, setLeaveTypeId] = useState('');
  const [leaveTypes, setLeaveTypes] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'days' | 'applications'>('days');
  const [showPrevYear, setShowPrevYear] = useState(false);

  const years = Array.from({ length: 5 }, (_, i) => ({
    value: String(new Date().getFullYear() - i),
    label: String(new Date().getFullYear() - i),
  }));

  useEffect(() => {
    leaveTypeService.getLeaveTypes().then(setLeaveTypes).catch(() => {});
  }, []);

  useEffect(() => {
    loadReport();
  }, [year, leaveTypeId]);

  const loadReport = async () => {
    try {
      setLoading(true);
      const params: any = { year };
      if (leaveTypeId) params.leaveTypeId = leaveTypeId;
      const data = await reportService.getMonthlyTrendReport(params);
      setReport(data);
    } catch {
      toast.error('Failed to load monthly trend report');
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

  const monthly: any[] = report?.monthlyTrend || [];
  const prevYearly: any[] = report?.previousYearTrend || [];
  const getValue = (m: any) => viewMode === 'days' ? m.totalDays : m.applicationCount;
  const maxVal = Math.max(...monthly.map(getValue), ...prevYearly.map(getPrevVal), 1);

  function getPrevVal(m: any) {
    return viewMode === 'days' ? m.totalDays : m.applicationCount;
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
                style={{ background: 'linear-gradient(135deg, #10b981, #06b6d4)' }}
              >
                <TrendingUp size={20} className="text-white" />
              </div>
              <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Monthly Trend Analysis
              </h1>
            </div>
            <p className="mt-1 ml-[52px]" style={{ color: 'var(--text-muted)' }}>
              Seasonal leave patterns and year-over-year comparison for {year}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
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
            onChange={(e) => setYear(Number(e.target.value))}
            options={years}
            className="w-32"
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {[
          { label: 'Total Days', value: report?.summary?.totalDays || 0, icon: <CalendarDays size={28} />, color: '#10b981' },
          { label: 'Applications', value: report?.summary?.totalApplications || 0, icon: <FileText size={28} />, color: '#6366f1' },
          { label: 'Monthly Avg', value: `${report?.summary?.avgDaysPerMonth || 0}d`, icon: <BarChart3 size={28} />, color: '#06b6d4', isText: true },
          { label: 'Peak Month', value: report?.peakMonth?.monthFull || 'N/A', icon: <Mountain size={28} />, color: '#f59e0b', isText: true },
        ].map((card, i) => (
          <div key={i} className="modern-card rounded-2xl p-5 flex items-center gap-4">
            <div
              className="h-12 w-12 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: `${card.color}20` }}
            >
              <div style={{ color: card.color }}>{card.icon}</div>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                {card.label}
              </p>
              <p
                className={`font-bold truncate ${(card as any).isText ? 'text-base' : 'text-2xl'}`}
                style={{ color: 'var(--text-primary)' }}
              >
                {card.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Line/Bar Chart */}
      <div className="modern-card rounded-2xl overflow-hidden">
        <div
          className="px-6 py-5 border-b flex items-center justify-between"
          style={{ background: 'var(--surface-secondary)', borderColor: 'var(--border)' }}
        >
          <div className="flex items-center gap-2">
            <BarChart2 size={18} style={{ color: 'var(--primary)' }} />
            <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
              Monthly Leave Trend — {year}
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowPrevYear(!showPrevYear)}
              className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
              style={{
                background: showPrevYear ? 'var(--primary)' : 'var(--surface-secondary)',
                color: showPrevYear ? 'white' : 'var(--text-muted)',
                border: '1px solid var(--border)',
              }}
            >
              YoY Compare
            </button>
            <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
              {(['days', 'applications'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className="text-xs font-bold px-3 py-1.5 transition-all capitalize"
                  style={{
                    background: viewMode === mode ? 'var(--primary)' : 'transparent',
                    color: viewMode === mode ? 'white' : 'var(--text-muted)',
                  }}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="flex items-end gap-2 h-64">
            {monthly.map((m: any, i: number) => {
              const val = getValue(m);
              const prevVal = showPrevYear ? getPrevVal(prevYearly[i]) : 0;
              const barH = maxVal > 0 ? (val / maxVal) * 100 : 0;
              const prevH = maxVal > 0 ? (prevVal / maxVal) * 100 : 0;
              const isCurrentMonth = m.monthIndex === new Date().getMonth() && year === new Date().getFullYear();

              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                  {/* Tooltip */}
                  <div
                    className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10"
                  >
                    {val} {viewMode}
                    {showPrevYear && ` (prev: ${prevVal})`}
                  </div>
                  <div className="w-full flex items-end justify-center gap-0.5" style={{ height: '200px' }}>
                    {/* Current year bar */}
                    <div
                      className="flex-1 rounded-t-md transition-all duration-700 max-w-[28px]"
                      style={{
                        height: `${Math.max(2, barH)}%`,
                        background: isCurrentMonth
                          ? 'linear-gradient(180deg, #10b981, #059669)'
                          : 'linear-gradient(180deg, rgba(16,185,129,0.7), rgba(5,150,105,0.5))',
                        boxShadow: isCurrentMonth ? '0 -4px 12px rgba(16,185,129,0.3)' : 'none',
                      }}
                    />
                    {/* Prev year bar */}
                    {showPrevYear && (
                      <div
                        className="flex-1 rounded-t-md transition-all duration-700 max-w-[28px]"
                        style={{
                          height: `${Math.max(2, prevH)}%`,
                          background: 'linear-gradient(180deg, rgba(99,102,241,0.5), rgba(99,102,241,0.3))',
                        }}
                      />
                    )}
                  </div>
                  <span
                    className="text-[9px] font-bold uppercase"
                    style={{ color: isCurrentMonth ? 'var(--primary)' : 'var(--text-muted)' }}
                  >
                    {m.month}
                  </span>
                </div>
              );
            })}
          </div>
          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-sm" style={{ background: '#10b981' }} />
              <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>{year}</span>
            </div>
            {showPrevYear && (
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-sm" style={{ background: 'rgba(99,102,241,0.5)' }} />
                <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>{year - 1}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Monthly Detail Table */}
      <div className="modern-card rounded-2xl overflow-hidden">
        <div
          className="px-6 py-5 border-b"
          style={{ background: 'var(--surface-secondary)', borderColor: 'var(--border)' }}
        >
          <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
            Month-by-Month Breakdown
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead>
              <tr style={{ background: 'var(--surface-secondary)' }}>
                {['Month', 'Applications', 'Days Taken', 'Top Leave Type', showPrevYear ? `${year - 1} Days` : null]
                  .filter(Boolean)
                  .map((h) => (
                    <th
                      key={h!}
                      className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {h}
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody>
              {monthly.map((m: any, i: number) => {
                const isCurrentMonth = m.monthIndex === new Date().getMonth() && year === new Date().getFullYear();
                const topType = m.byLeaveType?.sort((a: any, b: any) => b.days - a.days)[0];
                const prevDays = showPrevYear ? prevYearly[i]?.totalDays || 0 : null;
                const yoyChange = prevDays !== null && prevDays > 0
                  ? Math.round(((m.totalDays - prevDays) / prevDays) * 100)
                  : null;

                return (
                  <tr
                    key={i}
                    style={{
                      borderBottom: '1px solid var(--border)',
                      background: isCurrentMonth ? 'var(--surface-hover)' : 'transparent',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--surface-hover)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = isCurrentMonth ? 'var(--surface-hover)' : 'transparent'; }}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold" style={{ color: isCurrentMonth ? 'var(--primary)' : 'var(--text-primary)' }}>
                          {m.monthFull}
                        </span>
                        {isCurrentMonth && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: 'var(--primary)', color: 'white' }}>
                            NOW
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
                      {m.applicationCount}
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{m.totalDays}d</span>
                    </td>
                    <td className="px-5 py-4">
                      {topType ? (
                        <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ background: 'var(--surface-secondary)', color: 'var(--text-secondary)' }}>
                          {topType.name} ({topType.days}d)
                        </span>
                      ) : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                    </td>
                    {showPrevYear && (
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>{prevDays}d</span>
                          {yoyChange !== null && (
                            <span
                              className="text-xs font-bold px-1.5 py-0.5 rounded"
                              style={{
                                background: yoyChange > 0 ? '#ef444420' : '#10b98120',
                                color: yoyChange > 0 ? '#ef4444' : '#10b981',
                              }}
                            >
                              {yoyChange > 0 ? '+' : ''}{yoyChange}%
                            </span>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Leave Type Distribution per Month (Stacked visual) */}
      {!leaveTypeId && (report?.leaveTypes?.length || 0) > 1 && (
        <div className="modern-card rounded-2xl overflow-hidden">
          <div
            className="px-6 py-5 border-b"
            style={{ background: 'var(--surface-secondary)', borderColor: 'var(--border)' }}
          >
            <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
              Leave Type Distribution by Month
            </h3>
          </div>
          <div className="p-6">
            {/* Compact legend */}
            <div className="flex flex-wrap gap-3 mb-5">
              {report.leaveTypes.map((lt: any, i: number) => (
                <div key={lt.id} className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: TYPE_COLORS[i % TYPE_COLORS.length] }} />
                  <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>{lt.name}</span>
                </div>
              ))}
            </div>
            <div className="flex items-end gap-3 h-40">
              {monthly.map((m: any, mi: number) => {
                const totalDays = m.totalDays || 0;
                const isCurrentMonth = m.monthIndex === new Date().getMonth() && year === new Date().getFullYear();
                return (
                  <div key={mi} className="flex-1 flex flex-col items-center gap-1 group relative">
                    <div className="w-full flex flex-col-reverse rounded-t overflow-hidden" style={{ height: `${totalDays > 0 ? Math.max(8, (totalDays / maxVal) * 120) : 0}px`, minHeight: totalDays > 0 ? '8px' : '0px' }}>
                      {report.leaveTypes.map((lt: any, li: number) => {
                        const typeData = m.byLeaveType?.find((b: any) => b.name === lt.name);
                        const days = typeData?.days || 0;
                        const segH = totalDays > 0 ? (days / totalDays) * 100 : 0;
                        return (
                          <div
                            key={lt.id}
                            style={{ height: `${segH}%`, backgroundColor: TYPE_COLORS[li % TYPE_COLORS.length], minHeight: days > 0 ? '2px' : '0px' }}
                          />
                        );
                      })}
                    </div>
                    <span
                      className="text-[9px] font-bold uppercase"
                      style={{ color: isCurrentMonth ? 'var(--primary)' : 'var(--text-muted)' }}
                    >
                      {m.month}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
