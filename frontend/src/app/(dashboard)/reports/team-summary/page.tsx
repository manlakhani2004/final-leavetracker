'use client';

import React, { useEffect, useState } from 'react';
import { reportService } from '@/lib/services';
import { Select } from '@/components/ui/Select';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { ArrowLeft, Users, ChevronDown, ChevronUp } from 'lucide-react';

export default function TeamSummaryReport() {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());
  const [expandedMember, setExpandedMember] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'daysTaken' | 'remaining'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

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
      const data = await reportService.getTeamSummaryReport({ year });
      setReport(data);
    } catch (error) {
      console.error('Failed to load report:', error);
      toast.error('Failed to load team summary');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: 'name' | 'daysTaken' | 'remaining') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const sortedMembers = [...(report?.members || [])].sort((a, b) => {
    const direction = sortOrder === 'asc' ? 1 : -1;
    if (sortBy === 'name') return direction * (a.member.name || '').localeCompare(b.member.name || '');
    if (sortBy === 'daysTaken') return direction * (a.totalDaysTaken - b.totalDaysTaken);
    if (sortBy === 'remaining') return direction * (a.totalRemaining - b.totalRemaining);
    return 0;
  });

  if (loading && !report) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  const teamStats = report?.teamStats || {};

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
                style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
              >
                <Users size={20} className="text-white" />
              </div>
              <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Team Leave Summary
              </h1>
            </div>
            <p className="mt-1 ml-[52px]" style={{ color: 'var(--text-muted)' }}>
              Overview of team members&apos; leave usage for {year}
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

      {/* Team Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        <StatCard
          icon={<span className="text-2xl">👥</span>}
          title="Team Size"
          value={teamStats.teamSize || 0}
          subtitle="Members"
          color="indigo"
        />
        <StatCard
          icon={<span className="text-2xl">📋</span>}
          title="Applications"
          value={teamStats.totalApplications || 0}
          subtitle="Total requests"
          color="blue"
        />
        <StatCard
          icon={<span className="text-2xl">✅</span>}
          title="Approved"
          value={teamStats.totalApproved || 0}
          subtitle="Accepted"
          color="emerald"
        />
        <StatCard
          icon={<span className="text-2xl">⏳</span>}
          title="Pending"
          value={teamStats.totalPending || 0}
          subtitle="Awaiting action"
          color="amber"
        />
        <StatCard
          icon={<span className="text-2xl">📊</span>}
          title="Avg / Member"
          value={teamStats.avgDaysPerMember || 0}
          subtitle="Days taken"
          color="rose"
        />
      </div>

      {/* On Leave Today */}
      {report?.onLeaveToday?.length > 0 && (
        <div
          className="rounded-2xl p-5"
          style={{
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.06), rgba(245, 158, 11, 0.06))',
            border: '1px solid rgba(239, 68, 68, 0.15)',
          }}
        >
          <h3 className="font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <span className="text-lg">🏖️</span> On Leave Today ({report.onLeaveToday.length})
          </h3>
          <div className="flex flex-wrap gap-3">
            {report.onLeaveToday.map((leave: any, index: number) => (
              <div
                key={index}
                className="flex items-center gap-3 rounded-xl px-4 py-2.5"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
              >
                <div
                  className="h-8 w-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                  style={{ background: 'linear-gradient(135deg, #ef4444, #f97316)' }}
                >
                  {leave.employee?.name?.charAt(0) || '?'}
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                    {leave.employee?.name}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {leave.leaveType?.name} • {leave.totalDays}d
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Team Members Table */}
      <div className="modern-card rounded-2xl overflow-hidden">
        <div
          className="px-6 py-5 border-b flex items-center justify-between"
          style={{ background: 'var(--surface-secondary)', borderColor: 'var(--border)' }}
        >
          <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
            Team Members ({sortedMembers.length})
          </h3>
          <Select
            value={sortBy}
            onChange={(e) => handleSort(e.target.value as any)}
            options={[
              { value: 'name', label: 'Sort by Name' },
              { value: 'daysTaken', label: 'Sort by Days Taken' },
              { value: 'remaining', label: 'Sort by Remaining' },
            ]}
            className="w-44"
          />
        </div>

        <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
          {sortedMembers.length === 0 && (
            <div className="px-6 py-12 text-center" style={{ color: 'var(--text-muted)' }}>
              <div className="text-4xl mb-2">👥</div>
              <p>No team members found</p>
            </div>
          )}
          {sortedMembers.map((item: any) => {
            const isExpanded = expandedMember === item.member.id;
            const utilizationPercent = item.totalAllocated > 0
              ? Math.round((item.totalDaysTaken / item.totalAllocated) * 100)
              : 0;

            return (
              <div key={item.member.id}>
                {/* Member Row */}
                <div
                  className="px-6 py-4 flex items-center gap-4 cursor-pointer transition-colors"
                  onClick={() => setExpandedMember(isExpanded ? null : item.member.id)}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--surface-hover)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  {/* Avatar */}
                  <div
                    className="h-10 w-10 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0"
                    style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
                  >
                    {item.member.name?.charAt(0) || '?'}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                      {item.member.name}
                    </p>
                    <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                      {item.member.designation || 'Employee'}
                      {item.member.department?.name ? ` • ${item.member.department.name}` : ''}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="hidden sm:flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                        {item.totalDaysTaken}
                      </p>
                      <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                        Days Used
                      </p>
                    </div>
                    <div className="text-center">
                      <p
                        className="text-lg font-bold"
                        style={{ color: item.totalRemaining > 0 ? '#10b981' : '#ef4444' }}
                      >
                        {item.totalRemaining}
                      </p>
                      <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                        Remaining
                      </p>
                    </div>
                    <div className="text-center">
                      {item.pendingCount > 0 ? (
                        <Badge variant="pending">{item.pendingCount} pending</Badge>
                      ) : (
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>No pending</span>
                      )}
                    </div>
                    {/* Utilization bar */}
                    <div className="w-20">
                      <div className="w-full rounded-full h-2" style={{ backgroundColor: 'var(--surface-secondary)' }}>
                        <div
                          className="h-2 rounded-full transition-all"
                          style={{
                            width: `${Math.min(100, utilizationPercent)}%`,
                            backgroundColor:
                              utilizationPercent >= 90 ? '#ef4444'
                                : utilizationPercent >= 60 ? '#f59e0b'
                                : '#10b981',
                          }}
                        />
                      </div>
                      <p className="text-[10px] text-center mt-0.5 font-bold" style={{ color: 'var(--text-muted)' }}>
                        {utilizationPercent}%
                      </p>
                    </div>
                  </div>

                  {/* Expand icon */}
                  <div style={{ color: 'var(--text-muted)' }}>
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div
                    className="px-6 pb-4"
                    style={{ background: 'var(--surface-secondary)' }}
                  >
                    <div className="pt-3 pb-2">
                      <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
                        Balance by Leave Type
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {item.balances?.map((balance: any, idx: number) => (
                          <div
                            key={idx}
                            className="rounded-xl p-3"
                            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                          >
                            <p className="text-sm font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                              {balance.leaveType?.name || 'Unknown'}
                            </p>
                            <div className="flex items-center justify-between text-xs mb-2">
                              <span style={{ color: 'var(--text-muted)' }}>
                                {balance.used} / {balance.allocated} used
                              </span>
                              <span
                                className="font-bold"
                                style={{ color: balance.remaining > 0 ? '#10b981' : '#ef4444' }}
                              >
                                {balance.remaining} left
                              </span>
                            </div>
                            <div className="w-full rounded-full h-1.5" style={{ backgroundColor: 'var(--surface-secondary)' }}>
                              <div
                                className="h-1.5 rounded-full transition-all"
                                style={{
                                  width: `${balance.allocated > 0 ? Math.min(100, (balance.used / balance.allocated) * 100) : 0}%`,
                                  backgroundColor: balance.remaining > 0 ? '#6366f1' : '#ef4444',
                                }}
                              />
                            </div>
                          </div>
                        ))}
                        {(!item.balances || item.balances.length === 0) && (
                          <p className="text-xs col-span-full" style={{ color: 'var(--text-muted)' }}>
                            No balance records found
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Mobile stats (visible only on small screens) */}
                    <div className="grid grid-cols-3 gap-3 sm:hidden mt-3">
                      <div className="text-center rounded-lg p-2" style={{ background: 'var(--surface)' }}>
                        <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{item.totalDaysTaken}</p>
                        <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Used</p>
                      </div>
                      <div className="text-center rounded-lg p-2" style={{ background: 'var(--surface)' }}>
                        <p className="text-lg font-bold" style={{ color: '#10b981' }}>{item.totalRemaining}</p>
                        <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Remaining</p>
                      </div>
                      <div className="text-center rounded-lg p-2" style={{ background: 'var(--surface)' }}>
                        <p className="text-lg font-bold" style={{ color: '#f59e0b' }}>{item.pendingCount}</p>
                        <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Pending</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
