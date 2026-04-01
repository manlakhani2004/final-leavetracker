'use client';

import React, { useEffect, useState } from 'react';
import { leaveApplicationService, dashboardService } from '@/lib/services';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { StatCard } from '@/components/ui/StatCard';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function LeavesPage() {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });

  useEffect(() => {
    loadData();
  }, [statusFilter, pagination.page]);

  const loadData = async () => {
    try {
      setLoading(true);
      const status = statusFilter === 'all' ? undefined : statusFilter;

      const [leavesData, summaryData] = await Promise.all([
        leaveApplicationService.getMyLeaves(status, pagination.page, pagination.limit),
        dashboardService.getSummary()
      ]);

      setLeaves(leavesData.data || []);
      setSummary(summaryData);
      setPagination(prev => ({
        ...prev,
        total: leavesData.meta?.total || 0,
      }));
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to refresh data');
    } finally {
      setLoading(false);
    }
  };

  const loadLeaves = async () => {
    // Legacy function kept for compatibility if needed, but loadData handles both now
    await loadData();
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this leave application?')) return;

    try {
      await leaveApplicationService.cancelLeave(id);
      toast.success('Leave cancelled successfully!');
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to cancel leave');
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'pending';
      case 'approved': return 'approved';
      case 'rejected': return 'rejected';
      case 'cancelled': return 'cancelled';
      default: return 'default';
    }
  };

  if (loading && !summary) return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="space-y-8 pb-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>My Leaves</h1>
          <p className="mt-1" style={{ color: 'var(--text-muted)' }}>Manage your leave applications and view balances</p>
        </div>
        <Link href="/leaves/apply">
          <Button size="lg" className="shadow-lg hover:scale-105 transition-all">
            Apply for Leave
          </Button>
        </Link>
      </div>

      {/* Balance Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={<span className="text-2xl">📅</span>}
          title="Total Allocated"
          value={summary?.balances?.totalAllocated || 0}
          subtitle="Annual allowance"
          color="indigo"
        />
        <StatCard
          icon={<span className="text-2xl">✈️</span>}
          title="Leaves Taken"
          value={summary?.balances?.totalUsed || 0}
          subtitle="Approved days"
          color="rose"
        />
        <StatCard
          icon={<span className="text-2xl">🎯</span>}
          title="Remaining"
          value={summary?.balances?.totalRemaining || 0}
          subtitle="Available to use"
          color="emerald"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Leave Type Breakdown */}
        <div className="lg:col-span-1 space-y-6">
          <div className="modern-card rounded-2xl overflow-hidden">
            <div className="px-6 py-5 border-b" style={{ background: 'var(--surface-secondary)', borderColor: 'var(--border)' }}>
              <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>Leave Balance Details</h3>
            </div>
            <div className="p-6 space-y-4">
              {summary?.balances?.byType?.map((balance: any, index: number) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{balance.leaveType?.name}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {balance.used} used / {balance.allocated} total
                      </p>
                    </div>
                    <p className="text-sm font-bold" style={{ color: 'var(--primary)' }}>
                      {balance.remaining} remaining
                    </p>
                  </div>
                  <div className="w-full rounded-full h-2" style={{ backgroundColor: 'var(--surface-secondary)' }}>
                    <div
                      className={cn(
                        "h-2 rounded-full transition-all",
                        balance.remaining === 0 ? "bg-red-400" : ""
                      )}
                      style={{ 
                        width: `${Math.min(100, (balance.remaining / balance.allocated) * 100)}%`,
                        backgroundColor: balance.remaining === 0 ? '#f87171' : 'var(--primary)'
                      }}
                    />
                  </div>
                </div>
              ))}
              {!summary?.balances?.byType?.length && (
                <p className="text-sm text-center py-4" style={{ color: 'var(--text-muted)' }}>No balances records found.</p>
              )}
            </div>
          </div>

          <div className="rounded-2xl shadow-lg p-6 text-white" style={{ background: 'linear-gradient(135deg, var(--primary-gradient-from), var(--primary-gradient-to))' }}>
            <h4 className="font-bold mb-2">Need Help?</h4>
            <p className="text-sm opacity-90 mb-4">Check our leave policy or contact HR for any clarifications regarding your balance.</p>
            <Button variant="outline" className="w-full border-white/30 hover:bg-white/10 text-white">
              View Policy
            </Button>
          </div>
        </div>

        {/* Applications History */}
        <div className="lg:col-span-2">
          <div className="modern-card rounded-2xl overflow-hidden">
            <div className="px-6 py-5 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4" style={{ borderColor: 'var(--border)' }}>
              <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Leave History</h3>
              <div className="flex items-center gap-3">
                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Filter:</span>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  options={[
                    { value: 'all', label: 'All Requests' },
                    { value: 'pending', label: 'Pending' },
                    { value: 'approved', label: 'Approved' },
                    { value: 'rejected', label: 'Rejected' },
                    { value: 'cancelled', label: 'Cancelled' },
                  ]}
                  className="w-40"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full" style={{ borderCollapse: 'separate', borderSpacing: '0' }}>
                <thead>
                  <tr style={{ background: 'var(--surface-secondary)' }}>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Type</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Duration</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Days</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Status</th>
                    <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {leaves.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center" style={{ color: 'var(--text-muted)' }}>
                        <div className="text-4xl mb-2">📭</div>
                        <p>No leave applications found</p>
                      </td>
                    </tr>
                  ) : (
                    leaves.map((leave) => (
                      <tr 
                        key={leave._id || leave.id} 
                        className="transition-colors"
                        style={{ 
                          borderBottom: `1px solid var(--border)`,
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--surface-hover)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{leave.leaveTypeId?.name || 'N/A'}</p>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Applied {new Date(leave.createdAt).toLocaleDateString()}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            {new Date(leave.fromDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(leave.toDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span 
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border"
                            style={{ 
                              backgroundColor: 'var(--primary-light)',
                              color: 'var(--primary-text)',
                              borderColor: 'var(--primary-lighter)'
                            }}
                          >
                            {leave.totalDays} days
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={getStatusBadgeVariant(leave.status)}>
                            {leave.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          {leave.status === 'pending' && (
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleCancel(leave._id || leave.id)}
                              className="shadow-sm hover:shadow-md h-8"
                            >
                              Cancel
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.total > pagination.limit && (
              <div className="px-6 py-4 border-t flex items-center justify-between" style={{ background: 'var(--surface-secondary)', borderColor: 'var(--border)' }}>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Showing <span className="font-bold">{leaves.length}</span> of {pagination.total} results
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page === 1}
                    className="h-8 py-0"
                  >
                    Prev
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page * pagination.limit >= pagination.total}
                    className="h-8 py-0"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

