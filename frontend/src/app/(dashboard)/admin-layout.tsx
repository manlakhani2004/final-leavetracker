'use client';

import React from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from 'react-hot-toast';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <AuthProvider>
      <div className="h-screen flex overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900">
        {/* Mobile sidebar */}
        <div className={`lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
          <div className="fixed inset-0 flex z-40">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)}></div>
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-gradient-to-b from-indigo-800 to-purple-800 shadow-2xl">
              <Sidebar role="org_admin" />
            </div>
          </div>
        </div>

        {/* Desktop sidebar */}
        <div className="hidden lg:flex lg:flex-shrink-0">
          <div className="flex flex-col w-72">
            <div className="flex flex-col h-0 border-r border-indigo-700/30 bg-gradient-to-b from-slate-900 via-indigo-900 to-purple-900 shadow-2xl">
              <div className="flex items-center justify-center h-20 border-b border-indigo-700/30">
                <h1 className="text-2xl font-bold text-white">🏢 Admin Panel</h1>
              </div>
              <div className="flex-1 flex flex-col overflow-y-auto">
                <Sidebar role="org_admin" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col w-0 flex-1 overflow-hidden">
          <Topbar onMenuClick={() => setSidebarOpen(true)} theme="admin" />
          
          <main className="flex-1 relative overflow-y-auto focus:outline-none p-8">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
      <Toaster position="top-right" />
    </AuthProvider>
  );
}
