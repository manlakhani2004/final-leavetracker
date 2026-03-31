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
  bgGradient: string;
}

const roleConfigs: Record<string, RoleConfig> = {
  org_admin: {
    theme: 'admin',
    title: 'Admin',
    icon: '🏢',
    bgGradient: 'from-slate-50 via-indigo-50/10 to-white',
  },
  hr_manager: {
    theme: 'hr',
    title: 'HR',
    icon: '👔',
    bgGradient: 'from-rose-50 via-pink-50/10 to-white',
  },
  manager: {
    theme: 'manager',
    title: 'Manager',
    icon: '👥',
    bgGradient: 'from-blue-50 via-cyan-50/10 to-white',
  },
  employee: {
    theme: 'employee',
    title: 'Staff',
    icon: '🌟',
    bgGradient: 'from-emerald-50 via-green-50/10 to-white',
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
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="relative h-16 w-16">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-100 opacity-20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-indigo-600 animate-spin"></div>
        </div>
      </div>
    );
  }

  const config = user?.role ? (roleConfigs[user.role] || roleConfigs.employee) : roleConfigs.employee;

  return (
    <div className={cn("h-screen flex overflow-hidden bg-gradient-to-br", config.bgGradient)}>
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 transform transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] lg:hidden",
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="h-full w-80 bg-white shadow-2xl flex flex-col">
          <div className={cn(
            "flex items-center justify-center h-24 gap-3 bg-gradient-to-r",
            config.theme === 'admin' ? 'from-indigo-600 to-purple-600' :
            config.theme === 'hr' ? 'from-rose-500 to-pink-600' :
            config.theme === 'manager' ? 'from-blue-600 to-cyan-600' :
            'from-emerald-600 to-teal-600'
          )}>
            <span className="text-3xl">{config.icon}</span>
            <h1 className="text-2xl font-black text-white tracking-tight">{config.title}</h1>
          </div>
          <div className="flex-1 overflow-y-auto">
            <Sidebar collapsed={false} onToggle={() => setSidebarOpen(false)} theme={config.theme} />
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className={cn(
          "flex flex-col transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] bg-white border-r border-slate-200/50 shadow-xl shadow-slate-200/40",
          sidebarCollapsed ? "w-24" : "w-80"
        )}>
          {/* Logo Section */}
          <div className={cn(
            "flex items-center justify-center h-24 overflow-hidden bg-gradient-to-r transition-all duration-500",
            config.theme === 'admin' ? 'from-indigo-600 to-purple-600' :
            config.theme === 'hr' ? 'from-rose-500 to-pink-600' :
            config.theme === 'manager' ? 'from-blue-600 to-cyan-600' :
            'from-emerald-600 to-teal-600'
          )}>
            {!sidebarCollapsed ? (
              <div className="flex items-center gap-3 animate-in fade-in zoom-in duration-500">
                <span className="text-3xl">{config.icon}</span>
                <h1 className="text-2xl font-black text-white tracking-tight leading-none pt-1">
                  {config.title}
                </h1>
              </div>
            ) : (
              <span className="text-3xl animate-in fade-in zoom-in duration-500">
                {config.icon}
              </span>
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
