'use client';

import React, { useEffect, useState } from 'react';
import { dashboardService } from '@/lib/services';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/contexts/AuthContext';
import { Building2, Users, Calendar, CheckSquare } from 'lucide-react';

export default function TeamPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  const isAdminView = user?.role === 'org_admin' || user?.role === 'hr_manager';

  useEffect(() => {
    loadTeamSummary();
  }, []);

  const loadTeamSummary = async () => {
    try {
      const summary = await dashboardService.getTeamSummary();
      setData(summary);
    } catch (error) {
      console.error('Failed to load team summary:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {isAdminView ? 'Organization Overview' : 'Team Overview'}
      </h1>

      {/* Team Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 mb-8">
        <StatCard 
          title={isAdminView ? "Organization Size" : "Team Size"} 
          value={data?.teamSize || 0} 
          icon={<Users className="w-6 h-6" />}
          color="blue" 
        />
        <StatCard 
          title="On Leave Today" 
          value={data?.onLeaveToday?.length || 0} 
          icon={<Calendar className="w-6 h-6" />}
          color="yellow" 
        />
        <StatCard 
          title="Pending Approvals" 
          value={data?.pendingApprovals?.length || 0} 
          icon={<CheckSquare className="w-6 h-6" />}
          color="purple" 
        />
      </div>

      {/* Department Head Info */}
      {data?.isDepartmentHead && (
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 mb-8 text-white shadow-lg overflow-hidden relative">
          <div className="absolute right-0 top-0 opacity-10 -translate-y-4 translate-x-4">
            <Building2 size={180} />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur-md p-4 rounded-2xl">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight">Department Head Dashboard</h2>
                <div className="flex flex-wrap gap-2 mt-2">
                  {data.departmentsManaged.map((dept: any) => (
                    <span key={dept.id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-white/20 text-white border border-white/10 backdrop-blur-sm">
                      ● {dept.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-4">
                <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-xl border border-white/10">
                   <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-1">Managed Staff</p>
                   <p className="text-2xl font-bold">{data.teamSize}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-xl border border-white/10">
                   <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-1">Active Requests</p>
                   <p className="text-2xl font-bold">{data.pendingApprovals?.length || 0}</p>
                </div>
            </div>
          </div>
        </div>
      )}

      {/* Team Members on Leave Today */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">On Leave Today</h3>
        </div>
        <div className="p-6">
          {data?.onLeaveToday && data.onLeaveToday.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {data.onLeaveToday.map((member: any, index: number) => (
                <li key={index} className="py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{member.employee?.name || 'N/A'}</p>
                      <p className="text-sm text-gray-500">{member.leaveType?.name || 'N/A'}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="approved">{member.totalDays} days</Badge>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(member.fromDate).toLocaleDateString()} - {new Date(member.toDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-center py-4">No team members on leave today</p>
          )}
        </div>
      </div>

      {/* Pending Approvals */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Pending Approvals</h3>
        </div>
        <div className="p-6">
          {data?.pendingApprovals && data.pendingApprovals.length > 0 ? (
            <div className="space-y-4">
              {data.pendingApprovals.map((approval: any) => (
                <div key={approval._id || approval.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-gray-900">{approval.employee?.name || 'N/A'}</h4>
                      <p className="text-sm text-gray-500">{approval.leaveType?.name || 'N/A'}</p>
                    </div>
                    <Badge variant="pending">Pending</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Dates:</span>{' '}
                      {new Date(approval.fromDate).toLocaleDateString()} - {new Date(approval.toDate).toLocaleDateString()}
                    </div>
                    <div>
                      <span className="font-medium">Days:</span> {approval.totalDays}
                    </div>
                    <div className="col-span-2">
                      <span className="font-medium">Reason:</span> {approval.reason}
                    </div>
                    <div className="col-span-2">
                      <span className="font-medium">Applied:</span> {new Date(approval.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No pending approvals</p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }: { title: string; value: number; icon: React.ReactNode; color: string }) {
  const colorSchemes: Record<string, { bg: string; iconBg: string; text: string }> = {
    blue: { 
      bg: 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100', 
      iconBg: 'bg-blue-600 shadow-blue-200',
      text: 'text-blue-900'
    },
    yellow: { 
      bg: 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-100', 
      iconBg: 'bg-yellow-600 shadow-yellow-200',
      text: 'text-yellow-900'
    },
    purple: { 
      bg: 'bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-100', 
      iconBg: 'bg-purple-600 shadow-purple-200',
      text: 'text-purple-900'
    },
  };

  const scheme = colorSchemes[color] || colorSchemes.blue;

  return (
    <div className={`p-6 rounded-2xl border flex items-center justify-between shadow-sm hover:shadow-md transition-all duration-300 ${scheme.bg}`}>
      <div>
        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">{title}</p>
        <h3 className={`text-3xl font-black ${scheme.text}`}>{value}</h3>
      </div>
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg transform rotate-3 ${scheme.iconBg}`}>
        {icon}
      </div>
    </div>
  );
}
