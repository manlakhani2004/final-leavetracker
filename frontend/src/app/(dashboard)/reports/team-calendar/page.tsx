'use client';

import React, { useEffect, useState } from 'react';
import { reportService } from '@/lib/services';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { ArrowLeft, Calendar, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  approved: '#10b981',
  hr_approved: '#10b981',
  pending: '#f59e0b',
  manager_approved: '#06b6d4',
};

const MEMBER_COLORS = [
  '#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444',
  '#ec4899', '#8b5cf6', '#14b8a6', '#f97316', '#0ea5e9',
];

function addMonths(date: Date, months: number) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

function getDaysInRange(startDate: Date, endDate: Date) {
  const days: Date[] = [];
  const cursor = new Date(startDate);
  cursor.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);
  while (cursor <= end) {
    days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

export default function TeamCalendarReport() {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [rangeStart, setRangeStart] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const rangeEnd = new Date(rangeStart.getFullYear(), rangeStart.getMonth() + 2, 0);

  useEffect(() => { loadReport(); }, [rangeStart]);

  const loadReport = async () => {
    try {
      setLoading(true);
      const data = await reportService.getTeamCalendarReport({
        startDate: rangeStart.toISOString().split('T')[0],
        endDate: rangeEnd.toISOString().split('T')[0],
      });
      setReport(data);
    } catch {
      toast.error('Failed to load team calendar');
    } finally {
      setLoading(false);
    }
  };

  const prevRange = () => setRangeStart((d) => addMonths(d, -2));
  const nextRange = () => setRangeStart((d) => addMonths(d, 2));

  if (loading && !report) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  const memberEvents: any[] = report?.memberEvents || [];
  const overlaps: any[] = report?.overlaps || [];
  const summary = report?.summary || {};

  // Build calendar days for display — chunk into months
  const month1Start = new Date(rangeStart.getFullYear(), rangeStart.getMonth(), 1);
  const month1End = new Date(rangeStart.getFullYear(), rangeStart.getMonth() + 1, 0);
  const month2Start = new Date(rangeStart.getFullYear(), rangeStart.getMonth() + 1, 1);
  const month2End = new Date(rangeStart.getFullYear(), rangeStart.getMonth() + 2, 0);

  const months = [
    { label: month1Start.toLocaleString('default', { month: 'long', year: 'numeric' }), days: getDaysInRange(month1Start, month1End) },
    { label: month2Start.toLocaleString('default', { month: 'long', year: 'numeric' }), days: getDaysInRange(month2Start, month2End) },
  ];

  const isOnLeave = (member: any, day: Date, status?: string[]) => {
    return member.leaves.some((l: any) => {
      const from = new Date(l.fromDate);
      const to = new Date(l.toDate);
      from.setHours(0, 0, 0, 0);
      to.setHours(23, 59, 59, 999);
      const statuses = status || ['approved', 'hr_approved', 'pending', 'manager_approved'];
      return day >= from && day <= to && statuses.includes(l.status);
    });
  };

  const getLeaveForDay = (member: any, day: Date) => {
    return member.leaves.find((l: any) => {
      const from = new Date(l.fromDate);
      const to = new Date(l.toDate);
      from.setHours(0, 0, 0, 0);
      to.setHours(23, 59, 59, 999);
      return day >= from && day <= to;
    });
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const overlapDates = new Set(overlaps.map((o) => o.date));

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
                style={{ background: 'linear-gradient(135deg, #10b981, #06b6d4)' }}>
                <Calendar size={20} className="text-white" />
              </div>
              <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Team Availability
              </h1>
            </div>
            <p className="mt-1 ml-[52px]" style={{ color: 'var(--text-muted)' }}>
              Gantt-style team leave calendar — spot coverage gaps at a glance
            </p>
          </div>
        </div>

        {/* Range Navigator */}
        <div className="flex items-center gap-2">
          <button onClick={prevRange} className="h-10 w-10 rounded-xl flex items-center justify-center transition-all hover:scale-105"
            style={{ background: 'var(--surface-secondary)', color: 'var(--text-secondary)' }}>
            <ChevronLeft size={18} />
          </button>
          <div className="px-4 py-2 rounded-xl text-sm font-semibold" style={{ background: 'var(--surface-secondary)', color: 'var(--text-primary)' }}>
            {months[0].label} — {months[1].label}
          </div>
          <button onClick={nextRange} className="h-10 w-10 rounded-xl flex items-center justify-center transition-all hover:scale-105"
            style={{ background: 'var(--surface-secondary)', color: 'var(--text-secondary)' }}>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {[
          { label: 'Team Size', value: report?.teamSize || 0, icon: '👥', color: '#6366f1' },
          { label: 'Total Leave Events', value: summary.totalLeaveEvents || 0, icon: '📋', color: '#06b6d4' },
          { label: 'Approved', value: summary.approvedEvents || 0, icon: '✅', color: '#10b981' },
          { label: 'Overlap Days', value: summary.overlapDays || 0, icon: '⚠️', color: '#ef4444' },
        ].map((card, i) => (
          <div key={i} className="modern-card rounded-2xl p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl flex items-center justify-center shrink-0 text-2xl" style={{ background: `${card.color}20` }}>
              {card.icon}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{card.label}</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="modern-card rounded-2xl px-6 py-4 flex flex-wrap items-center gap-6">
        <p className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Legend:</p>
        {[
          { label: 'Approved', color: '#10b981' },
          { label: 'Pending', color: '#f59e0b' },
          { label: 'Today', color: '#6366f1', isOutline: true },
          { label: 'Overlap', color: '#ef444440' },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
            <div className="h-3 w-8 rounded-sm" style={{
              background: l.isOutline ? 'transparent' : l.color,
              border: l.isOutline ? `2px solid ${l.color}` : 'none',
            }} />
            {l.label}
          </div>
        ))}
      </div>

      {/* Gantt Calendar — per month */}
      {months.map((month, mi) => (
        <div key={mi} className="modern-card rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b flex items-center gap-2"
            style={{ background: 'var(--surface-secondary)', borderColor: 'var(--border)' }}>
            <Calendar size={16} style={{ color: 'var(--primary)' }} />
            <h3 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>{month.label}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-max" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
              <thead>
                <tr style={{ background: 'var(--surface-secondary)' }}>
                  <th className="sticky left-0 px-4 py-3 text-left text-xs font-bold uppercase tracking-wider z-10"
                    style={{ color: 'var(--text-muted)', background: 'var(--surface-secondary)', minWidth: '160px', borderRight: '1px solid var(--border)' }}>
                    Team Member
                  </th>
                  {month.days.map((day) => {
                    const isToday = day.getTime() === today.getTime();
                    const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                    const dateStr = day.toISOString().split('T')[0];
                    const isOverlap = overlapDates.has(dateStr);
                    return (
                      <th key={day.toISOString()}
                        className="py-3 text-center text-xs font-semibold"
                        style={{
                          minWidth: '36px',
                          maxWidth: '36px',
                          color: isToday ? 'var(--primary)' : isWeekend ? 'var(--text-muted)' : 'var(--text-secondary)',
                          background: isOverlap ? '#ef444415' : isWeekend ? 'var(--surface-secondary)' : 'var(--surface-secondary)',
                          borderBottom: isToday ? '2px solid var(--primary)' : undefined,
                        }}>
                        <div>{day.getDate()}</div>
                        <div className="text-[9px]">{['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'][day.getDay()]}</div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {memberEvents.map((me: any, mIdx: number) => {
                  const memberColor = MEMBER_COLORS[mIdx % MEMBER_COLORS.length];
                  return (
                    <tr key={me.member.id} style={{ borderBottom: '1px solid var(--border)' }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--surface-hover)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}>
                      <td className="sticky left-0 px-4 py-2 z-10"
                        style={{ background: 'var(--surface-primary)', borderRight: '1px solid var(--border)', minWidth: '160px' }}>
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                            style={{ background: memberColor }}>
                            {me.member.name[0]}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold truncate" style={{ color: 'var(--text-primary)' }}>{me.member.name}</p>
                            {me.member.designation && (
                              <p className="text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>{me.member.designation}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      {month.days.map((day) => {
                        const leave = getLeaveForDay(me, day);
                        const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                        const dateStr = day.toISOString().split('T')[0];
                        const isOverlap = overlapDates.has(dateStr);
                        const isToday = day.getTime() === today.getTime();
                        return (
                          <td key={day.toISOString()}
                            className="py-2 text-center relative"
                            style={{
                              minWidth: '36px',
                              background: isOverlap && leave ? '#ef444425' : isWeekend ? 'var(--surface-secondary)' : undefined,
                              border: isToday ? '1px solid var(--primary)' : undefined,
                            }}>
                            {leave ? (
                              <div
                                className="mx-0.5 h-6 rounded-sm flex items-center justify-center"
                                style={{
                                  background: STATUS_COLORS[leave.status] || '#6366f1',
                                  opacity: leave.status === 'pending' || leave.status === 'manager_approved' ? 0.6 : 1,
                                }}
                                title={`${me.member.name}: ${leave.leaveType?.name || 'Leave'} (${leave.status})`}
                              />
                            ) : null}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {memberEvents.length === 0 && (
              <p className="text-center py-10" style={{ color: 'var(--text-muted)' }}>No team members found.</p>
            )}
          </div>
        </div>
      ))}

      {/* Overlap Alerts */}
      {overlaps.length > 0 && (
        <div className="modern-card rounded-2xl overflow-hidden">
          <div className="px-6 py-5 border-b flex items-center gap-2"
            style={{ background: '#ef444410', borderColor: 'var(--border)' }}>
            <AlertTriangle size={18} style={{ color: '#ef4444' }} />
            <h3 className="font-bold text-lg" style={{ color: '#ef4444' }}>Coverage Gaps — Multiple Members on Leave</h3>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {overlaps.slice(0, 20).map((o, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-xl" style={{ background: 'var(--surface-secondary)' }}>
                  <div className="text-sm font-bold" style={{ color: '#ef4444', minWidth: '100px' }}>
                    {new Date(o.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                  </div>
                  <div className="flex-1">
                    <span className="text-xs px-2 py-0.5 rounded-full font-bold mr-2" style={{ background: '#ef444420', color: '#ef4444' }}>
                      {o.count} on leave
                    </span>
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{o.members.join(', ')}</span>
                  </div>
                </div>
              ))}
              {overlaps.length > 20 && (
                <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>+ {overlaps.length - 20} more overlap days</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
