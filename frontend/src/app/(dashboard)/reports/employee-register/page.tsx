'use client';

import React, { useEffect, useState } from 'react';
import { reportService, leaveTypeService, departmentService } from '@/lib/services';
import { Select } from '@/components/ui/Select';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { ArrowLeft, ClipboardList, Building2, Users } from 'lucide-react';

export default function EmployeeRegisterReport() {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());
  const [departmentId, setDepartmentId] = useState('');
  const [departments, setDepartments] = useState<any[]>([]);
  const [expandedEmployee, setExpandedEmployee] = useState<string | null>(null);

  const years = Array.from({ length: 5 }, (_, i) => ({
    value: String(new Date().getFullYear() - i),
    label: String(new Date().getFullYear() - i),
  }));

  useEffect(() => {
    departmentService.getDepartments().then(setDepartments).catch(() => {});
  }, []);

  useEffect(() => { loadReport(); }, [year, departmentId]);

  const loadReport = async () => {
    try {
      setLoading(true);
      const params: any = { year };
      if (departmentId) params.departmentId = departmentId;
      const data = await reportService.getEmployeeRegisterReport(params);
      setReport(data);
    } catch {
      toast.error('Failed to load employee register');
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
  const leaveTypes: any[] = report?.leaveTypes || [];
  const deptSummary: any[] = report?.summary?.departmentSummary || [];

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
                style={{ background: 'linear-gradient(135deg, #14b8a6, #6366f1)' }}>
                <ClipboardList size={20} className="text-white" />
              </div>
              <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Employee Register
              </h1>
            </div>
            <p className="mt-1 ml-[52px]" style={{ color: 'var(--text-muted)' }}>
              Full leave register for compliance and audit — {year}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}
            options={[{ value: '', label: 'All Departments' }, ...departments.map((d) => ({ value: d._id, label: d.name }))]}
            className="w-44"
          />
          <Select value={String(year)} onChange={(e) => setYear(Number(e.target.value))}
            options={years} className="w-28"
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
        {[
          { label: 'Total Employees', value: report?.summary?.totalEmployees || 0, color: '#6366f1', icon: <Users size={28} /> },
          { label: 'Leave Types', value: leaveTypes.length, color: '#06b6d4', icon: <ClipboardList size={28} /> },
          { label: 'Departments', value: deptSummary.length, color: '#10b981', icon: <Building2 size={28} /> },
        ].map((card, i) => (
          <div key={i} className="modern-card rounded-2xl p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: `${card.color}20` }}>
              <div style={{ color: card.color }}>{card.icon}</div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{card.label}</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Department Summary */}
      {deptSummary.length > 0 && (
        <div className="modern-card rounded-2xl overflow-hidden">
          <div className="px-6 py-5 border-b flex items-center gap-2"
            style={{ background: 'var(--surface-secondary)', borderColor: 'var(--border)' }}>
            <Building2 size={18} style={{ color: 'var(--primary)' }} />
            <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Department Summary</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {deptSummary.map((dept: any, i: number) => (
              <div key={i} className="rounded-xl p-4" style={{ background: 'var(--surface-secondary)' }}>
                <p className="font-bold text-sm mb-3" style={{ color: 'var(--text-primary)' }}>{dept.name}</p>
                <div className="grid grid-cols-3 gap-2 text-xs text-center">
                  <div>
                    <p style={{ color: 'var(--text-muted)' }}>Headcount</p>
                    <p className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>{dept.headcount}</p>
                  </div>
                  <div>
                    <p style={{ color: 'var(--text-muted)' }}>Used</p>
                    <p className="font-bold text-base" style={{ color: '#ef4444' }}>{dept.totalUsed}d</p>
                  </div>
                  <div>
                    <p style={{ color: 'var(--text-muted)' }}>Remaining</p>
                    <p className="font-bold text-base" style={{ color: '#10b981' }}>{dept.totalRemaining}d</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Employee Register Table */}
      <div className="modern-card rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b flex items-center justify-between"
          style={{ background: 'var(--surface-secondary)', borderColor: 'var(--border)' }}>
          <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Full Employee Leave Register</h3>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Click a row to expand leave type details</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead>
              <tr style={{ background: 'var(--surface-secondary)' }}>
                {['Employee', 'Department', 'Designation', 'Total Used', 'Total Remaining', 'Carry Fwd'].map((h) => (
                  <th key={h} className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {employees.map((emp: any) => (
                <React.Fragment key={emp.employee.id}>
                  <tr
                    className="cursor-pointer"
                    style={{ borderBottom: expandedEmployee === emp.employee.id ? 'none' : '1px solid var(--border)' }}
                    onClick={() => setExpandedEmployee(expandedEmployee === emp.employee.id ? null : emp.employee.id)}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--surface-hover)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = expandedEmployee === emp.employee.id ? 'var(--surface-secondary)' : 'transparent'; }}
                  >
                    <td className="px-5 py-4">
                      <div>
                        <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{emp.employee.name}</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{emp.employee.email}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {emp.employee.department?.name || '—'}
                    </td>
                    <td className="px-5 py-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {emp.employee.designation || '—'}
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm font-bold" style={{ color: '#ef4444' }}>{emp.totalUsed}d</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm font-bold" style={{ color: '#10b981' }}>{emp.totalRemaining}d</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm font-semibold" style={{ color: '#6366f1' }}>{emp.totalCarryForward}d</span>
                    </td>
                  </tr>
                  {expandedEmployee === emp.employee.id && (
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      <td colSpan={6} className="px-5 py-4" style={{ background: 'var(--surface-secondary)' }}>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                          {emp.balances.map((bal: any) => (
                            <div key={bal.leaveTypeId} className="rounded-xl p-3" style={{ background: 'var(--surface-primary)', border: '1px solid var(--border)' }}>
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{bal.leaveTypeName}</p>
                                {bal.isPaid && (
                                  <span className="text-[9px] font-bold px-1 py-0.5 rounded" style={{ background: '#10b98120', color: '#10b981' }}>Paid</span>
                                )}
                              </div>
                              <div className="grid grid-cols-3 gap-1 text-center text-xs">
                                <div>
                                  <p style={{ color: 'var(--text-muted)' }}>Alloc</p>
                                  <p className="font-bold" style={{ color: 'var(--text-secondary)' }}>{bal.totalAllocated}</p>
                                </div>
                                <div>
                                  <p style={{ color: 'var(--text-muted)' }}>Used</p>
                                  <p className="font-bold" style={{ color: '#ef4444' }}>{bal.used}</p>
                                </div>
                                <div>
                                  <p style={{ color: 'var(--text-muted)' }}>Left</p>
                                  <p className="font-bold" style={{ color: '#10b981' }}>{bal.remaining}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
          {employees.length === 0 && (
            <p className="text-center py-10" style={{ color: 'var(--text-muted)' }}>No employees found for the selected filters.</p>
          )}
        </div>
      </div>
    </div>
  );
}
