'use client';

import React, { useEffect, useState } from 'react';
import { reportService } from '@/lib/services';
import { Select } from '@/components/ui/Select';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { ArrowLeft, Clock, AlertCircle, CheckCircle, Users } from 'lucide-react';

export default function ApprovalTurnaroundReport() {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());
  const [status, setStatus] = useState('');
  const [tab, setTab] = useState<'applications' | 'approvers' | 'pending'>('approvers');

  const years = Array.from({ length: 5 }, (_, i) => ({
    value: String(new Date().getFullYear() - i),
    label: String(new Date().getFullYear() - i),
  }));

  useEffect(() => { loadReport(); }, [year, status]);

  const loadReport = async () => {
    try {
      setLoading(true);
      const params: any = { year };
      if (status) params.status = status;
      const data = await reportService.getApprovalTurnaroundReport(params);
      setReport(data);
    } catch {
      toast.error('Failed to load approval turnaround report');
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

  const applications: any[] = report?.applications || [];
  const approverStats: any[] = report?.approverStats || [];
  const longPending: any[] = report?.longPendingApplications || [];

  const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  const getTatColor = (hours: number | null) => {
    if (hours === null) return 'var(--text-muted)';
    if (hours <= 24) return '#10b981';
    if (hours <= 72) return '#f59e0b';
    return '#ef4444';
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
                style={{ background: 'linear-gradient(135deg, #6366f1, #06b6d4)' }}>
                <Clock size={20} className="text-white" />
              </div>
              <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Approval Turnaround
              </h1>
            </div>
            <p className="mt-1 ml-[52px]" style={{ color: 'var(--text-muted)' }}>
              Track how fast leaves are being approved or rejected for {year}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Select value={status} onChange={(e) => setStatus(e.target.value)}
            options={[{ value: '', label: 'All Decisions' }, { value: 'approved', label: 'Approved Only' }, { value: 'rejected', label: 'Rejected Only' }]}
            className="w-44"
          />
          <Select value={String(year)} onChange={(e) => setYear(Number(e.target.value))}
            options={years} className="w-28"
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {[
          { label: 'Decisions Made', value: report?.summary?.totalDecided || 0, icon: <CheckCircle size={20} className="text-white" />, color: '#10b981' },
          { label: 'Avg TAT (Hours)', value: `${report?.summary?.overallAvgTatHours || 0}h`, icon: <Clock size={20} className="text-white" />, color: '#6366f1', isText: true },
          { label: 'Avg TAT (Days)', value: `${report?.summary?.overallAvgTatDays || 0}d`, icon: <Clock size={20} className="text-white" />, color: '#06b6d4', isText: true },
          { label: 'Long Pending (>3d)', value: report?.summary?.longPendingCount || 0, icon: <AlertCircle size={20} className="text-white" />, color: '#ef4444' },
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

      {/* TAT Color Legend */}
      <div className="modern-card rounded-2xl px-6 py-4 flex flex-wrap items-center gap-6">
        <p className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>TAT Indicator:</p>
        {[{ label: '≤ 24h — Fast', color: '#10b981' }, { label: '≤ 72h — Normal', color: '#f59e0b' }, { label: '> 72h — Slow', color: '#ef4444' }].map((l) => (
          <div key={l.label} className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full" style={{ background: l.color }} />
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{l.label}</span>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b" style={{ borderColor: 'var(--border)' }}>
        {([
          { key: 'approvers', label: `Approver Stats (${approverStats.length})` },
          { key: 'applications', label: `All Decisions (${applications.length})` },
          { key: 'pending', label: `Long Pending (${longPending.length})` },
        ] as const).map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className="px-5 py-3 text-sm font-semibold transition-all border-b-2"
            style={{
              borderColor: tab === t.key ? 'var(--primary)' : 'transparent',
              color: tab === t.key ? 'var(--primary)' : 'var(--text-muted)',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === 'approvers' && (
        <div className="modern-card rounded-2xl overflow-hidden">
          <div className="px-6 py-5 border-b flex items-center gap-2"
            style={{ background: 'var(--surface-secondary)', borderColor: 'var(--border)' }}>
            <Users size={18} style={{ color: 'var(--primary)' }} />
            <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Average TAT per Approver</h3>
          </div>
          <div className="p-6 space-y-4">
            {approverStats.length === 0 ? (
              <p className="text-center py-8" style={{ color: 'var(--text-muted)' }}>No approval data available.</p>
            ) : approverStats.map((a: any, i: number) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-xl" style={{ background: 'var(--surface-secondary)' }}>
                <div className="h-10 w-10 rounded-full flex items-center justify-center font-bold text-white shrink-0"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #06b6d4)' }}>
                  {a.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{a.name}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{a.decisionsCount} decisions</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold" style={{ color: getTatColor(a.avgTatHours) }}>{a.avgTatHours}h</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{a.avgTatDays}d avg</p>
                </div>
                <div className="w-32 hidden sm:block">
                  <div className="w-full h-2 rounded-full" style={{ background: 'var(--border)' }}>
                    <div className="h-2 rounded-full transition-all"
                      style={{ width: `${Math.min((a.avgTatHours / 96) * 100, 100)}%`, background: getTatColor(a.avgTatHours) }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'applications' && (
        <div className="modern-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
              <thead>
                <tr style={{ background: 'var(--surface-secondary)' }}>
                  {['Employee', 'Leave Type', 'Applied', 'Decided', 'TAT', 'Approver', 'Status'].map((h) => (
                    <th key={h} className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {applications.map((a: any, i: number) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--surface-hover)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}>
                    <td className="px-5 py-4">
                      <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{(a.employee as any)?.name}</p>
                    </td>
                    <td className="px-5 py-4 text-sm" style={{ color: 'var(--text-secondary)' }}>{(a.leaveType as any)?.name || '—'}</td>
                    <td className="px-5 py-4 text-sm" style={{ color: 'var(--text-secondary)' }}>{formatDate(a.appliedDate)}</td>
                    <td className="px-5 py-4 text-sm" style={{ color: 'var(--text-secondary)' }}>{formatDate(a.decisionDate)}</td>
                    <td className="px-5 py-4">
                      <span className="text-sm font-bold" style={{ color: getTatColor(a.tatHours) }}>
                        {a.tatHours !== null ? `${a.tatHours}h` : '—'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm" style={{ color: 'var(--text-secondary)' }}>{(a.approver as any)?.name || '—'}</td>
                    <td className="px-5 py-4">
                      <span className="text-xs font-bold px-2 py-1 rounded-full capitalize"
                        style={{ background: a.status === 'rejected' ? '#ef444420' : '#10b98120', color: a.status === 'rejected' ? '#ef4444' : '#10b981' }}>
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {applications.length === 0 && <p className="text-center py-10" style={{ color: 'var(--text-muted)' }}>No decisions found.</p>}
          </div>
        </div>
      )}

      {tab === 'pending' && (
        <div className="modern-card rounded-2xl overflow-hidden">
          <div className="px-6 py-5 border-b" style={{ background: 'var(--surface-secondary)', borderColor: 'var(--border)' }}>
            <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Applications Pending &gt; 3 Days</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
              <thead>
                <tr style={{ background: 'var(--surface-secondary)' }}>
                  {['Employee', 'Leave Type', 'Applied Date', 'Pending Days', 'Status'].map((h) => (
                    <th key={h} className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {longPending.map((a: any, i: number) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--surface-hover)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}>
                    <td className="px-5 py-4">
                      <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{(a.employee as any)?.name}</p>
                    </td>
                    <td className="px-5 py-4 text-sm" style={{ color: 'var(--text-secondary)' }}>{(a.leaveType as any)?.name || '—'}</td>
                    <td className="px-5 py-4 text-sm" style={{ color: 'var(--text-secondary)' }}>{formatDate(a.appliedDate)}</td>
                    <td className="px-5 py-4">
                      <span className="text-lg font-bold" style={{ color: '#ef4444' }}>{a.pendingDays}d</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs font-bold px-2 py-1 rounded-full capitalize"
                        style={{ background: '#f59e0b20', color: '#f59e0b' }}>
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {longPending.length === 0 && <p className="text-center py-10" style={{ color: 'var(--text-muted)' }}>No long-pending applications. ✅</p>}
          </div>
        </div>
      )}
    </div>
  );
}
