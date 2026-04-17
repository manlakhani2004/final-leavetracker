'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { leaveApplicationService, leaveTypeService, leaveBalanceService } from '@/lib/services';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import toast from 'react-hot-toast';
import {
  CalendarDays,
  Clock,
  Wallet,
  TrendingDown,
  CheckCircle2,
  Info,
  Sparkles,
} from 'lucide-react';

export default function ApplyLeavePage() {
  const [leaveTypes, setLeaveTypes] = useState<any[]>([]);
  const [balances, setBalances] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    leaveTypeId: '',
    fromDate: '',
    toDate: '',
    reason: '',
    duration: 'full_day',
    halfDayType: 'first_half',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [totalDays, setTotalDays] = useState(0);

  useEffect(() => {
    loadLeaveTypes();
    loadBalances();
  }, []);

  useEffect(() => {
    if (formData.fromDate && formData.toDate) {
      if (formData.duration === 'half_day') {
         setTotalDays(0.5);
         if (formData.toDate !== formData.fromDate) {
           setFormData(f => ({ ...f, toDate: f.fromDate }));
         }
      } else {
        const from = new Date(formData.fromDate);
        const to = new Date(formData.toDate);
        if (from <= to) {
          const days = calculateWorkingDays(from, to);
          setTotalDays(days);
        } else {
          setTotalDays(0);
        }
      }
    }
  }, [formData.fromDate, formData.toDate, formData.duration]);

  const loadLeaveTypes = async () => {
    try {
      const types = await leaveTypeService.getLeaveTypes();
      setLeaveTypes(types);
      if (types.length > 0) {
        setFormData(prev => ({ ...prev, leaveTypeId: (types[0] as any)._id || types[0].id || '' }));
      }
    } catch (error) {
      console.error('Failed to load leave types:', error);
    }
  };

  const loadBalances = async () => {
    try {
      const data = await leaveBalanceService.getMyBalances();
      setBalances(data || []);
    } catch (error) {
      console.error('Failed to load balances:', error);
    }
  };

  const calculateWorkingDays = (from: Date, to: Date): number => {
    let count = 0;
    const current = new Date(from);
    const end = new Date(to);

    while (current <= end) {
      const day = current.getDay();
      // Exclude Saturday (6) and Sunday (0)
      if (day !== 0 && day !== 6) {
        count++;
      }
      current.setDate(current.getDate() + 1);
    }

    return count || 1;
  };

  // Find the selected balance for the chosen leave type
  const selectedBalance = useMemo(() => {
    if (!formData.leaveTypeId) return null;
    return balances.find((b: any) => {
      const balLeaveTypeId = b.leaveTypeId?._id || b.leaveTypeId;
      return balLeaveTypeId === formData.leaveTypeId;
    });
  }, [formData.leaveTypeId, balances]);

  // Find the selected leave type object
  const selectedLeaveType = useMemo(() => {
    if (!formData.leaveTypeId) return null;
    return leaveTypes.find((t: any) => (t._id || t.id) === formData.leaveTypeId);
  }, [formData.leaveTypeId, leaveTypes]);

  // Computed balance values
  const availableBalance = selectedBalance?.remaining ?? selectedLeaveType?.totalDaysAllowed ?? 0;
  const currentBooking = totalDays;
  const balanceAfterBooking = Math.max(0, availableBalance - currentBooking);
  const isOverdrawn = currentBooking > availableBalance;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.leaveTypeId) {
      toast.error('Please select a leave type');
      return;
    }

    setIsLoading(true);
    try {
      const payload: any = {
        ...formData,
        fromDate: formData.fromDate,
        toDate: formData.duration === 'half_day' ? formData.fromDate : formData.toDate,
      };

      if (formData.duration === 'half_day') {
        payload.halfDayType = formData.halfDayType;
      } else {
        delete payload.halfDayType;
      }

      await leaveApplicationService.applyLeave(payload);
      toast.success('Leave application submitted successfully!');
      setFormData({
        leaveTypeId: (leaveTypes[0] as any)?._id || leaveTypes[0]?.id || '',
        fromDate: '',
        toDate: '',
        duration: 'full_day',
        halfDayType: 'first_half',
        reason: '',
      });
      setTotalDays(0);
      // Refresh balances after successful submission
      loadBalances();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to apply leave');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Show summary when leave type is selected
  const showSummary = !!formData.leaveTypeId && (balances.length > 0 || leaveTypes.length > 0);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Apply for Leave</h1>
      
      <div className="flex flex-col lg:flex-row gap-6">
        {/* ── Left: Application Form ── */}
        <div className="flex-1 max-w-2xl modern-card rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Select
              label="Leave Type"
              name="leaveTypeId"
              value={formData.leaveTypeId}
              onChange={handleChange}
              options={leaveTypes.map(type => ({ 
                value: (type as any)._id || type.id, 
                label: `${type.name} (${type.totalDaysAllowed} days)` 
              }))}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="From Date"
                name="fromDate"
                type="date"
                value={formData.fromDate}
                onChange={handleChange}
                required
              />
              <Input
                label="To Date"
                name="toDate"
                type="date"
                value={formData.toDate}
                onChange={handleChange}
                disabled={formData.duration === 'half_day'}
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Select
                label="Duration"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                options={[
                  { value: 'full_day', label: 'Full Day' },
                  { value: 'half_day', label: 'Half Day' }
                ]}
              />
              {formData.duration === 'half_day' && (
                <Select
                  label="Half Day Segment"
                  name="halfDayType"
                  value={formData.halfDayType}
                  onChange={handleChange}
                  options={[
                    { value: 'first_half', label: '1st Half' },
                    { value: 'second_half', label: '2nd Half' }
                  ]}
                />
              )}
            </div>

            {totalDays > 0 && (
              <div className="rounded-lg overflow-hidden" style={{ 
                backgroundColor: 'var(--surface-secondary)', 
                borderColor: 'var(--border-light)',
                borderWidth: '1px',
                borderStyle: 'solid'
              }}>
                 <div className="px-4 py-3 bg-indigo-50 border-b border-indigo-100 dark:bg-indigo-900/20 dark:border-indigo-800/30">
                   <p className="text-sm font-semibold flex justify-between items-center" style={{ color: 'var(--text-primary)' }}>
                     <span>Total {formData.duration === 'half_day' ? 'Half ' : ''}Day(s)</span>
                     <span className="text-lg text-indigo-600 dark:text-indigo-400">{totalDays} Day(s)</span>
                   </p>
                 </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                Reason
              </label>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-3 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-all"
                style={{
                  backgroundColor: 'var(--input-bg)',
                  borderColor: 'var(--input-border)',
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  color: 'var(--input-text)'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--input-focus-border)';
                  e.target.style.boxShadow = '0 0 0 2px var(--input-focus-ring)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--input-border)';
                  e.target.style.boxShadow = 'none';
                }}
                placeholder="Enter reason for leave..."
              />
            </div>

            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full"
            >
              Submit Application
            </Button>
          </form>
        </div>

        {/* ── Right: Leave Balance Summary Panel ── */}
        {showSummary && (
          <div className="w-full lg:w-80 shrink-0 space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
            {/* Balance Summary Card */}
            <div className="modern-card overflow-hidden">
              {/* Header */}
              <div
                className="px-5 py-4 flex items-center justify-between"
                style={{
                  background: 'linear-gradient(135deg, var(--primary-gradient-from), var(--primary-gradient-to))',
                }}
              >
                <div className="flex items-center gap-2.5 text-white">
                  <Wallet size={18} />
                  <span className="text-sm font-black uppercase tracking-widest">Balance Summary</span>
                </div>
                <span className="text-[10px] font-bold text-white/60 uppercase tracking-wider">
                  As on {new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
              </div>

              {/* Selected Leave Type Name */}
              {selectedLeaveType && (
                <div className="px-5 pt-4 pb-2">
                  <p className="text-xs font-black uppercase tracking-[0.15em]" style={{ color: 'var(--text-muted)' }}>
                    Selected Leave Type
                  </p>
                  <p className="text-base font-black mt-1" style={{ color: 'var(--primary-text)' }}>
                    {selectedLeaveType.name}
                  </p>
                </div>
              )}

              {/* Balance Rows */}
              <div className="px-5 py-4 space-y-0">
                {/* Available Balance */}
                <div className="flex items-center justify-between py-3.5" style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
                      <CheckCircle2 size={16} style={{ color: '#10b981' }} />
                    </div>
                    <span className="text-sm font-bold" style={{ color: 'var(--text-secondary)' }}>Available Balance</span>
                  </div>
                  <span className="text-lg font-black" style={{ color: '#10b981' }}>
                    {availableBalance}
                  </span>
                </div>

                {/* Current Booking */}
                <div className="flex items-center justify-between py-3.5" style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(99, 102, 241, 0.1)' }}>
                      <CalendarDays size={16} style={{ color: '#6366f1' }} />
                    </div>
                    <span className="text-sm font-bold" style={{ color: 'var(--text-secondary)' }}>Current Booking</span>
                  </div>
                  <span className="text-lg font-black" style={{ color: 'var(--text-primary)' }}>
                    {currentBooking > 0 ? currentBooking : '—'}
                  </span>
                </div>

                {/* Balance After Booking */}
                <div className="flex items-center justify-between py-3.5">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-8 w-8 rounded-lg flex items-center justify-center"
                      style={{ background: isOverdrawn ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)' }}
                    >
                      <TrendingDown size={16} style={{ color: isOverdrawn ? '#ef4444' : '#3b82f6' }} />
                    </div>
                    <span className="text-sm font-bold" style={{ color: isOverdrawn ? '#ef4444' : 'var(--text-secondary)' }}>
                      Balance After Booking
                    </span>
                  </div>
                  <span
                    className="text-lg font-black"
                    style={{ color: isOverdrawn ? '#ef4444' : '#3b82f6' }}
                  >
                    {currentBooking > 0 ? balanceAfterBooking : '—'}
                  </span>
                </div>
              </div>

              {/* Overdrawn Warning */}
              {isOverdrawn && currentBooking > 0 && (
                <div className="mx-5 mb-4 rounded-xl p-3 flex items-start gap-2.5" style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.15)' }}>
                  <Info size={16} className="mt-0.5 shrink-0" style={{ color: '#ef4444' }} />
                  <p className="text-xs font-bold leading-relaxed" style={{ color: '#ef4444' }}>
                    Insufficient balance! You are requesting {currentBooking - availableBalance} more day(s) than available.
                  </p>
                </div>
              )}
            </div>

            {/* Usage Progress Card */}
            {selectedBalance && (
              <div className="modern-card p-5 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center gap-2">
                  <Clock size={16} style={{ color: 'var(--primary)' }} />
                  <span className="text-xs font-black uppercase tracking-[0.15em]" style={{ color: 'var(--text-muted)' }}>
                    Usage Overview
                  </span>
                </div>

                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>
                      Used: {selectedBalance.used} of {selectedBalance.totalAllocated + (selectedBalance.carryForward || 0)}
                    </span>
                    <span className="text-xs font-black" style={{ color: 'var(--primary-text)' }}>
                      {Math.round((selectedBalance.used / (selectedBalance.totalAllocated + (selectedBalance.carryForward || 0))) * 100)}%
                    </span>
                  </div>
                  <div className="h-2.5 w-full rounded-full overflow-hidden" style={{ background: 'var(--surface-secondary)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{
                        width: `${Math.min(100, (selectedBalance.used / (selectedBalance.totalAllocated + (selectedBalance.carryForward || 0))) * 100)}%`,
                        background: 'linear-gradient(90deg, var(--primary-gradient-from), var(--primary-gradient-to))',
                      }}
                    />
                  </div>
                </div>

                {/* Quick Stats Row */}
                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div className="text-center p-2.5 rounded-xl" style={{ background: 'var(--surface-secondary)' }}>
                    <p className="text-lg font-black" style={{ color: 'var(--primary-text)' }}>
                      {selectedBalance.totalAllocated}
                    </p>
                    <p className="text-[9px] font-bold uppercase tracking-widest mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      Allocated
                    </p>
                  </div>
                  <div className="text-center p-2.5 rounded-xl" style={{ background: 'var(--surface-secondary)' }}>
                    <p className="text-lg font-black" style={{ color: '#f59e0b' }}>
                      {selectedBalance.used}
                    </p>
                    <p className="text-[9px] font-bold uppercase tracking-widest mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      Used
                    </p>
                  </div>
                  <div className="text-center p-2.5 rounded-xl" style={{ background: 'var(--surface-secondary)' }}>
                    <p className="text-lg font-black" style={{ color: '#10b981' }}>
                      {selectedBalance.remaining}
                    </p>
                    <p className="text-[9px] font-bold uppercase tracking-widest mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      Remaining
                    </p>
                  </div>
                </div>

                {/* Carry Forward Info */}
                {selectedBalance.carryForward > 0 && (
                  <div className="flex items-center gap-2 pt-1">
                    <Sparkles size={13} style={{ color: 'var(--primary)' }} />
                    <span className="text-[11px] font-bold" style={{ color: 'var(--text-muted)' }}>
                      Includes {selectedBalance.carryForward} carry-forward day(s)
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
