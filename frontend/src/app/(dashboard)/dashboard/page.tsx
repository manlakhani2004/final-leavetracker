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
      {/* Hero Welcome Card */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-indigo-600 p-10 md:p-14 text-white shadow-2xl shadow-indigo-200">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-4">
            <Badge variant="approved" className="bg-white/20 text-white border-white/30 backdrop-blur-md px-4 py-1.5 rounded-2xl">
              System Dashboard • Active
            </Badge>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
              Welcome Back,<br />
              <span className="text-indigo-200">{user?.name}! 👋</span>
            </h1>
            <p className="text-lg font-bold text-indigo-100/80 uppercase tracking-widest max-w-xl">
              {organization?.name} • Management Hub
            </p>
          </div>
          
          <div className="hidden lg:flex items-center gap-4 bg-white/10 backdrop-blur-xl p-8 rounded-[2rem] border border-white/20 shadow-xl">
             <CalendarDays className="text-white/40" size={40} />
             <div>
               <p className="text-xs font-black uppercase tracking-[0.2em] text-white/50 mb-1">Current Date</p>
               <p className="text-2xl font-black whitespace-nowrap">
                 {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
               </p>
             </div>
          </div>
        </div>
      </div>

      {/* Admin Central View */}
      {user?.role === 'org_admin' && (
        <div className="space-y-10">
          <div className="flex items-center justify-between border-b border-slate-100 pb-6">
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
              <ShieldCheck className="text-indigo-600" size={32} />
              Organization Overview
            </h2>
            <Link href="/users" className="group flex items-center gap-2 text-sm font-black text-indigo-600 hover:text-indigo-700 uppercase tracking-widest transition-colors">
              Manage Workforce <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard icon={<Users size={28} />} title="Active Workforce" value={orgStats?.totalEmployees || 0} subtitle="Across all sections" color="indigo" />
            <StatCard icon={<Clock size={28} />} title="Pending Review" value={orgStats?.pendingApprovals || 0} subtitle="Leaves awaiting action" color="rose" />
            <StatCard icon={<CheckCircle2 size={28} />} title="Away Today" value={orgStats?.onLeaveToday || 0} subtitle="Members on leave" color="amber" />
            <StatCard icon={<Layers size={28} />} title="Specializations" value={orgStats?.leaveTypes || 0} subtitle="Active leave policies" color="emerald" />
          </div>

          {/* Graphical Analytics Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Monthly Trends Chart */}
            <div className="modern-card p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                    <TrendingUp className="text-indigo-600" size={24} />
                    Monthly Application Trends
                  </h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Application velocity over 6 months</p>
                </div>
              </div>
              
              <div className="h-[300px] w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData?.monthlyTrend || []}>
                    <defs>
                      <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorApproved" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
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
                  <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                    <PieChartIcon className="text-purple-600" size={24} />
                    Workforce Distribution
                  </h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Headcount by department</p>
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
             <QuickActionCard icon="✅" title="Process Stack" description={`${orgStats?.pendingApprovals || 0} items waiting`} href="/approvals" badge={orgStats?.pendingApprovals} />
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
              <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                  <BarChart3 className="text-indigo-600" size={32} />
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
              <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                <h2 className="text-2xl font-black text-slate-900">Shortcuts</h2>
              </div>
              <div className="grid grid-cols-1 gap-4">
                 <Link href="/leaves/apply" className="modern-card p-6 bg-gradient-to-r from-emerald-500 to-teal-600 text-white flex items-center justify-between group hover:-translate-y-1 transition-all">
                    <div className="space-y-1">
                      <p className="font-black text-lg">Apply for Leave</p>
                      <p className="text-xs font-bold text-white/70 uppercase tracking-widest">Submit new request</p>
                    </div>
                    <PlaneTakeoff size={32} className="group-hover:translate-x-1 transition-transform" />
                 </Link>
                 <Link href="/leaves" className="modern-card p-6 hover:bg-slate-50 transition-all group flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-black text-lg text-slate-900">Request History</p>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Track your status</p>
                    </div>
                    <ArrowRight size={24} className="text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                 </Link>
              </div>
            </div>
          </div>

          {/* Upcoming & Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="modern-card overflow-hidden">
               <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <h3 className="text-xl font-black text-slate-900">Timeline</h3>
                  <Badge variant="default" className="bg-indigo-600 text-white">Upcoming</Badge>
               </div>
               <div className="p-8">
                  {data?.upcomingLeaves?.length > 0 ? (
                    <div className="space-y-6">
                      {data.upcomingLeaves.map((leave: any) => (
                        <div key={leave._id} className="flex items-center justify-between p-5 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-lg hover:shadow-slate-100 transition-all duration-300 group">
                          <div className="flex items-center gap-5">
                            <div className="h-14 w-14 rounded-2xl bg-white flex items-center justify-center text-2xl shadow-sm group-hover:scale-110 transition-transform">
                               📅
                            </div>
                            <div>
                              <p className="font-black text-slate-900">{leave.leaveType?.name}</p>
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest pt-1">
                                {new Date(leave.fromDate).toLocaleDateString()} – {new Date(leave.toDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <p className="text-2xl font-black text-indigo-600">{leave.totalDays}<span className="text-xs font-bold text-slate-400 uppercase tracking-tighter ml-1">Days</span></p>
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
               <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                  <h3 className="text-xl font-black text-slate-900">Allocation Health</h3>
               </div>
               <div className="p-8 space-y-8">
                  {data?.balances?.byType?.map((balance: any, index: number) => (
                    <div key={index} className="space-y-4">
                       <div className="flex justify-between items-end">
                          <div>
                             <h4 className="font-black text-slate-900">{balance.leaveType?.name}</h4>
                             <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.1em]">{balance.remaining} of {balance.allocated} days left</p>
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
