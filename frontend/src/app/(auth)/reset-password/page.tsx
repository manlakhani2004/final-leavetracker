'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import toast from 'react-hot-toast';
import { authService } from '@/lib/services';
import { CalendarDays, ArrowLeft, ArrowRight, ShieldCheck, CheckCircle } from 'lucide-react';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error('Invalid reset link. Token is missing.');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      await authService.resetPassword(token, password);
      toast.success('Password reset successfully!');
      router.push('/login');
    } catch (error: any) {
      const msg = error.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg[0] : (msg || 'Failed to reset password. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  const isComplete = password && confirmPassword && password.length >= 6 && password === confirmPassword;

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
                <p className="text-[9px] font-medium text-white/60 uppercase tracking-widest mt-0.5">Password Reset</p>
              </div>
            </div>

            {/* Main Content */}
            <div className="relative z-10 space-y-5">
              <div>
                <h1 className="text-2xl font-bold text-white leading-tight">
                  Reset Your Password<br />
                  <span className="text-white/70">and regain access.</span>
                </h1>
                <p className="text-white/60 mt-3 text-xs leading-relaxed max-w-[280px]">
                  Create a new secure password. Make sure it's strong and memorable.
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-md bg-white/15 flex items-center justify-center">
                    <ShieldCheck size={14} className="text-white/80" />
                  </div>
                  <span className="text-xs text-white/80 font-medium">Secure password encryption</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-md bg-white/15 flex items-center justify-center">
                    <CheckCircle size={14} className="text-white/80" />
                  </div>
                  <span className="text-xs text-white/80 font-medium">Instant account recovery</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="relative z-10">
              <p className="text-[10px] text-white/40">© 2026 Leave Tracker</p>
            </div>
          </div>

          {/* Right Panel - Form */}
          <div className="flex-1 flex flex-col justify-center p-8 sm:p-12" style={{ paddingLeft: 'clamp(2rem, 5vw, 4rem)', paddingRight: 'clamp(2rem, 5vw, 4rem)' }}>
            <div className="w-full max-w-sm ml-0 lg:ml-6 space-y-6">
              
              {/* Mobile logo */}
              <div className="lg:hidden flex items-center justify-center gap-3 mb-4">
                <div className="h-9 w-9 rounded-lg flex items-center justify-center" style={{ background: 'var(--primary)', color: 'white' }}>
                  <CalendarDays size={18} />
                </div>
                <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Leave Tracker</h2>
              </div>

              {/* Header */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest mb-1.5" style={{ color: 'var(--primary)' }}>
                  Password Reset
                </p>
                <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  Create a new password
                </h1>
                <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                  Your new password must be securely formed with at least 6 characters.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                  label="New Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Min. 6 characters"
                  minLength={6}
                />
                
                <Input
                  label="Confirm Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Repeat new password"
                  minLength={6}
                />

                <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                  <Link 
                    href="/login" 
                    className="w-full sm:w-auto flex justify-center items-center gap-2 py-2.5 px-4 rounded-lg border text-sm font-semibold transition-colors"
                    style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                  >
                    <ArrowLeft size={16} />
                    Back
                  </Link>
                  
                  <Button
                    type="submit"
                    isLoading={isLoading}
                    disabled={!isComplete}
                    className="w-full sm:ml-auto"
                  >
                    Reset Password
                    <ArrowRight size={16} className="ml-2" />
                  </Button>
                </div>
              </form>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
