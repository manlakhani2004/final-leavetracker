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
          <h1 className="text-3xl font-bold text-gray-900">My Leaves</h1>
          <p className="text-gray-500 mt-1">Manage your leave applications and view balances</p>
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
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-bold text-gray-900">Leave Balance Details</h3>
            </div>
            <div className="p-6 space-y-4">
              {summary?.balances?.byType?.map((balance: any, index: number) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="font-semibold text-gray-900">{balance.leaveType?.name}</p>
                      <p className="text-xs text-gray-500">
                        {balance.used} used / {balance.allocated} total
                      </p>
                    </div>
                    <p className="text-sm font-bold text-indigo-600">
                      {balance.remaining} remaining
                    </p>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div 
                      className={cn(
                        "h-2 rounded-full transition-all",
                        balance.remaining === 0 ? "bg-red-400" : "bg-indigo-500"
                      )}
                      style={{ width: `${Math.min(100, (balance.remaining / balance.allocated) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
              {!summary?.balances?.byType?.length && (
                <p className="text-sm text-gray-500 text-center py-4">No balances records found.</p>
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
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="font-bold text-gray-900 text-lg">Leave History</h3>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">Filter:</span>
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
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Duration</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Days</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {leaves.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                        <div className="text-4xl mb-2">📭</div>
                        <p>No leave applications found</p>
                      </td>
                    </tr>
                  ) : (
                    leaves.map((leave) => (
                      <tr key={leave._id || leave.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-sm font-bold text-gray-900">{leave.leaveTypeId?.name || 'N/A'}</p>
                          <p className="text-xs text-gray-500 mt-0.5">Applied {new Date(leave.createdAt).toLocaleDateString()}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-sm text-gray-700">
                            {new Date(leave.fromDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(leave.toDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
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
              <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                <p className="text-xs text-gray-500">
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

