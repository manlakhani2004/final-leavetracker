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
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">My Profile</h1>
          <p className="text-gray-500 mt-1 font-medium">Manage your personal information and account security</p>
        </div>
        <Badge variant="approved" className="px-4 py-1.5 text-xs font-bold uppercase tracking-widest shadow-sm">
          {user?.role?.replace('_', ' ')}
        </Badge>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Left Column: Avatar and Quick Info */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
            <div className="relative inline-block mb-6">
              <div className="w-32 h-32 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center text-white text-5xl font-black shadow-xl transform rotate-3 transition-transform group-hover:rotate-0 duration-300">
                {profileData?.name?.charAt(0)}
              </div>
              <button className="absolute -bottom-2 -right-2 p-3 bg-white rounded-2xl shadow-lg border border-gray-100 text-indigo-600 hover:scale-110 transition-transform">
                <Camera className="w-5 h-5" />
              </button>
            </div>
            <h3 className="text-xl font-bold text-gray-900">{profileData?.name}</h3>
            <p className="text-gray-500 font-medium text-sm mt-1">{profileData?.designation || 'Staff Member'}</p>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-4">
            <div className="flex items-center gap-4 text-gray-600 p-3 rounded-2xl hover:bg-gray-50 transition-colors">
              <div className="p-2 bg-gray-100 rounded-lg"><Mail className="w-4 h-4" /></div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Email Address</p>
                <p className="text-sm font-semibold truncate">{profileData?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-gray-600 p-3 rounded-2xl hover:bg-gray-50 transition-colors">
              <div className="p-2 bg-gray-100 rounded-lg"><Building className="w-4 h-4" /></div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Department</p>
                <p className="text-sm font-semibold truncate">{profileData?.department?.name || profileData?.department || 'General'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Edit Form */}
        <div className="md:col-span-2 space-y-8">
          <form onSubmit={handleUpdate} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
                <User size={20} />
              </div>
              <h4 className="text-lg font-bold text-gray-900">Personal Details</h4>
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

            <div className="pt-8 border-t border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-50 rounded-xl text-purple-600">
                  <Lock size={20} />
                </div>
                <h4 className="text-lg font-bold text-gray-900">Security & Password</h4>
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
              <p className="text-xs text-gray-400 mt-4 leading-relaxed italic">
                Leave password fields blank if you don't want to change it. Password must be at least 6 characters.
              </p>
            </div>

            <div className="flex justify-end pt-6 border-t border-gray-50 uppercase tracking-widest font-black">
              <Button type="submit" isLoading={saving} className="px-10 shadow-lg shadow-indigo-100">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </form>
          
          <div className="bg-indigo-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl">
             <div className="absolute top-0 right-0 p-8 opacity-10">
                <Shield size={120} />
             </div>
             <div className="relative z-10">
               <h4 className="text-xl font-bold mb-2">Platform Member Since</h4>
               <p className="text-indigo-200 font-medium">
                 {new Date(profileData?.createdAt).toLocaleDateString('en-US', { 
                   year: 'numeric', 
                   month: 'long', 
                   day: 'numeric' 
                 })}
               </p>
               <div className="mt-6 flex items-center gap-2">
                 <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                 <span className="text-xs font-bold text-indigo-300 uppercase tracking-widest">Active Account Verified</span>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
