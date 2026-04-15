'use client';

import React, { useEffect, useState } from 'react';
import { leaveApplicationService, aiService } from '@/lib/services';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import ApproveModal from '@/components/ui/ApproveModal';
import toast from 'react-hot-toast';

export default function ApprovalsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<string | null>(null);
  const [applicationToApprove, setApplicationToApprove] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [aiInsights, setAiInsights] = useState<Record<string, { loading: boolean, data?: any, error?: string }>>({});

  const handleAskAI = async (id: string) => {
    setAiInsights(prev => ({ ...prev, [id]: { loading: true, error: undefined } }));
    try {
      const data = await aiService.recommendApproval(id);
      setAiInsights(prev => ({ ...prev, [id]: { loading: false, data } }));
      toast.success('AI recommendation ready');
    } catch (error: any) {
      setAiInsights(prev => ({ 
        ...prev, 
        [id]: { loading: false, error: error.response?.data?.message || 'Failed to get AI recommendation' } 
      }));
      toast.error(error.response?.data?.message || 'Failed to get AI recommendation');
    }
  };

  useEffect(() => {
    loadApplications();
  }, [activeTab]);

  const loadApplications = async () => {
    try {
      const status = activeTab === 'pending' ? 'pending' : undefined;
      const data = await leaveApplicationService.getMyLeaves(status, 1, 100);
      setApplications(data.data || []);
    } catch (error) {
      console.error('Failed to load applications:', error);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = (application: any) => {
    setApplicationToApprove(application);
    setApproveModalOpen(true);
  };

  const confirmApprove = async () => {
    if (!applicationToApprove) return;
    
    setActionLoading(true);
    try {
      await leaveApplicationService.approveLeave(applicationToApprove._id || applicationToApprove.id);
      toast.success('Leave request accepted successfully!');
      loadApplications();
      setApproveModalOpen(false);
      setApplicationToApprove(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to accept leave request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectClick = (id: string) => {
    setSelectedApplication(id);
    setRejectionReason('');
    setRejectModalOpen(true);
  };

  const handleReject = async () => {
    if (!selectedApplication) return;

    setActionLoading(true);
    try {
      await leaveApplicationService.rejectLeave(selectedApplication, rejectionReason || 'No reason provided');
      toast.success('Leave rejected');
      setRejectModalOpen(false);
      setSelectedApplication(null);
      loadApplications();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reject leave');
    } finally {
      setActionLoading(false);
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

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Leave Approvals</h1>

      {/* Tabs */}
      <div className="mb-6" style={{ borderBottom: `1px solid var(--border)` }}>
        <nav className="-mb-px flex space-x-8">
          {['pending', 'approved', 'rejected'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm capitalize transition-all
                ${activeTab === tab
                  ? ''
                  : 'border-transparent'
                }
              `}
              style={{
                borderBottomColor: activeTab === tab ? 'var(--primary)' : 'transparent',
                color: activeTab === tab ? 'var(--primary)' : 'var(--text-muted)'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== tab) {
                  e.currentTarget.style.color = 'var(--text-secondary)';
                  e.currentTarget.style.borderColor = 'var(--border)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== tab) {
                  e.currentTarget.style.color = 'var(--text-muted)';
                  e.currentTarget.style.borderColor = 'transparent';
                }
              }}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Applications Table */}
      <div className="modern-card rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full" style={{ borderCollapse: 'separate', borderSpacing: '0' }}>
          <thead style={{ background: 'var(--surface-secondary)' }}>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Employee
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Leave Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Dates
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Days
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Reason
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Applied On
              </th>
              {activeTab === 'pending' && (
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {applications.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center" style={{ color: 'var(--text-muted)' }}>
                  No {activeTab} applications found
                </td>
              </tr>
            ) : (
              applications.map((app) => (
                <React.Fragment key={app._id || app.id}>
                <tr 
                  key={app._id || app.id}
                  style={{ 
                    borderBottom: `1px solid var(--border)`,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--surface-hover)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{app.userId?.name || 'N/A'}</div>
                    <div className="text-sm" style={{ color: 'var(--text-muted)' }}>{app.userId?.email || ''}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm" style={{ color: 'var(--text-primary)' }}>{app.leaveTypeId?.name || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm" style={{ color: 'var(--text-primary)' }}>
                      {new Date(app.fromDate).toLocaleDateString()}
                    </div>
                    <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      to {new Date(app.toDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--text-primary)' }}>
                    {app.totalDays}
                  </td>
                  <td className="px-6 py-4 max-w-xs truncate text-sm" style={{ color: 'var(--text-primary)' }}>
                    {app.reason}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={getStatusBadgeVariant(app.status)}>
                      {app.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--text-muted)' }}>
                    {new Date(app.createdAt).toLocaleDateString()}
                  </td>
                  {activeTab === 'pending' && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleAskAI(app._id || app.id)}
                        isLoading={aiInsights[app._id || app.id]?.loading}
                        className="mr-2 border-primary text-primary hover:bg-primary-light"
                        title="Get AI Recommendation"
                        style={{ border: '1px solid var(--primary)', color: 'var(--primary)', background: 'transparent' }}
                      >
                        ✨ Ask AI
                      </Button>
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => handleApprove(app)}
                        isLoading={actionLoading}
                        className="mr-2"
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleRejectClick(app._id || app.id)}
                        isLoading={actionLoading}
                      >
                        Reject
                      </Button>
                    </td>
                  )}
                </tr>
                {/* AI Insight Row */}
                {aiInsights[app._id || app.id] && (
                  <tr key={`ai-${app._id || app.id}`}>
                    <td colSpan={8} className="px-6 py-3 bg-surface-secondary">
                      {aiInsights[app._id || app.id].loading ? (
                        <div className="flex items-center text-sm text-primary animate-pulse">
                          <span className="mr-2">✨</span> LeaveBot is evaluating this application...
                        </div>
                      ) : aiInsights[app._id || app.id].error ? (
                        <div className="flex items-center text-sm text-danger">
                          <span className="mr-2">⚠️</span> {aiInsights[app._id || app.id].error}
                        </div>
                      ) : (
                        <div className="p-3 rounded-lg border border-primary bg-primary-light/10">
                          <div className="flex items-center justify-between mb-1">
                             <div className="flex items-center gap-2">
                                <span className="font-semibold text-primary">✨ AI Recommendation:</span>
                                <Badge 
                                  variant={
                                    aiInsights[app._id || app.id].data?.recommendation === 'approve' ? 'approved' :
                                    aiInsights[app._id || app.id].data?.recommendation === 'reject' ? 'rejected' : 'pending'
                                  }
                                >
                                  {aiInsights[app._id || app.id].data?.recommendation.toUpperCase()}
                                </Badge>
                             </div>
                             {aiInsights[app._id || app.id].data?.provider && (
                                <span className="text-xs text-muted">Powered by {aiInsights[app._id || app.id].data?.provider}</span>
                             )}
                          </div>
                          <p className="text-sm text-text-secondary mt-1 ml-6">{aiInsights[app._id || app.id].data?.reason}</p>
                        </div>
                      )}
                    </td>
                  </tr>
                )}
              </React.Fragment>
              ))
            )}
          </tbody>
        </table>
        </div>
      </div>

      {/* Rejection Modal */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Reject Leave Application"
      >
        <div className="space-y-4">
          <Input
            label="Rejection Reason"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Enter reason for rejection..."
            required
          />
          <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={() => setRejectModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleReject} isLoading={actionLoading}>
              Reject Application
            </Button>
          </div>
        </div>
      </Modal>

      {/* Approve Confirmation Modal */}
      <ApproveModal
        isOpen={approveModalOpen}
        onClose={() => {
          setApproveModalOpen(false);
          setApplicationToApprove(null);
        }}
        itemName={applicationToApprove?.reason || 'this leave request'}
        itemType="leave request"
        onConfirm={confirmApprove}
        isApproving={actionLoading}
      />
    </div>
  );
}
