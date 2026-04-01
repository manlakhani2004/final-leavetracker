'use client';

import React, { useEffect, useState } from 'react';
import { departmentService, userService } from '@/lib/services';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { Building2, Users, Trash2, Plus, Pencil, UserCircle } from 'lucide-react';

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    headId: '',
    isActive: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [deptData, userData] = await Promise.all([
        departmentService.getDepartments(true),
        userService.getUsers(1, 100).then(res => res.data)
      ]);
      setDepartments(deptData);
      setUsers(userData);
    } catch (error) {
      console.error('Failed to load departments:', error);
      toast.error('Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await departmentService.updateDepartment(editingId, formData);
        toast.success('Department updated!');
      } else {
        await departmentService.createDepartment(formData);
        toast.success('Department created!');
      }
      setModalOpen(false);
      setEditingId(null);
      setFormData({ name: '', headId: '', isActive: true });
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to ${editingId ? 'update' : 'create'} department`);
    }
  };

  const handleEdit = (dept: any) => {
    setEditingId(dept._id || dept.id);
    setFormData({
      name: dept.name,
      headId: dept.headId?._id || dept.headId || '',
      isActive: dept.isActive,
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this department?')) return;
    try {
      await departmentService.deleteDepartment(id);
      toast.success('Department deleted');
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Departments</h1>
          <p className="mt-1" style={{ color: 'var(--text-muted)' }}>Organize your team into departments and assign heads</p>
        </div>
        <Button onClick={() => {
          setEditingId(null);
          setFormData({ name: '', headId: '', isActive: true });
          setModalOpen(true);
        }} className="shadow-lg shadow-indigo-200">
          <Plus className="w-4 h-4 mr-2" />
          Add Department
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
         <div className="modern-card p-6 rounded-2xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
               <Building2 className="w-6 h-6" />
            </div>
            <div>
               <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Total Departments</p>
               <h3 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{departments.length}</h3>
            </div>
         </div>
         <div className="modern-card p-6 rounded-2xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'rgb(16, 185, 129)' }}>
               <Users className="w-6 h-6" />
            </div>
            <div>
               <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Active Departments</p>
               <h3 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{departments.filter(d => d.isActive).length}</h3>
            </div>
         </div>
      </div>

      <div className="modern-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full" style={{ borderCollapse: 'separate', borderSpacing: '0' }}>
            <thead>
              <tr style={{ background: 'var(--surface-secondary)' }}>
                <th className="px-8 py-4 text-left text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Name</th>
                <th className="px-8 py-4 text-left text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Department Head</th>
                <th className="px-8 py-4 text-left text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Status</th>
                <th className="px-8 py-4 text-right text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {departments.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center" style={{ color: 'var(--text-muted)' }}>
                    <div className="flex flex-col items-center">
                      <Building2 className="w-12 h-12 mb-4" style={{ color: 'var(--text-muted)' }} />
                      <p className="font-medium">No departments found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                departments.map((dept) => (
                  <tr 
                    key={dept._id} 
                    className="transition-colors"
                    style={{ 
                      borderBottom: `1px solid var(--border)`,
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--surface-hover)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
                          <Building2 className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{dept.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {dept.headId ? (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full flex items-center justify-center font-bold" style={{ backgroundColor: 'var(--surface-secondary)', color: 'var(--text-primary)', fontSize: '10px' }}>
                              {dept.headId.name?.charAt(0)}
                            </div>
                            <span>{dept.headId.name}</span>
                          </div>
                        ) : (
                           <span className="italic" style={{ color: 'var(--text-muted)' }}>Not Assigned</span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <Badge variant={dept.isActive ? 'approved' : 'rejected'}>
                        {dept.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-8 py-5 text-right flex justify-end gap-2">
                      <button 
                        onClick={() => handleEdit(dept)}
                        className="p-2 rounded-lg transition-all"
                        style={{ 
                          color: 'var(--primary)',
                          backgroundColor: 'transparent'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--primary-light)';
                          e.currentTarget.style.color = 'var(--primary-hover)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = 'var(--primary)';
                        }}
                      >
                        <Pencil className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(dept._id)}
                        className="p-2 rounded-lg transition-all"
                        style={{ 
                          color: '#ef4444',
                          backgroundColor: 'transparent'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                          e.currentTarget.style.color = '#dc2626';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = '#ef4444';
                        }}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title={editingId ? "Edit Department" : "Add Department"}
      >
        <form onSubmit={handleSubmit} className="space-y-6 pt-2">
          <Input 
            label="Department Name" 
            value={formData.name} 
            onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
            required 
            placeholder="e.g. Engineering, Sales" 
          />
          <Select
            label="Department Head (Optional)"
            value={formData.headId}
            onChange={(e) => setFormData({ ...formData, headId: e.target.value })}
            options={[
              { value: '', label: 'No Head Assigned' },
              ...users.map(u => ({ value: u._id, label: u.name }))
            ]}
          />
          <div className="flex items-center gap-3">
             <input 
               type="checkbox" 
               id="isActive"
               checked={formData.isActive}
               onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
               className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
             />
             <label htmlFor="isActive" className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Department is active</label>
          </div>
          <div className="flex justify-end space-x-3 pt-6 border-t font-semibold">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" className="px-8">{editingId ? 'Update' : 'Save'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
