'use client';

import React, { useState, useEffect } from 'react';
import { authService } from '@/lib/services';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import toast from 'react-hot-toast';
import { User, Mail, Shield, Building, Briefcase, Camera, Lock, Save } from 'lucide-react';

export default function ProfilePage() {
  const { user, organization } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await authService.getProfile();
      setProfileData(data);
      setFormData(prev => ({ ...prev, name: data.name }));
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password && formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setSaving(true);
    try {
      const updateData: any = { name: formData.name };
      if (formData.password) {
        updateData.password = formData.password;
      }
      
      await authService.updateProfile(updateData);
      toast.success('Profile updated successfully!');
      setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
      loadProfile();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--primary)' }}></div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-6" style={{ borderBottom: '1px solid var(--border)' }}>
        <div>
          <h1 className="text-3xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>My Profile</h1>
          <p className="mt-1 font-medium" style={{ color: 'var(--text-muted)' }}>Manage your personal information and account security</p>
        </div>
        <Badge variant="approved" className="px-4 py-1.5 text-xs font-bold uppercase tracking-widest shadow-sm">
          {user?.role?.replace('_', ' ')}
        </Badge>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Left Column: Avatar and Quick Info */}
        <div className="space-y-6">
          <div className="p-8 rounded-3xl shadow-sm border text-center relative overflow-hidden group" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
            <div className="absolute top-0 left-0 w-full h-2" style={{ background: 'linear-gradient(to right, var(--primary-gradient-from), var(--primary-gradient-to))' }}></div>
            <div className="relative inline-block mb-6">
              <div className="w-32 h-32 rounded-3xl flex items-center justify-center text-white text-5xl font-black shadow-xl transform rotate-3 transition-transform group-hover:rotate-0 duration-300" style={{ background: 'linear-gradient(135deg, var(--primary-gradient-from), var(--primary-gradient-to))' }}>
                {profileData?.name?.charAt(0)}
              </div>
              <button className="absolute -bottom-2 -right-2 p-3 rounded-2xl shadow-lg border hover:scale-110 transition-transform" style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--primary)' }}>
                <Camera className="w-5 h-5" />
              </button>
            </div>
            <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{profileData?.name}</h3>
            <p className="font-medium text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{profileData?.designation || 'Staff Member'}</p>
          </div>

          <div className="p-6 rounded-3xl shadow-sm border space-y-4" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
            <div className="flex items-center gap-4 p-3 rounded-2xl transition-colors" style={{ color: 'var(--text-secondary)' }}>
              <div className="p-2 rounded-lg" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}><Mail className="w-4 h-4" /></div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase font-bold tracking-wider" style={{ color: 'var(--text-muted)' }}>Email Address</p>
                <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{profileData?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-3 rounded-2xl transition-colors" style={{ color: 'var(--text-secondary)' }}>
              <div className="p-2 rounded-lg" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}><Building className="w-4 h-4" /></div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase font-bold tracking-wider" style={{ color: 'var(--text-muted)' }}>Department</p>
                <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{profileData?.departmentId?.name || profileData?.department?.name || profileData?.department || 'General'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Edit Form */}
        <div className="md:col-span-2 space-y-8">
          <form onSubmit={handleUpdate} className="p-8 rounded-3xl shadow-sm border space-y-6" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                <User size={20} />
              </div>
              <h4 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Personal Details</h4>
            </div>
            
            <div className="grid md:grid-cols-1 gap-6">
              <Input 
                label="Full Name" 
                value={formData.name} 
                onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                placeholder="Enter your full name"
                className="font-semibold"
                required
              />
            </div>

            <div className="pt-8" style={{ borderTop: '1px solid var(--border)' }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-xl" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                  <Lock size={20} />
                </div>
                <h4 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Security & Password</h4>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <Input 
                  label="New Password" 
                  type="password" 
                  value={formData.password} 
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
                  placeholder="••••••••"
                  className="font-semibold"
                />
                <Input 
                  label="Confirm Password" 
                  type="password" 
                  value={formData.confirmPassword} 
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} 
                  placeholder="••••••••"
                  className="font-semibold"
                />
              </div>
              <p className="text-xs mt-4 leading-relaxed italic" style={{ color: 'var(--text-muted)' }}>
                Leave password fields blank if you don't want to change it. Password must be at least 6 characters.
              </p>
            </div>

            <div className="flex justify-end pt-6 uppercase tracking-widest font-black" style={{ borderTop: '1px solid var(--border-light)' }}>
              <Button type="submit" isLoading={saving} className="px-10 shadow-lg">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </form>
          
          <div className="rounded-3xl p-8 text-white relative overflow-hidden shadow-xl" style={{ background: 'linear-gradient(135deg, var(--primary-gradient-from), var(--primary-gradient-to))' }}>
             <div className="absolute top-0 right-0 p-8 opacity-10">
                <Shield size={120} />
             </div>
             <div className="relative z-10">
               <h4 className="text-xl font-bold mb-2">Platform Member Since</h4>
               <p className="font-medium" style={{ opacity: 0.8 }}>
                 {new Date(profileData?.createdAt).toLocaleDateString('en-US', { 
                   year: 'numeric', 
                   month: 'long', 
                   day: 'numeric' 
                 })}
               </p>
               <div className="mt-6 flex items-center gap-2">
                 <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                 <span className="text-xs font-bold uppercase tracking-widest" style={{ opacity: 0.7 }}>Active Account Verified</span>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
