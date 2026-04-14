'use client';

import React, { useEffect, useState } from 'react';
import { reportService, leaveTypeService, departmentService } from '@/lib/services';
import { Select } from '@/components/ui/Select';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { ArrowLeft, AlertTriangle, Users, TrendingDown, Flag } from 'lucide-react';

const THRESHOLDS = [
  { value: '', label: 'All Employees' },
  { value: '5', label: '≥ 5 days' },
  { value: '10', label: '≥ 10 days' },
  { value: '15', label: '≥ 15 days' },
  { value: '20', label: '≥ 20 days' },
];

export default function AbsenteeismReport() {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());
  const [departmentId, setDepartmentId] = useState('');
  const [leaveTypeId, setLeaveTypeId] = useState('');
  const [threshold, setThreshold] = useState('');
  const [departments, setDepartments] = useState<any[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<any[]>([]);

  const years = Array.from({ length: 5 }, (_, i) => ({
    value: String(new Date().getFullYear() - i),
    label: String(new Date().getFullYear() - i),
  }));

  useEffect(() => {
    Promise.all([
      departmentService.getDepartments(),
      leaveTypeService.getLeaveTypes(),
    ]).then(([depts, types]) => {
      setDepartments(depts);
      setLeaveTypes(types);
    }).catch(() => {});
  }, []);

  useEffect(() => { loadReport(); }, [year, departmentId, leaveTypeId, threshold]);

  const loadReport = async () => {
    try {
      setLoading(true);
      const params: any = { year };
      if (departmentId) params.departmentId = departmentId;
      if (leaveTypeId) params.leaveTypeId = leaveTypeId;
      if (threshold) params.threshold = Number(threshold);
      const data = await reportService.getAbsenteeismReport(params);
      setReport(data);
    } catch {
      toast.error('Failed to load absenteeism report');
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

  const employees: any[] = report?.employees || [];

  const getRiskColor = (days: number) => {
    if (days >= 20) return '#ef4444';
    if (days >= 10) return '#f59e0b';
    return '#10b981';
  };

  const getRiskLabel = (emp: any) => {
    if (emp.patternFlag) return { label: 'Pattern Detected', color: '#ef4444', bg: '#ef444420' };
    if (emp.totalDaysAbsent >= 15) return { label: 'High', color: '#f59e0b', bg: '#f59e0b20' };
    return { label: 'Normal', color: '#10b981', bg: '#10b98120' };
  };

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
                style={{ background: 'linear-gradient(135deg, #ef4444, #f59e0b)' }}
              >
                <AlertTriangle size={20} className="text-white" />
              </div>
              <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Absenteeism Report
              </h1>
            </div>
            <p className="mt-1 ml-[52px]" style={{ color: 'var(--text-muted)' }}>
              Identify frequent leave takers and Monday/Friday patterns for {year}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}
            options={[{ value: '', label: 'All Departments' }, ...departments.map((d) => ({ value: d._id, label: d.name }))]}
            className="w-44"
          />
          <Select value={leaveTypeId} onChange={(e) => setLeaveTypeId(e.target.value)}
            options={[{ value: '', label: 'All Leave Types' }, ...leaveTypes.map((lt) => ({ value: lt._id, label: lt.name }))]}
            className="w-44"
          />
          <Select value={threshold} onChange={(e) => setThreshold(e.target.value)}
            options={THRESHOLDS} className="w-36"
          />
          <Select value={String(year)} onChange={(e) => setYear(Number(e.target.value))}
            options={years} className="w-28"
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {[
          { label: 'Employees Shown', value: report?.summary?.totalEmployees || 0, icon: <Users size={20} className="text-white" />, color: '#6366f1' },
          { label: 'Total Absent Days', value: report?.summary?.totalAbsentDays || 0, icon: <TrendingDown size={20} className="text-white" />, color: '#ef4444' },
          { label: 'Avg Days / Employee', value: `${report?.summary?.avgAbsentDaysPerEmployee || 0}d`, icon: <AlertTriangle size={20} className="text-white" />, color: '#f59e0b', isText: true },
          { label: 'Pattern Flagged', value: report?.summary?.flaggedEmployees || 0, icon: <Flag size={20} className="text-white" />, color: '#ec4899' },
        ].map((card, i) => (
          <div key={i} className="modern-card rounded-2xl p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: `linear-gradient(135deg, ${card.color}, ${card.color}cc)` }}>
              {card.icon}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{card.label}</p>
              <p className={`font-bold truncate ${(card as any).isText ? 'text-xl' : 'text-2xl'}`} style={{ color: 'var(--text-primary)' }}>
                {card.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Employee Table */}
      <div className="modern-card rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b flex items-center justify-between"
          style={{ background: 'var(--surface-secondary)', borderColor: 'var(--border)' }}>
          <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Employee Absenteeism Details</h3>
          <div className="flex items-center gap-3 text-xs">
            {[{ label: 'Pattern Detected', color: '#ef4444' }, { label: 'High Absence', color: '#f59e0b' }, { label: 'Normal', color: '#10b981' }].map((l) => (
              <div key={l.label} className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full" style={{ background: l.color }} />
                <span style={{ color: 'var(--text-muted)' }}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead>
              <tr style={{ background: 'var(--surface-secondary)' }}>
                {['Employee', 'Department', 'Days Absent', 'Instances', 'Most Common Type', 'Mon Leaves', 'Fri Leaves', 'Risk'].map((h) => (
                  <th key={h} className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {employees.map((emp: any, i: number) => {
                const risk = getRiskLabel(emp);
                const daysColor = getRiskColor(emp.totalDaysAbsent);
                return (
                  <tr key={i}
                    style={{ borderBottom: '1px solid var(--border)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--surface-hover)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                  >
                    <td className="px-5 py-4">
                      <div>
                        <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{emp.employee.name}</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{emp.employee.designation || emp.employee.email}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {emp.employee.department?.name || '—'}
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-lg font-bold" style={{ color: daysColor }}>{emp.totalDaysAbsent}d</span>
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
                      {emp.leaveInstances}
                    </td>
                    <td className="px-5 py-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {emp.mostCommonLeaveType?.name || '—'}
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold" style={{ color: emp.mondayLeaves >= 2 ? '#f59e0b' : 'var(--text-secondary)' }}>
                      {emp.mondayLeaves}
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold" style={{ color: emp.fridayLeaves >= 2 ? '#f59e0b' : 'var(--text-secondary)' }}>
                      {emp.fridayLeaves}
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: risk.bg, color: risk.color }}>
                        {risk.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {employees.length === 0 && (
            <p className="text-center py-10" style={{ color: 'var(--text-muted)' }}>
              No absenteeism data for the selected filters.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
