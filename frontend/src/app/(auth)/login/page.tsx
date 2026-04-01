'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import toast from 'react-hot-toast';
import { ArrowRight, ShieldCheck, Clock, BarChart3, CalendarDays } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (error: any) {
      const msg = error.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg[0] : (msg || 'Login failed'));
      console.error('Login error:', error);
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
          <div className="absolute -top-16 -left-16 w-56 h-56 rounded-full bg-white/10" />
          <div className="absolute bottom-16 -right-12 w-44 h-44 rounded-full bg-white/10" />

          {/* Logo */}
          <div className="relative z-10 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <CalendarDays className="text-white" size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white leading-none">Leave Tracker</h2>
              <p className="text-[9px] font-medium text-white/60 uppercase tracking-widest mt-0.5">Employee Portal</p>
            </div>
          </div>

          {/* Main Content */}
          <div className="relative z-10 space-y-5">
            <div>
              <h1 className="text-2xl font-bold text-white leading-tight">
                Streamlined Leave<br />
                <span className="text-white/70">Management.</span>
              </h1>
              <p className="text-white/60 mt-3 text-xs leading-relaxed max-w-[260px]">
                Track balances, submit requests, and manage approvals — all from one simple dashboard.
              </p>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-md bg-white/15 flex items-center justify-center">
                  <ShieldCheck size={14} className="text-white/80" />
                </div>
                <span className="text-xs text-white/80 font-medium">Role-based secure access</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-md bg-white/15 flex items-center justify-center">
                  <Clock size={14} className="text-white/80" />
                </div>
                <span className="text-xs text-white/80 font-medium">Fast daily operations</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-md bg-white/15 flex items-center justify-center">
                  <BarChart3 size={14} className="text-white/80" />
                </div>
                <span className="text-xs text-white/80 font-medium">Real-time analytics & reports</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="relative z-10">
            <p className="text-[10px] text-white/40">© 2026 Leave Tracker</p>
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="flex-1 flex items-center justify-center p-8 sm:p-10">
          <div className="w-full max-w-sm space-y-6">
            
            {/* Mobile logo */}
            <div className="lg:hidden flex items-center gap-3 justify-center mb-2">
              <div className="h-9 w-9 rounded-lg flex items-center justify-center" style={{ background: 'var(--primary)', color: 'white' }}>
                <CalendarDays size={18} />
              </div>
              <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Leave Tracker</h2>
            </div>

            {/* Header */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest mb-1.5" style={{ color: 'var(--primary)' }}>
                Sign In
              </p>
              <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Welcome back
              </h1>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                Sign in to access your leave dashboard.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@company.com"
              />
              <div className="space-y-1">
                <Input
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                />
                <div className="flex justify-end">
                  <Link href="/forgot-password" style={{ color: 'var(--primary)' }} className="text-xs font-semibold hover:underline">
                    Forgot password?
                  </Link>
                </div>
              </div>

              <Button
                type="submit"
                isLoading={isLoading}
                className="w-full"
              >
                Sign In
                <ArrowRight size={16} className="ml-2" />
              </Button>
            </form>

            {/* Footer link */}
            <p className="text-sm text-center" style={{ color: 'var(--text-muted)' }}>
              Don't have an account?{' '}
              <Link href="/register" className="font-semibold" style={{ color: 'var(--primary)' }}>
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  </div>
);
}
