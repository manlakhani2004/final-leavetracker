'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import toast from 'react-hot-toast';
import { authService } from '@/lib/services';
import { CalendarDays, ArrowLeft, ArrowRight, ShieldCheck, MailCheck, LockKeyhole } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setIsLoading(true);
    try {
      await authService.forgotPassword(email);
      setIsSent(true);
      toast.success('Password reset link sent to your email');
    } catch (error: any) {
      const msg = error.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg[0] : (msg || 'Failed to send reset link'));
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
                <p className="text-[9px] font-medium text-white/60 uppercase tracking-widest mt-0.5">Password Recovery</p>
              </div>
            </div>

            {/* Main Content */}
            <div className="relative z-10 space-y-5">
              <div>
                <h1 className="text-2xl font-bold text-white leading-tight">
                  Account Recovery<br />
                  <span className="text-white/70">made simple & secure.</span>
                </h1>
                <p className="text-white/60 mt-3 text-xs leading-relaxed max-w-[280px]">
                  We'll send a secure link to your registered email so you can regain access to your dashboard quickly.
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-md bg-white/15 flex items-center justify-center">
                    <ShieldCheck size={14} className="text-white/80" />
                  </div>
                  <span className="text-xs text-white/80 font-medium">Verify your identity securely</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-md bg-white/15 flex items-center justify-center">
                    <MailCheck size={14} className="text-white/80" />
                  </div>
                  <span className="text-xs text-white/80 font-medium">Receive a reset link via email</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-md bg-white/15 flex items-center justify-center">
                    <LockKeyhole size={14} className="text-white/80" />
                  </div>
                  <span className="text-xs text-white/80 font-medium">Set a strong new password</span>
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
                  Forgot Password
                </p>
                <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  Reset your password
                </h1>
                <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                  {!isSent 
                    ? "Enter your email address and we'll send you a link to reset your password."
                    : "Check your email for a link to reset your password. If it doesn't appear within a few minutes, check your spam folder."}
                </p>
              </div>

              {/* Form or Success State */}
              {!isSent ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    label="Email Address"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@company.com"
                  />
                  
                  <Button
                    type="submit"
                    isLoading={isLoading}
                    className="w-full"
                  >
                    Send Reset Link
                    <ArrowRight size={16} className="ml-2" />
                  </Button>
                </form>
              ) : (
                <div className="p-4 rounded-xl border border-green-200 bg-green-50 text-green-800 flex flex-col items-center justify-center py-6 text-center space-y-3">
                  <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                    <MailCheck size={24} className="text-green-600" />
                  </div>
                  <p className="text-sm font-medium">Link sent to {email}</p>
                </div>
              )}

              {/* Back to sign in */}
              <div className="pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                <Link 
                  href="/login" 
                  className="w-full flex justify-center items-center gap-2 py-2.5 rounded-lg border text-sm font-semibold transition-colors"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                >
                  <ArrowLeft size={16} />
                  Back to Log In
                </Link>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
