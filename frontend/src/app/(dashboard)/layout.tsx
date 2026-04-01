'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Toaster } from 'react-hot-toast';

interface RoleConfig {
  theme: 'admin' | 'hr' | 'manager' | 'employee';
  title: string;
  icon: string;
}

const roleConfigs: Record<string, RoleConfig> = {
  org_admin: {
    theme: 'admin',
    title: 'Admin',
    icon: '🏢',
  },
  hr_manager: {
    theme: 'hr',
    title: 'HR',
    icon: '👔',
  },
  manager: {
    theme: 'manager',
    title: 'Manager',
    icon: '👥',
  },
  employee: {
    theme: 'employee',
    title: 'Staff',
    icon: '🌟',
  }
};

function RoleBasedLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const router = useRouter();

  React.useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: 'var(--background)' }}>
        <div className="relative h-16 w-16">
          <div className="absolute inset-0 rounded-full border-4 opacity-20" style={{ borderColor: 'var(--primary-light)' }}></div>
          <div className="absolute inset-0 rounded-full border-4 border-transparent animate-spin" style={{ borderTopColor: 'var(--primary)' }}></div>
        </div>
      </div>
    );
  }

  const config = user?.role ? (roleConfigs[user.role] || roleConfigs.employee) : roleConfigs.employee;

  return (
    <div className="h-screen flex overflow-hidden" style={{ background: 'var(--background)' }}>
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 backdrop-blur-sm z-40 lg:hidden"
          style={{ background: 'var(--modal-overlay)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 transform transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] lg:hidden",
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="h-full w-80 shadow-2xl flex flex-col" style={{ background: 'var(--sidebar)' }}>
          <div 
            className="relative overflow-hidden py-7 px-6"
            style={{ background: `linear-gradient(135deg, var(--primary-gradient-from), var(--primary-gradient-to))` }}
          >
            <div 
              className="absolute -top-8 -right-8 w-28 h-28 rounded-full opacity-15"
              style={{ background: '#fff' }}
            />
            <div className="relative flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-xl">
                {config.icon}
              </div>
              <div>
                <h1 className="text-lg font-bold text-white tracking-tight leading-none">{config.title}</h1>
                <p className="text-[10px] font-medium text-white/60 mt-0.5 uppercase tracking-widest">Leave Tracker</p>
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            <Sidebar collapsed={false} onToggle={() => setSidebarOpen(false)} theme={config.theme} />
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div 
          className={cn(
            "flex flex-col transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] border-r shadow-xl",
            sidebarCollapsed ? "w-24" : "w-80"
          )}
          style={{ 
            background: 'var(--sidebar)', 
            borderColor: 'var(--border-light)',
            boxShadow: `0 20px 25px -5px var(--card-shadow)`
          }}
        >
          {/* Logo Section */}
          <div 
            className="relative overflow-hidden transition-all duration-500"
            style={{ 
              background: `linear-gradient(135deg, var(--primary-gradient-from), var(--primary-gradient-to))`,
              padding: sidebarCollapsed ? '20px 0' : '28px 24px',
            }}
          >
            {/* Decorative bg circle */}
            <div 
              className="absolute -top-8 -right-8 w-28 h-28 rounded-full opacity-15"
              style={{ background: '#fff' }}
            />
            {!sidebarCollapsed ? (
              <div className="relative flex items-center gap-3 animate-in fade-in duration-300">
                <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-xl">
                  {config.icon}
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white tracking-tight leading-none">
                    {config.title}
                  </h1>
                  <p className="text-[10px] font-medium text-white/60 mt-0.5 uppercase tracking-widest">Leave Tracker</p>
                </div>
              </div>
            ) : (
              <div className="flex justify-center animate-in fade-in duration-300">
                <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-xl">
                  {config.icon}
                </div>
              </div>
            )}
          </div>
          
          {/* Navigation */}
          <div className="flex-1 overflow-y-auto">
            <Sidebar 
              collapsed={sidebarCollapsed} 
              onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
              theme={config.theme}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <Topbar onMenuClick={() => setSidebarOpen(true)} theme={config.theme} />
        
        <main className="flex-1 relative overflow-y-auto focus:outline-none scroll-smooth">
          <div className="p-8 sm:p-12 lg:p-16">
            <div className={cn(
              "mx-auto",
              user?.role === 'org_admin' ? "max-w-7xl" :
              user?.role === 'hr_manager' ? "max-w-6xl" :
              "max-w-5xl"
            )}>
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <RoleBasedLayout>{children}</RoleBasedLayout>
      <Toaster position="top-right" />
    </AuthProvider>
  );
}
