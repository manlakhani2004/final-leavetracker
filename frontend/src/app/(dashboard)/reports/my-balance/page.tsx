'use client';

import React, { useEffect, useState } from 'react';
import { reportService } from '@/lib/services';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { StatCard } from '@/components/ui/StatCard';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { ArrowLeft, PieChart, Download } from 'lucide-react';

export default function MyBalanceReport() {
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
      const data = await reportService.getMyBalanceReport(year);
      setReport(data);
    } catch (error) {
      console.error('Failed to load report:', error);
      toast.error('Failed to load balance report');
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
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
              >
                <PieChart size={20} className="text-white" />
              </div>
              <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                My Leave Balance
              </h1>
            </div>
            <p className="mt-1 ml-[52px]" style={{ color: 'var(--text-muted)' }}>
              Detailed breakdown of your leave balance for {year}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Select
            value={String(year)}
            onChange={(e) => setYear(Number(e.target.value))}
            options={years}
            className="w-32"
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          icon={<span className="text-2xl">📅</span>}
          title="Total Allocated"
          value={report?.summary?.totalAllocated || 0}
          subtitle="Annual allowance"
          color="indigo"
        />
        <StatCard
          icon={<span className="text-2xl">✈️</span>}
          title="Used"
          value={report?.summary?.totalUsed || 0}
          subtitle="Days consumed"
          color="rose"
        />
        <StatCard
          icon={<span className="text-2xl">🎯</span>}
          title="Remaining"
          value={report?.summary?.totalRemaining || 0}
          subtitle="Available to use"
          color="emerald"
        />
        <StatCard
          icon={<span className="text-2xl">📊</span>}
          title="Utilization"
          value={`${report?.summary?.overallUtilization || 0}%`}
          subtitle="Balance used"
          color="amber"
        />
      </div>

      {/* Carry Forward Info */}
      {report?.summary?.totalCarryForward > 0 && (
        <div
          className="rounded-2xl p-5 flex items-center gap-4"
          style={{
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(139, 92, 246, 0.08))',
            border: '1px solid rgba(99, 102, 241, 0.2)',
          }}
        >
          <div className="text-2xl">🔄</div>
          <div>
            <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
              Carry Forward: {report.summary.totalCarryForward} days
            </p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Includes days carried forward from the previous year
            </p>
          </div>
        </div>
      )}

      {/* Detailed Balance Table */}
      <div className="modern-card rounded-2xl overflow-hidden">
        <div
          className="px-6 py-5 border-b flex items-center justify-between"
          style={{ background: 'var(--surface-secondary)', borderColor: 'var(--border)' }}
        >
          <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
            Balance by Leave Type
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full" style={{ borderCollapse: 'separate', borderSpacing: '0' }}>
            <thead>
              <tr style={{ background: 'var(--surface-secondary)' }}>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Leave Type</th>
                <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Allocated</th>
                <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Carry Forward</th>
                <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Effective</th>
                <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Used</th>
                <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Remaining</th>
                <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Utilization</th>
              </tr>
            </thead>
            <tbody>
              {report?.balances?.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center" style={{ color: 'var(--text-muted)' }}>
                    <div className="text-4xl mb-2">📭</div>
                    <p>No balance records found for {year}</p>
                  </td>
                </tr>
              )}
              {report?.balances?.map((balance: any, index: number) => (
                <tr
                  key={index}
                  className="transition-colors"
                  style={{ borderBottom: '1px solid var(--border)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--surface-hover)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-8 w-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                        style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                      >
                        {balance.leaveType?.name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                          {balance.leaveType?.name || 'Unknown'}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {balance.leaveType?.isPaid ? 'Paid' : 'Unpaid'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
                    {balance.totalAllocated}
                  </td>
                  <td className="px-6 py-4 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                    {balance.carryForward > 0 ? `+${balance.carryForward}` : '—'}
                  </td>
                  <td className="px-6 py-4 text-center text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                    {balance.effectiveAllocation}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold"
                      style={{
                        backgroundColor: balance.used > 0 ? 'rgba(239, 68, 68, 0.1)' : 'var(--surface-secondary)',
                        color: balance.used > 0 ? '#ef4444' : 'var(--text-muted)',
                      }}
                    >
                      {balance.used}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold"
                      style={{
                        backgroundColor: balance.remaining > 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        color: balance.remaining > 0 ? '#10b981' : '#ef4444',
                      }}
                    >
                      {balance.remaining}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 justify-center">
                      <div className="w-20 rounded-full h-2" style={{ backgroundColor: 'var(--surface-secondary)' }}>
                        <div
                          className="h-2 rounded-full transition-all"
                          style={{
                            width: `${Math.min(100, balance.utilizationPercent)}%`,
                            backgroundColor:
                              balance.utilizationPercent >= 90
                                ? '#ef4444'
                                : balance.utilizationPercent >= 60
                                ? '#f59e0b'
                                : '#10b981',
                          }}
                        />
                      </div>
                      <span className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>
                        {balance.utilizationPercent}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Visual Balance Bars */}
      <div className="modern-card rounded-2xl overflow-hidden">
        <div
          className="px-6 py-5 border-b"
          style={{ background: 'var(--surface-secondary)', borderColor: 'var(--border)' }}
        >
          <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
            Visual Overview
          </h3>
        </div>
        <div className="p-6 space-y-5">
          {report?.balances?.map((balance: any, index: number) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-end">
                <div>
                  <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {balance.leaveType?.name}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {balance.used} used of {balance.effectiveAllocation} days
                  </p>
                </div>
                <p className="text-sm font-bold" style={{ color: balance.remaining > 0 ? '#10b981' : '#ef4444' }}>
                  {balance.remaining} remaining
                </p>
              </div>
              <div className="w-full rounded-full h-3" style={{ backgroundColor: 'var(--surface-secondary)' }}>
                <div
                  className="h-3 rounded-full transition-all duration-700 relative overflow-hidden"
                  style={{
                    width: `${Math.min(100, balance.effectiveAllocation > 0 ? (balance.used / balance.effectiveAllocation) * 100 : 0)}%`,
                    background:
                      balance.utilizationPercent >= 90
                        ? 'linear-gradient(90deg, #ef4444, #f87171)'
                        : balance.utilizationPercent >= 60
                        ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                        : 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                  }}
                >
                  <div
                    className="absolute inset-0 opacity-30"
                    style={{
                      background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
                      animation: 'shimmer 2s infinite',
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
          {!report?.balances?.length && (
            <p className="text-sm text-center py-4" style={{ color: 'var(--text-muted)' }}>
              No balance records found.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
