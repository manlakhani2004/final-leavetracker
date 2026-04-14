'use client';

import React, { useEffect, useState } from 'react';
import { reportService } from '@/lib/services';
import { Select } from '@/components/ui/Select';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { ArrowLeft, PieChart, TrendingUp, Layers } from 'lucide-react';

const COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#14b8a6'];

export default function LeaveUtilizationReport() {
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
      const data = await reportService.getLeaveTypeUtilizationReport({ year });
      setReport(data);
    } catch {
      toast.error('Failed to load leave utilization report');
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

  const leaveTypes: any[] = report?.leaveTypes || [];

  const getUtilColor = (pct: number) => {
    if (pct >= 80) return '#ef4444';
    if (pct >= 50) return '#f59e0b';
    return '#10b981';
  };

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
                style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)' }}>
                <PieChart size={20} className="text-white" />
              </div>
              <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Leave Type Utilization
              </h1>
            </div>
            <p className="mt-1 ml-[52px]" style={{ color: 'var(--text-muted)' }}>
              Effectiveness of leave policies across the organization for {year}
            </p>
          </div>
        </div>
        <Select value={String(year)} onChange={(e) => setYear(Number(e.target.value))}
          options={years} className="w-28"
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {[
          { label: 'Leave Types', value: report?.summary?.totalLeaveTypes || 0, color: '#6366f1', icon: <Layers size={20} className="text-white" /> },
          { label: 'Total Allocated (Days)', value: report?.summary?.totalAllocatedOrgWide || 0, color: '#06b6d4', icon: <TrendingUp size={20} className="text-white" /> },
          { label: 'Total Used (Days)', value: report?.summary?.totalUsedOrgWide || 0, color: '#f59e0b', icon: <TrendingUp size={20} className="text-white" /> },
          { label: 'Overall Utilization', value: `${report?.summary?.overallUtilizationPct || 0}%`, color: '#8b5cf6', icon: <PieChart size={20} className="text-white" />, isText: true },
        ].map((card, i) => (
          <div key={i} className="modern-card rounded-2xl p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: `linear-gradient(135deg, ${card.color}, ${card.color}cc)` }}>
              {card.icon}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{card.label}</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Overall utilization donut-style progress */}
      <div className="modern-card rounded-2xl p-6">
        <h3 className="font-bold text-lg mb-6" style={{ color: 'var(--text-primary)' }}>Utilization by Leave Type</h3>
        <div className="space-y-6">
          {leaveTypes.map((lt: any, i: number) => {
            const color = COLORS[i % COLORS.length];
            const utilColor = getUtilColor(lt.utilizationPercent);
            return (
              <div key={i}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full shrink-0" style={{ background: color }} />
                    <div>
                      <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                        {lt.leaveType.name}
                      </span>
                      {lt.leaveType.isPaid && (
                        <span className="ml-2 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded" style={{ background: '#10b98120', color: '#10b981' }}>
                          Paid
                        </span>
                      )}
                      {lt.leaveType.carryForwardAllowed && (
                        <span className="ml-1 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded" style={{ background: '#6366f120', color: '#6366f1' }}>
                          CF
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-right">
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Allocated</p>
                      <p className="font-bold" style={{ color: 'var(--text-secondary)' }}>{lt.totalAllocated}d</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Used</p>
                      <p className="font-bold" style={{ color: 'var(--text-secondary)' }}>{lt.totalUsed}d</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Unused</p>
                      <p className="font-bold" style={{ color: 'var(--text-secondary)' }}>{lt.unusedDays}d</p>
                    </div>
                    <div className="text-right w-16">
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Utilization</p>
                      <p className="font-bold text-base" style={{ color: utilColor }}>{lt.utilizationPercent}%</p>
                    </div>
                  </div>
                </div>
                <div className="relative h-4 rounded-full overflow-hidden" style={{ background: 'var(--surface-secondary)' }}>
                  <div
                    className="absolute left-0 top-0 h-full rounded-full transition-all duration-700"
                    style={{ width: `${lt.utilizationPercent}%`, background: `linear-gradient(90deg, ${color}, ${utilColor})` }}
                  />
                </div>
                <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  <span>{lt.approvedApplications} applications</span>
                  <span>{lt.totalAllocated}d total capacity</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail Table */}
      <div className="modern-card rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b" style={{ background: 'var(--surface-secondary)', borderColor: 'var(--border)' }}>
          <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Detailed Breakdown</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead>
              <tr style={{ background: 'var(--surface-secondary)' }}>
                {['Leave Type', 'Paid', 'Carry Fwd', 'Days Allowed/Person', 'Total Allocated', 'Total Used', 'Remaining', 'Applications', 'Utilization'].map((h) => (
                  <th key={h} className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leaveTypes.map((lt: any, i: number) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--surface-hover)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}>
                  <td className="px-4 py-4">
                    <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{lt.leaveType.name}</span>
                  </td>
                  <td className="px-4 py-4 text-sm" style={{ color: lt.leaveType.isPaid ? '#10b981' : 'var(--text-muted)' }}>
                    {lt.leaveType.isPaid ? 'Yes' : 'No'}
                  </td>
                  <td className="px-4 py-4 text-sm" style={{ color: lt.leaveType.carryForwardAllowed ? '#6366f1' : 'var(--text-muted)' }}>
                    {lt.leaveType.carryForwardAllowed ? 'Yes' : 'No'}
                  </td>
                  <td className="px-4 py-4 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>{lt.leaveType.totalDaysAllowed}</td>
                  <td className="px-4 py-4 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>{lt.totalAllocated}d</td>
                  <td className="px-4 py-4 text-sm font-bold" style={{ color: 'var(--primary)' }}>{lt.totalUsed}d</td>
                  <td className="px-4 py-4 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>{lt.totalRemaining}d</td>
                  <td className="px-4 py-4 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>{lt.approvedApplications}</td>
                  <td className="px-4 py-4">
                    <span className="text-sm font-bold" style={{ color: getUtilColor(lt.utilizationPercent) }}>{lt.utilizationPercent}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {leaveTypes.length === 0 && (
            <p className="text-center py-10" style={{ color: 'var(--text-muted)' }}>No utilization data available.</p>
          )}
        </div>
      </div>
    </div>
  );
}
