'use client';

import React, { useEffect, useState } from 'react';
import { userService, departmentService } from '@/lib/services';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import DeleteModal from '@/components/ui/DeleteModal';
import { Search, Filter, UserPlus, Users, MoreVertical, Edit2, Trash2, Mail, Shield, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [totalUsers, setTotalUsers] = useState(0);
  const [departments, setDepartments] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee',
    departmentId: '',
    designation: '',
  });

  useEffect(() => {
    loadUsers();
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      const data = await departmentService.getDepartments();
      setDepartments(data);
    } catch (error) {
      console.error('Failed to load departments:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const data = await userService.getUsers(1, 100) as any;
      setUsers(data.data || []);
      setTotalUsers(data.meta?.total || 0);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (user?: any) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        password: '',
        role: user.role,
        departmentId: user.departmentId?._id || user.departmentId || '',
        designation: user.designation || '',
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'employee',
        departmentId: '',
        designation: '',
      });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        // Create update payload without password if it's empty
        const updatePayload: any = {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          departmentId: formData.departmentId,
          designation: formData.designation,
        };

        // Only include password if it's not empty (user wants to change password)
        if (formData.password && formData.password.trim() !== '') {
          updatePayload.password = formData.password;
        }

        await userService.updateUser(editingUser?._id || editingUser?.id, updatePayload);
        toast.success('User updated successfully');
      } else {
        await userService.createUser(formData);
        toast.success('User created successfully');
      }
      setModalOpen(false);
      loadUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = (user: any) => {
    setUserToDelete(user);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    setIsDeleting(true);
    try {
      await userService.deleteUser(userToDelete._id);
      toast.success('User deactivated');
      loadUsers();
      setDeleteModalOpen(false);
      setUserToDelete(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Action failed');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (loading) return (
    <div className="flex h-96 items-center justify-center">
      <div className="shimmer h-12 w-12 rounded-full" />
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>Team Members</h1>
          <p className="font-medium" style={{ color: 'var(--text-muted)' }}>Manage your organization's workforce and permissions.</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="h-14 px-8 py-0">
          <UserPlus className="mr-2 h-5 w-5" />
          Add New Member
        </Button>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="modern-card p-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>Total Members</p>
            <p className="text-3xl font-black" style={{ color: 'var(--text-primary)' }}>{totalUsers}</p>
          </div>
          <div className="h-12 w-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
            <Users size={24} />
          </div>
        </div>
        <div className="modern-card p-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>Departments</p>
            <p className="text-3xl font-black" style={{ color: 'var(--text-primary)' }}>{departments.length}</p>
          </div>
          <div className="h-12 w-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'rgba(244, 63, 94, 0.1)', color: 'rgb(244, 63, 94)' }}>
            <Briefcase size={24} />
          </div>
        </div>
        <div className="modern-card p-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>Admin Roles</p>
            <p className="text-3xl font-black" style={{ color: 'var(--text-primary)' }}>{users.filter(u => u.role.includes('admin')).length}</p>
          </div>
          <div className="h-12 w-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: 'rgb(245, 158, 11)' }}>
            <Shield size={24} />
          </div>
        </div>
      </div>

      {/* Filters & Table Section */}
      <div className="modern-card overflow-hidden">
        <div className="p-6 border-b flex flex-col md:flex-row gap-4" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface-secondary)' }}>
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-2xl focus:outline-none focus:ring-2 transition-all font-medium text-sm"
              style={{
                backgroundColor: 'var(--input-bg)',
                borderColor: 'var(--input-border)',
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
            />
          </div>
          <div className="flex gap-4">
            <div className="relative min-w-[160px]">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--text-muted)' }} />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full pl-12 pr-8 py-3 rounded-2xl focus:outline-none focus:ring-2 appearance-none font-medium text-sm"
                style={{
                  backgroundColor: 'var(--input-bg)',
                  borderColor: 'var(--input-border)',
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
              >
                <option value="all">All Roles</option>
                <option value="org_admin">Admins</option>
                <option value="hr_manager">HR</option>
                <option value="manager">Managers</option>
                <option value="employee">Employees</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--surface-secondary)' }}>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>Member</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>Role & Department</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>Designation</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-right" style={{ color: 'var(--text-muted)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr
                  key={user._id}
                  className="group transition-colors"
                  style={{
                    borderBottom: `1px solid var(--border)`,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--surface-hover)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg group-hover:scale-110 transition-transform duration-300" style={{ backgroundColor: 'var(--primary)' }}>
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>{user.name}</div>
                        <div className="text-xs font-medium flex items-center gap-1.5 pt-1" style={{ color: 'var(--text-muted)' }}>
                          <Mail size={12} />
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-2">
                      <Badge variant={user.role === 'org_admin' ? 'approved' : user.role === 'employee' ? 'default' : 'pending'}>
                        {user.role.replace('_', ' ')}
                      </Badge>
                      <span className="text-xs font-bold flex items-center gap-1.5 ml-1" style={{ color: 'var(--text-muted)' }}>
                        <Briefcase size={12} />
                        {user.departmentId?.name || user.department || 'General'}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-sm font-bold" style={{ color: 'var(--text-secondary)' }}>{user.designation || '-'}</span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2 pr-2">
                      <button
                        onClick={() => handleOpenModal(user)}
                        className="p-2.5 rounded-xl transition-all"
                        style={{
                          color: 'var(--text-muted)',
                          backgroundColor: 'transparent'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--primary-light)';
                          e.currentTarget.style.color = 'var(--primary)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = 'var(--text-muted)';
                        }}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(user)}
                        className="p-2.5 rounded-xl transition-all"
                        style={{
                          color: 'var(--text-muted)',
                          backgroundColor: 'transparent'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                          e.currentTarget.style.color = '#ef4444';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = 'var(--text-muted)';
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredUsers.length === 0 && (
            <div className="py-20 text-center space-y-3">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl" style={{ backgroundColor: 'var(--surface-secondary)', color: 'var(--text-muted)' }}>
                <Search size={32} />
              </div>
              <p className="font-bold" style={{ color: 'var(--text-muted)' }}>No members found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modern Modal Wrapper */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingUser ? 'Update Profile' : 'New Member Registration'}
      >
        <form onSubmit={handleSubmit} className="space-y-5 px-2 py-4">
          <Input label="Full Name" name="name" value={formData.name} onChange={(e: any) => setFormData({ ...formData, name: e.target.value })} required placeholder="John Doe" />
          <Input label="Email Address" name="email" type="email" value={formData.email} onChange={(e: any) => setFormData({ ...formData, email: e.target.value })} required placeholder="john@example.com" />

          {!editingUser && (
            <Input label="Access Password" name="password" type="password" value={formData.password} onChange={(e: any) => setFormData({ ...formData, password: e.target.value })} required minLength={6} placeholder="••••••••" />
          )}

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="System Role"
              value={formData.role}
              onChange={(e: any) => setFormData({ ...formData, role: e.target.value })}
              name="role"
              options={[
                { value: 'employee', label: 'Employee' },
                { value: 'manager', label: 'Manager' },
                { value: 'hr_manager', label: 'HR Manager' },
                { value: 'org_admin', label: 'Org Admin' },
              ]}
            />
            <Select
              label="Section/Dept"
              name="departmentId"
              value={formData.departmentId}
              onChange={(e: any) => setFormData({ ...formData, departmentId: e.target.value })}
              options={[
                { value: '', label: 'General' },
                ...departments.map((d) => ({ value: d._id, label: d.name }))
              ]}
            />
          </div>

          <Input label="Position / Designation" name="designation" value={formData.designation} onChange={(e: any) => setFormData({ ...formData, designation: e.target.value })} placeholder="Software Engineer" />

          <div className="flex gap-4 mt-8">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)} className="flex-1">Discard</Button>
            <Button type="submit" className="flex-1">{editingUser ? 'Save Changes' : 'Register Member'}</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setUserToDelete(null);
        }}
        itemName={userToDelete?.name || 'this user'}
        itemType="user"
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
