'use client';

import React, { useEffect, useState } from 'react';
import { reportService, leaveTypeService, departmentService } from '@/lib/services';
import { Select } from '@/components/ui/Select';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { ArrowLeft, Building2, TrendingUp, CalendarDays, Trophy, Clock } from 'lucide-react';

const COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#14b8a6'];

export default function DepartmentWiseReport() {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());
  const [leaveTypeId, setLeaveTypeId] = useState('');
  const [leaveTypes, setLeaveTypes] = useState<any[]>([]);

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
      const data = await reportService.getDepartmentWiseReport(params);
      setReport(data);
    } catch {
      toast.error('Failed to load department-wise report');
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

  const departments: any[] = report?.departments || [];
  const maxDays = Math.max(...departments.map((d: any) => d.totalDaysTaken), 1);

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
                style={{ background: 'linear-gradient(135deg, #06b6d4, #6366f1)' }}
              >
                <Building2 size={20} className="text-white" />
              </div>
              <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Department-wise Leave
              </h1>
            </div>
            <p className="mt-1 ml-[52px]" style={{ color: 'var(--text-muted)' }}>
              Compare leave consumption across departments for {year}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
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
          { label: 'Departments', value: report?.totalDepartments || 0, icon: <Building2 size={28} />, color: '#6366f1' },
          { label: 'Total Days Taken', value: report?.totalDaysOrg || 0, icon: <CalendarDays size={28} />, color: '#06b6d4' },
          { label: 'Most Active Dept', value: departments[0]?.department?.name || 'N/A', icon: <Trophy size={28} />, color: '#f59e0b', isText: true },
          { label: 'Total Pending', value: departments.reduce((s: number, d: any) => s + d.pending, 0), icon: <Clock size={28} />, color: '#ef4444' },
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

      {/* Bar Chart Visualization */}
      <div className="modern-card rounded-2xl overflow-hidden">
        <div
          className="px-6 py-5 border-b flex items-center gap-2"
          style={{ background: 'var(--surface-secondary)', borderColor: 'var(--border)' }}
        >
          <TrendingUp size={18} style={{ color: 'var(--primary)' }} />
          <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
            Days Taken by Department
          </h3>
        </div>
        <div className="p-6">
          {departments.length === 0 ? (
            <p className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
              No department data available
            </p>
          ) : (
            <div className="space-y-4">
              {departments.map((dept: any, i: number) => {
                const barWidth = maxDays > 0 ? (dept.totalDaysTaken / maxDays) * 100 : 0;
                const color = COLORS[i % COLORS.length];
                return (
                  <div key={dept.department.id} className="group">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
                        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                          {dept.department.name}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--surface-secondary)', color: 'var(--text-muted)' }}>
                          {dept.headcount} staff
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>
                        <span>{dept.totalDaysTaken}d total</span>
                        <span style={{ color: 'var(--text-muted)' }}>·</span>
                        <span>{dept.avgDaysPerEmployee}d/person</span>
                      </div>
                    </div>
                    <div className="w-full h-3 rounded-full" style={{ background: 'var(--surface-secondary)' }}>
                      <div
                        className="h-3 rounded-full transition-all duration-700"
                        style={{ width: `${barWidth}%`, backgroundColor: color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Department Detail Table */}
      <div className="modern-card rounded-2xl overflow-hidden">
        <div
          className="px-6 py-5 border-b"
          style={{ background: 'var(--surface-secondary)', borderColor: 'var(--border)' }}
        >
          <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
            Department Details
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead>
              <tr style={{ background: 'var(--surface-secondary)' }}>
                {['Department', 'Headcount', 'Total Apps', 'Approved', 'Pending', 'Rejected', 'Days Taken', 'Avg/Person'].map((h) => (
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
              {departments.map((dept: any, i: number) => {
                const color = COLORS[i % COLORS.length];
                return (
                  <tr
                    key={dept.department.id}
                    style={{ borderBottom: '1px solid var(--border)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--surface-hover)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
                        <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                          {dept.department.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
                      {dept.headcount}
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
                      {dept.totalApplications}
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm font-bold" style={{ color: '#10b981' }}>{dept.approved}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm font-bold" style={{ color: '#f59e0b' }}>{dept.pending}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm font-bold" style={{ color: '#ef4444' }}>{dept.rejected}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{dept.totalDaysTaken}d</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm font-bold" style={{ color: 'var(--primary)' }}>{dept.avgDaysPerEmployee}d</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {departments.length === 0 && (
            <p className="text-center py-10" style={{ color: 'var(--text-muted)' }}>
              No data available for the selected filters.
            </p>
          )}
        </div>
      </div>

      {/* Leave Type Breakdown per Department */}
      {departments.some((d: any) => d.leaveTypeBreakdown?.length > 0) && (
        <div className="modern-card rounded-2xl overflow-hidden">
          <div
            className="px-6 py-5 border-b"
            style={{ background: 'var(--surface-secondary)', borderColor: 'var(--border)' }}
          >
            <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
              Leave Type Split per Department
            </h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {departments
              .filter((d: any) => d.leaveTypeBreakdown?.length > 0)
              .map((dept: any, i: number) => (
                <div key={dept.department.id} className="rounded-xl p-4" style={{ background: 'var(--surface-secondary)' }}>
                  <p className="font-bold text-sm mb-3" style={{ color: 'var(--text-primary)' }}>
                    {dept.department.name}
                  </p>
                  <div className="space-y-2">
                    {dept.leaveTypeBreakdown.map((bt: any, j: number) => {
                      const total = dept.leaveTypeBreakdown.reduce((s: number, b: any) => s + b.days, 0);
                      const pct = total > 0 ? Math.round((bt.days / total) * 100) : 0;
                      const color = COLORS[j % COLORS.length];
                      return (
                        <div key={j}>
                          <div className="flex justify-between text-xs mb-1">
                            <span style={{ color: 'var(--text-secondary)' }}>{bt.name}</span>
                            <span className="font-bold" style={{ color }}>{bt.days}d ({pct}%)</span>
                          </div>
                          <div className="w-full h-2 rounded-full" style={{ background: 'var(--border)' }}>
                            <div
                              className="h-2 rounded-full"
                              style={{ width: `${pct}%`, backgroundColor: color }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
