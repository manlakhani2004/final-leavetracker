'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/lib/services';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import toast from 'react-hot-toast';
import { ArrowRight, Users, BarChart3, CalendarDays, Building2, ShieldCheck } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    organizationName: '',
    adminName: '',
    adminEmail: '',
    adminPassword: '',
    domain: '',
    address: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const data = await authService.registerOrg(formData);
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      toast.success('Registration successful!');
      router.push('/dashboard');
    } catch (error: any) {
      const msg = error.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg[0] : (msg || 'Registration failed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--background)' }}>
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div 
          className="w-full max-w-6xl mx-auto flex rounded-3xl overflow-hidden shadow-2xl min-h-[580px]"
          style={{ border: '1px solid var(--border)', background: 'var(--card-bg)' }}
        >
          
          {/* Left Panel - Branding */}
          <div 
            className="hidden lg:flex flex-col justify-between w-[44%] py-11 px-10 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, var(--primary-gradient-from), var(--primary-gradient-to))' }}
          >
        {/* Decorative circles */}
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-white/10" />
        <div className="absolute bottom-20 -right-16 w-56 h-56 rounded-full bg-white/10" />
        <div className="absolute top-1/2 left-1/3 w-32 h-32 rounded-full bg-white/5" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <CalendarDays className="text-white" size={22} />
          </div>
          <div>
            <h2 className="text-base font-bold text-white leading-none">Leave Tracker</h2>
            <p className="text-[10px] font-medium text-white/60 uppercase tracking-widest mt-0.5">Registration</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 space-y-6">
          <div>
            <h1 className="text-4xl font-bold text-white leading-tight">
              Create your<br />
              <span className="text-white/70">Organization.</span>
            </h1>
            <p className="text-white/70 mt-4 text-sm leading-relaxed max-w-sm">
              Set up your workspace in minutes. Manage employees, leave policies, and approvals from a single platform.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-white/15 flex items-center justify-center">
                <Users size={16} className="text-white/80" />
              </div>
              <span className="text-sm text-white/80 font-medium">Add staff and assign roles easily</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-white/15 flex items-center justify-center">
                <BarChart3 size={16} className="text-white/80" />
              </div>
              <span className="text-sm text-white/80 font-medium">Get real-time reports instantly</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-white/15 flex items-center justify-center">
                <ShieldCheck size={16} className="text-white/80" />
              </div>
              <span className="text-sm text-white/80 font-medium">Secure multi-role access control</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10">
          <p className="text-xs text-white/40">© 2026 Leave Tracker. All rights reserved.</p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 overflow-y-auto">
        <div className="w-full max-w-lg space-y-8">
          
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 justify-center mb-4">
            <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--primary)', color: 'white' }}>
              <CalendarDays size={22} />
            </div>
            <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Leave Tracker</h2>
          </div>

          {/* Header */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--primary)' }}>
              Create Account
            </p>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Set up your organization
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              Register your organization and create an admin account.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Organization section */}
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wider flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                <Building2 size={14} /> Organization Details
              </p>
              <Input
                label="Organization Name"
                name="organizationName"
                value={formData.organizationName}
                onChange={handleChange}
                required
                placeholder="Acme Inc."
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Domain"
                  name="domain"
                  value={formData.domain}
                  onChange={handleChange}
                  placeholder="acme.com"
                />
                <Input
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="City, Country"
                />
              </div>
            </div>

            {/* Divider */}
            <div style={{ borderTop: '1px solid var(--border)' }} />

            {/* Admin section */}
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wider flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                <ShieldCheck size={14} /> Admin Account
              </p>
              <Input
                label="Full Name"
                name="adminName"
                value={formData.adminName}
                onChange={handleChange}
                required
                placeholder="John Doe"
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Work Email"
                  name="adminEmail"
                  type="email"
                  value={formData.adminEmail}
                  onChange={handleChange}
                  required
                  placeholder="admin@acme.com"
                />
                <Input
                  label="Password"
                  name="adminPassword"
                  type="password"
                  value={formData.adminPassword}
                  onChange={handleChange}
                  required
                  minLength={6}
                  placeholder="Min. 6 characters"
                />
              </div>
            </div>

            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full"
            >
              Create Organization
              <ArrowRight size={16} className="ml-2" />
            </Button>
          </form>

          {/* Footer link */}
          <p className="text-sm text-center" style={{ color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link href="/login" className="font-semibold" style={{ color: 'var(--primary)' }}>
              Sign in
            </Link>
          </p>
          </div>
        </div>
      </div>
    </main>
  </div>
);
}
