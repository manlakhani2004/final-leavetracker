'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { reportService, leaveTypeService, departmentService } from '@/lib/services';
import { Select } from '@/components/ui/Select';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { ArrowLeft, Wallet, AlertTriangle, Search } from 'lucide-react';

export default function LeaveBalanceSummaryReport() {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());
  const [leaveTypeId, setLeaveTypeId] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [showOnlyLow, setShowOnlyLow] = useState(false);
  const [search, setSearch] = useState('');
  const [leaveTypes, setLeaveTypes] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);

  const years = Array.from({ length: 5 }, (_, i) => ({
    value: String(new Date().getFullYear() - i),
    label: String(new Date().getFullYear() - i),
  }));

  useEffect(() => {
    Promise.all([
      leaveTypeService.getLeaveTypes().then(setLeaveTypes),
      departmentService.getDepartments().then(setDepartments),
    ]).catch(() => {});
  }, []);

  useEffect(() => {
    loadReport();
  }, [year, leaveTypeId, departmentId]);

  const loadReport = async () => {
    try {
      setLoading(true);
      const params: any = { year };
      if (leaveTypeId) params.leaveTypeId = leaveTypeId;
      if (departmentId) params.departmentId = departmentId;
      const data = await reportService.getLeaveBalanceSummaryReport(params);
      setReport(data);
    } catch {
      toast.error('Failed to load leave balance summary');
    } finally {
      setLoading(false);
    }
  };

  const employees: any[] = report?.employees || [];

  const filteredEmployees = useMemo(() => {
    let list = employees;
    if (showOnlyLow) list = list.filter((e) => e.isLowBalance);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (e) =>
          e.employee.name?.toLowerCase().includes(q) ||
          e.employee.email?.toLowerCase().includes(q) ||
          e.employee.designation?.toLowerCase().includes(q),
      );
    }
    return list;
  }, [employees, showOnlyLow, search]);

  const getUtilizationColor = (pct: number) => {
    if (pct >= 90) return '#ef4444';
    if (pct >= 70) return '#f59e0b';
    return '#10b981';
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
                style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)' }}
              >
                <Wallet size={20} className="text-white" />
              </div>
              <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Leave Balance Summary
              </h1>
            </div>
            <p className="mt-1 ml-[52px]" style={{ color: 'var(--text-muted)' }}>
              All employees' current leave balances at a glance — {year}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Select
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
            options={[
              { value: '', label: 'All Departments' },
              ...departments.map((d) => ({ value: d._id, label: d.name })),
            ]}
            className="w-44"
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
            onChange={(e) => setYear(Number(e.target.value))}
            options={years}
            className="w-32"
          />
        </div>
      </div>

      {/* Summary Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {[
          { label: 'Total Employees', value: report?.summary?.totalEmployees || 0, emoji: '👥', color: '#6366f1' },
          { label: 'Zero Balance', value: report?.summary?.zeroBalanceCount || 0, emoji: '🔴', color: '#ef4444' },
          { label: '≤ 2 Days Left', value: report?.summary?.lowBalanceCount || 0, emoji: '⚠️', color: '#f59e0b' },
          { label: 'Avg Utilization', value: `${report?.summary?.avgUtilization || 0}%`, emoji: '📊', color: '#10b981', isText: true },
        ].map((card, i) => (
          <div key={i} className="modern-card rounded-2xl p-5 flex items-center gap-4">
            <div
              className="h-12 w-12 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: `${card.color}20` }}
            >
              <span className="text-2xl">{card.emoji}</span>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                {card.label}
              </p>
              <p
                className={`font-bold ${(card as any).isText ? 'text-xl' : 'text-2xl'}`}
                style={{ color: (card as any).isText ? card.color : 'var(--text-primary)' }}
              >
                {card.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Alert Banner */}
      {(report?.summary?.lowBalanceCount || 0) > 0 && (
        <div
          className="rounded-xl p-4 flex items-start gap-3"
          style={{ background: '#f59e0b15', border: '1px solid #f59e0b40' }}
        >
          <AlertTriangle size={20} style={{ color: '#f59e0b', marginTop: 1, shrink: 0 }} className="shrink-0" />
          <div>
            <p className="font-bold text-sm" style={{ color: '#f59e0b' }}>
              Low Balance Alert
            </p>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
              {report.summary.lowBalanceCount} employee{report.summary.lowBalanceCount > 1 ? 's have' : ' has'} 2 or fewer days remaining.
              Consider reviewing before year-end.
            </p>
          </div>
        </div>
      )}

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-3">
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-xl flex-1 min-w-[200px]"
          style={{ background: 'var(--surface-secondary)', border: '1px solid var(--border)' }}
        >
          <Search size={16} style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search employee..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent flex-1 text-sm outline-none"
            style={{ color: 'var(--text-primary)' }}
          />
        </div>
        <button
          onClick={() => setShowOnlyLow(!showOnlyLow)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all"
          style={{
            background: showOnlyLow ? '#f59e0b' : 'var(--surface-secondary)',
            color: showOnlyLow ? 'white' : 'var(--text-muted)',
            border: '1px solid var(--border)',
          }}
        >
          <AlertTriangle size={14} />
          Low Balance Only
        </button>
      </div>

      {/* Employee Table */}
      <div className="modern-card rounded-2xl overflow-hidden">
        <div
          className="px-6 py-5 border-b flex items-center justify-between"
          style={{ background: 'var(--surface-secondary)', borderColor: 'var(--border)' }}
        >
          <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
            Employee Leave Balances
          </h3>
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Showing {filteredEmployees.length} of {employees.length}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead>
              <tr style={{ background: 'var(--surface-secondary)' }}>
                {['Employee', 'Department', 'Designation', 'Allocated', 'Used', 'Remaining', 'Utilization'].map((h) => (
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
              {filteredEmployees.map((emp: any) => {
                const utilizationColor = getUtilizationColor(emp.utilizationPercent);
                const isLow = emp.isLowBalance;
                return (
                  <tr
                    key={emp.employee.id}
                    style={{
                      borderBottom: '1px solid var(--border)',
                      background: isLow ? '#f59e0b08' : 'transparent',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--surface-hover)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = isLow ? '#f59e0b08' : 'transparent'; }}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {isLow && <AlertTriangle size={14} style={{ color: '#f59e0b', flexShrink: 0 }} />}
                        <div>
                          <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                            {emp.employee.name}
                          </p>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            {emp.employee.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {(emp.employee.department as any)?.name || '—'}
                    </td>
                    <td className="px-5 py-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {emp.employee.designation || '—'}
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {emp.totalAllocated}d
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold" style={{ color: '#ef4444' }}>
                      {emp.totalUsed}d
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className="text-sm font-bold"
                        style={{ color: emp.totalRemaining === 0 ? '#ef4444' : isLow ? '#f59e0b' : '#10b981' }}
                      >
                        {emp.totalRemaining}d
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 rounded-full h-2" style={{ background: 'var(--surface-secondary)' }}>
                          <div
                            className="h-2 rounded-full transition-all"
                            style={{ width: `${emp.utilizationPercent}%`, backgroundColor: utilizationColor }}
                          />
                        </div>
                        <span className="text-xs font-bold" style={{ color: utilizationColor }}>
                          {emp.utilizationPercent}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredEmployees.length === 0 && (
            <p className="text-center py-10" style={{ color: 'var(--text-muted)' }}>
              No employees match the current filters.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
