'use client';

import React, { useEffect, useState } from 'react';
import { leaveTypeService } from '@/lib/services';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Switch } from '@/components/ui/Switch';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

export default function LeaveTypesPage() {
  const [leaveTypes, setLeaveTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    totalDaysAllowed: 0,
    carryForwardAllowed: false,
    carryForwardLimit: 0,
    isPaid: true,
    isActive: true,
  });

  useEffect(() => {
    loadLeaveTypes();
  }, []);

  const loadLeaveTypes = async () => {
    try {
      const data = await leaveTypeService.getLeaveTypes(true);
      setLeaveTypes(data);
    } catch (error) {
      console.error('Failed to load leave types:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (type?: any) => {
    if (type) {
      setEditingType(type);
      setFormData({
        name: type.name,
        totalDaysAllowed: type.totalDaysAllowed,
        carryForwardAllowed: type.carryForwardAllowed,
        carryForwardLimit: type.carryForwardLimit,
        isPaid: type.isPaid,
        isActive: type.isActive !== undefined ? type.isActive : true,
      });
    } else {
      setEditingType(null);
      setFormData({
        name: '',
        totalDaysAllowed: 0,
        carryForwardAllowed: false,
        carryForwardLimit: 0,
        isPaid: true,
        isActive: true,
      });
    }
    setModalOpen(true);
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await leaveTypeService.updateLeaveType(id, { isActive: !currentStatus });
      toast.success(`Leave type ${!currentStatus ? 'activated' : 'deactivated'}`);
      loadLeaveTypes();
    } catch (error: any) {
      toast.error('Failed to update status');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Explicitly parse numbers to prevent string validation errors on the backend
    const payload = {
      ...formData,
      totalDaysAllowed: Number(formData.totalDaysAllowed),
      carryForwardLimit: Number(formData.carryForwardLimit),
    };

    try {
      if (editingType) {
        await leaveTypeService.updateLeaveType(editingType?._id || editingType?.id, payload);
        toast.success('Leave type updated!');
      } else {
        await leaveTypeService.createLeaveType(payload);
        toast.success('Leave type created!');
      }
      setModalOpen(false);
      loadLeaveTypes();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this leave type?')) return;

    try {
      await leaveTypeService.deleteLeaveType(id);
      toast.success('Leave type deleted');
      loadLeaveTypes();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value: string | number | boolean = e.target.value;
    if (e.target.type === 'checkbox') {
      value = e.target.checked;
    } else if (e.target.type === 'number') {
      value = e.target.value === '' ? '' : Number(e.target.value);
    }
    setFormData({ ...formData, [e.target.name]: value });
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Leave Types</h1>
          <p className="mt-1" style={{ color: 'var(--text-muted)' }}>Configure and manage leave categories for your organization</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="shadow-md hover:scale-105 transition-all">
          + Add Leave Type
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {leaveTypes.map((type) => (
          <div 
            key={type._id || type.id} 
            className={cn(
              "group relative rounded-2xl shadow-lg border border-transparent transition-all duration-300 p-6 overflow-hidden",
              !type.isActive && "opacity-75"
            )}
            style={{ 
              backgroundColor: type.isActive ? 'var(--card-bg)' : 'var(--surface-secondary)',
              borderColor: 'var(--card-border)'
            }}
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>{type.name}</h3>
                <p className="text-xs mt-1 uppercase tracking-wider font-semibold" style={{ color: 'var(--text-muted)' }}>
                  {type.isPaid ? 'Paid Category' : 'Unpaid Category'}
                </p>
              </div>
              <Switch 
                checked={type.isActive} 
                onChange={() => handleToggleActive(type._id || type.id, type.isActive)} 
                className="py-0"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="rounded-xl p-3" style={{ backgroundColor: 'var(--surface-secondary)' }}>
                <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Days / Year</p>
                <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{type.totalDaysAllowed}</p>
              </div>
              <div className="rounded-xl p-3" style={{ backgroundColor: 'var(--surface-secondary)' }}>
                <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Carry Forward</p>
                <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                  {type.carryForwardAllowed ? `${type.carryForwardLimit}d` : 'No'}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t italic" style={{ borderColor: 'var(--border)' }}>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleOpenModal(type)} className="h-9 px-4">
                  Edit
                </Button>
                <Button variant="danger" size="sm" onClick={() => handleDelete(type._id || type.id)} className="h-9 px-4 opacity-50 hover:opacity-100">
                  Delete
                </Button>
              </div>
              <Badge variant={type.isActive ? 'approved' : 'cancelled'} className="px-3 h-6">
                {type.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>
        ))}
        
        {leaveTypes.length === 0 && (
          <div className="col-span-full py-20 text-center rounded-2xl border-2 border-dashed" style={{ 
            backgroundColor: 'var(--card-bg)', 
            borderColor: 'var(--border)'
          }}>
            <div className="text-4xl mb-4">✨</div>
            <p style={{ color: 'var(--text-muted)' }}>No leave types found. Get started by adding one!</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingType ? 'Edit Leave Type' : 'Add Leave Type'}>
        <form onSubmit={handleSubmit} className="space-y-6 pt-2">
          <Input label="Name" name="name" value={formData.name} onChange={handleChange} required placeholder="e.g. Sick Leave" />
          
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Total Days Allowed" 
              name="totalDaysAllowed" 
              type="number" 
              value={formData.totalDaysAllowed} 
              onChange={handleChange} 
              required 
              min={0}
            />
            <Input 
              label="Carry Forward Limit" 
              name="carryForwardLimit" 
              type="number" 
              value={formData.carryForwardLimit} 
              onChange={handleChange} 
              min={0}
              disabled={!formData.carryForwardAllowed}
            />
          </div>

          <div className="space-y-4 p-4 rounded-xl" style={{ backgroundColor: 'var(--surface-secondary)' }}>
            <Switch 
              label="Carry Forward Allowed" 
              subLabel="Allow unused days to roll over to next year"
              checked={formData.carryForwardAllowed} 
              onChange={(checked) => setFormData({...formData, carryForwardAllowed: checked})} 
            />
            <Switch 
              label="Paid Leave" 
              subLabel="Deduct salary for this leave type"
              checked={formData.isPaid} 
              onChange={(checked) => setFormData({...formData, isPaid: checked})} 
            />
            <Switch 
              label="Active Status" 
              subLabel="Enable or disable this leave type for employees"
              checked={formData.isActive} 
              onChange={(checked) => setFormData({...formData, isActive: checked})} 
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" className="px-8">{editingType ? 'Update Changes' : 'Create Leave Type'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

