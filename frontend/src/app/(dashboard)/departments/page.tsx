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
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Departments</h1>
          <p className="text-gray-500 mt-1">Organize your team into departments and assign heads</p>
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
         <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
               <Building2 className="w-6 h-6" />
            </div>
            <div>
               <p className="text-sm text-gray-500 font-medium">Total Departments</p>
               <h3 className="text-2xl font-bold text-gray-900">{departments.length}</h3>
            </div>
         </div>
         <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
               <Users className="w-6 h-6" />
            </div>
            <div>
               <p className="text-sm text-gray-500 font-medium">Active Departments</p>
               <h3 className="text-2xl font-bold text-gray-900">{departments.filter(d => d.isActive).length}</h3>
            </div>
         </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Name</th>
                <th className="px-8 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Department Head</th>
                <th className="px-8 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {departments.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <Building2 className="w-12 h-12 text-gray-200 mb-4" />
                      <p className="font-medium">No departments found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                departments.map((dept) => (
                  <tr key={dept._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-bold text-gray-900">{dept.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center text-sm text-gray-600">
                        {dept.headId ? (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-[10px] font-bold">
                              {dept.headId.name?.charAt(0)}
                            </div>
                            <span>{dept.headId.name}</span>
                          </div>
                        ) : (
                           <span className="text-gray-400 italic">Not Assigned</span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <Badge variant={dept.isActive ? 'approved' : 'rejected'}>
                        {dept.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-8 py-5 text-right flex justify-end gap-2 text-right">
                      <button 
                        onClick={() => handleEdit(dept)}
                        className="p-2 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                      >
                        <Pencil className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(dept._id)}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
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
             <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Department is active</label>
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
