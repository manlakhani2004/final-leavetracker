'use client';

import React, { useEffect, useState } from 'react';
import { dashboardService } from '@/lib/services';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/Badge';
import { StatCard, QuickActionCard } from '@/components/ui/StatCard';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import {
  Users,
  Clock,
  CheckCircle2,
  CalendarDays,
  ShieldCheck,
  Layers,
  ArrowRight,
  PlaneTakeoff,
  BarChart3,
  CalendarCheck,
  TrendingUp,
  PieChart as PieChartIcon
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';

export default function DashboardPage() {
  const { user, organization } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [orgStats, setOrgStats] = useState<any>(null);
  const [chartData, setChartData] = useState<any>(null);
  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const summary = await dashboardService.getSummary();
      setData(summary);

      if (user?.role === 'org_admin' || user?.role === 'hr_manager') {
        const [orgData, charts] = await Promise.all([
          dashboardService.getOrgStats(),
          dashboardService.getChartData()
        ]);
        setOrgStats(orgData);
        setChartData(charts);
      }
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center">
      <div className="shimmer h-12 w-12 rounded-2xl" />
    </div>
  );

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl p-5 md:p-6 text-white" style={{ background: `linear-gradient(135deg, var(--primary-gradient-from), var(--primary-gradient-to))`, boxShadow: `0 8px 30px -8px var(--primary-shadow)` }}>
        <div className="absolute top-0 right-0 -mr-10 -mt-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute bottom-0 left-0 -ml-8 -mb-8 h-28 w-28 rounded-full bg-white/5 blur-2xl" />

        <div className="relative z-10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm text-xl">
              👋
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight leading-snug">
                Welcome back, <span className="opacity-90">{user?.name}</span>
              </h1>
              <p className="text-xs font-medium text-white/60 mt-0.5">
                {organization?.name} • Dashboard
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3 bg-white/10 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-white/15">
            <CalendarDays className="text-white/50" size={18} />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-white/40">Today</p>
              <p className="text-sm font-bold whitespace-nowrap">
                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Central View */}
      {(user?.role === 'org_admin' || user?.role === 'hr_manager') && (
        <div className="space-y-10">
          <div className="flex items-center justify-between pb-6" style={{ borderBottom: `1px solid var(--border-light)` }}>
            <h2 className="text-2xl font-black flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
              <ShieldCheck size={32} style={{ color: 'var(--primary)' }} />
              {user?.role === 'org_admin' ? 'Organization Overview' : 'HR Dashboard'}
            </h2>
            <Link href="/users" className="group flex items-center gap-2 text-sm font-black uppercase tracking-widest transition-colors" style={{ color: 'var(--primary-text)' }}>
              Manage Workforce <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard icon={<Users size={28} />} title="Active Workforce" value={orgStats?.totalEmployees || 0} subtitle="Across all sections" color="indigo" />
            <StatCard icon={<Clock size={28} />} title="Pending Review" value={orgStats?.leaveStats.pending || 0} subtitle="Leaves awaiting action" color="rose" />
            <StatCard icon={<CheckCircle2 size={28} />} title="Away Today" value={orgStats?.onLeaveToday || 0} subtitle="Members on leave" color="amber" />
            <StatCard icon={<Layers size={28} />} title="Specializations" value={orgStats?.leaveTypes || 0} subtitle="Active leave policies" color="emerald" />
          </div>

          {/* Graphical Analytics Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Monthly Trends Chart */}
            <div className="modern-card p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                    <TrendingUp size={24} style={{ color: 'var(--primary)' }} />
                    Monthly Application Trends
                  </h3>
                  <p className="text-xs font-bold uppercase tracking-widest mt-1" style={{ color: 'var(--text-muted)' }}>Application velocity over 6 months</p>
                </div>
              </div>

              <div className="h-[300px] w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData?.monthlyTrend || []}>
                    <defs>
                      <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorApproved" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                    />
                    <Tooltip
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', fontWeight: 700 }}
                    />
                    <Area type="monotone" dataKey="Total" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                    <Area type="monotone" dataKey="Approved" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorApproved)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Department Breakdown Chart */}
            <div className="modern-card p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                    <PieChartIcon size={24} style={{ color: 'var(--primary)' }} />
                    Workforce Distribution
                  </h3>
                  <p className="text-xs font-bold uppercase tracking-widest mt-1" style={{ color: 'var(--text-muted)' }}>Headcount by department</p>
                </div>
              </div>

              <div className="h-[300px] w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData?.departmentBreakdown || []} layout="vertical" margin={{ left: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" axisLine={false} tickLine={false} hide />
                    <YAxis
                      dataKey="name"
                      type="category"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64748b', fontSize: 13, fontWeight: 700 }}
                      width={100}
                    />
                    <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px rgba(0,0,0,0.05)' }} />
                    <Bar dataKey="Members" radius={[0, 8, 8, 0]} barSize={24}>
                      {(chartData?.departmentBreakdown || []).map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#6366f1' : '#a855f7'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <QuickActionCard icon="🏢" title="Workforce Control" description="Manage access & roles" href="/users" />
            <QuickActionCard icon="📋" title="Leave Policies" description="Edit entitlements" href="/leave-types" />
            <QuickActionCard icon="✅" title="Process Stack" description={`${orgStats?.leaveStats.pending || 0} items waiting`} href="/approvals" badge={orgStats?.leaveStats.pending} />
            <QuickActionCard icon="📅" title="Event Calendar" description="Company holidays" href="/holidays" />
          </div>
        </div>
      )}

      {/* Employee / General Portal */}
      {(user?.role === 'employee' || user?.role === 'manager') && (
        <div className="space-y-12">
          {/* Personal Balance Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between pb-6" style={{ borderBottom: `1px solid var(--border-light)` }}>
                <h2 className="text-2xl font-black flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
                  <BarChart3 size={32} style={{ color: 'var(--primary)' }} />
                  Leave Quota Statistics
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard icon={<PlaneTakeoff size={28} />} title="Total Allocated" value={data?.balances?.totalAllocated || 0} color="blue" />
                <StatCard icon={<CalendarCheck size={28} />} title="Days Utilized" value={data?.balances?.totalUsed || 0} color="rose" />
                <StatCard icon={<CheckCircle2 size={28} />} title="Available Pool" value={data?.balances?.totalRemaining || 0} color="emerald" />
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between pb-6" style={{ borderBottom: `1px solid var(--border-light)` }}>
                <h2 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>Shortcuts</h2>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <Link
                  href="/leaves/apply"
                  className="modern-card p-6 text-white flex items-center justify-between group hover:-translate-y-1 transition-all"
                  style={{ background: 'linear-gradient(to right, var(--primary-gradient-from), var(--primary-gradient-to))' }}
                >
                  <div className="space-y-1">
                    <p className="font-black text-lg">Apply for Leave</p>
                    <p className="text-xs font-bold text-white/70 uppercase tracking-widest">Submit new request</p>
                  </div>
                  <PlaneTakeoff size={32} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/leaves" className="modern-card p-6 transition-all group flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-black text-lg" style={{ color: 'var(--text-primary)' }}>Request History</p>
                    <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Track your status</p>
                  </div>
                  <ArrowRight size={24} className="text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                </Link>
              </div>
            </div>
          </div>

          {/* Upcoming & Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="modern-card overflow-hidden">
              <div className="p-8 flex items-center justify-between" style={{ borderBottom: `1px solid var(--border-light)`, background: 'var(--surface-hover)' }}>
                <h3 className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>Timeline</h3>
                <Badge variant="default" className="text-white" style={{ background: 'var(--primary)' }}>Upcoming</Badge>
              </div>
              <div className="p-8">
                {data?.upcomingLeaves?.length > 0 ? (
                  <div className="space-y-6">
                    {data.upcomingLeaves.map((leave: any) => (
                      <div key={leave._id} className="flex items-center justify-between p-5 rounded-3xl transition-all duration-300 group" style={{ background: 'var(--surface-secondary)', border: `1px solid var(--border-light)` }}>
                        <div className="flex items-center gap-5">
                          <div className="h-14 w-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm group-hover:scale-110 transition-transform" style={{ background: 'var(--surface)' }}>
                            📅
                          </div>
                          <div>
                            <p className="font-black" style={{ color: 'var(--text-primary)' }}>{leave.leaveType?.name}</p>
                            <p className="text-xs font-bold uppercase tracking-widest pt-1" style={{ color: 'var(--text-muted)' }}>
                              {new Date(leave.fromDate).toLocaleDateString()} – {new Date(leave.toDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <p className="text-2xl font-black" style={{ color: 'var(--primary-text)' }}>{leave.totalDays}<span className="text-xs font-bold uppercase tracking-tighter ml-1" style={{ color: 'var(--text-muted)' }}>Days</span></p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-16 text-center space-y-4">
                    <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-50 text-slate-200">
                      <PlaneTakeoff size={40} />
                    </div>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No active travel scheduled</p>
                  </div>
                )}
              </div>
            </div>

            <div className="modern-card overflow-hidden">
              <div className="p-8" style={{ borderBottom: `1px solid var(--border-light)`, background: 'var(--surface-hover)' }}>
                <h3 className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>Allocation Health</h3>
              </div>
              <div className="p-8 space-y-8">
                {data?.balances?.byType?.map((balance: any, index: number) => (
                  <div key={index} className="space-y-4">
                    <div className="flex justify-between items-end">
                      <div>
                        <h4 className="font-black" style={{ color: 'var(--text-primary)' }}>{balance.leaveType?.name}</h4>
                        <p className="text-xs font-bold uppercase tracking-[0.1em]" style={{ color: 'var(--text-muted)' }}>{balance.remaining} of {balance.allocated} days left</p>
                      </div>
                      <div className={cn(
                        "px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest",
                        balance.remaining < 5 ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"
                      )}>
                        {Math.round((balance.remaining / balance.allocated) * 100)}% Available
                      </div>
                    </div>
                    <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-50">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-1000",
                          balance.remaining < 5 ? "bg-gradient-to-r from-rose-500 to-red-600" : "bg-gradient-to-r from-indigo-500 to-purple-600"
                        )}
                        style={{ width: `${(balance.remaining / balance.allocated) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
