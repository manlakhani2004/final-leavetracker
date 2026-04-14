'use client';

import React, { useEffect, useState } from 'react';
import { leaveApplicationService, leaveTypeService } from '@/lib/services';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import toast from 'react-hot-toast';

export default function ApplyLeavePage() {
  const [leaveTypes, setLeaveTypes] = useState<any[]>([]);
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
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to apply leave');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Apply for Leave</h1>
      
      <div className="max-w-2xl modern-card rounded-lg p-6">
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
    </div>
  );
}
