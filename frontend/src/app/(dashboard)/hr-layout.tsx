'use client';

import React from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from 'react-hot-toast';

export default function HRLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <AuthProvider>
      <div className="h-screen flex overflow-hidden bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
        {/* Mobile sidebar */}
        <div className={`lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
          <div className="fixed inset-0 flex z-40">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)}></div>
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-xl border-r border-pink-200">
              <Sidebar role="hr_manager" />
            </div>
          </div>
        </div>

        {/* Desktop sidebar */}
        <div className="hidden lg:flex lg:flex-shrink-0">
          <div className="flex flex-col w-64">
            <div className="flex flex-col h-0 border-r border-pink-200 bg-white shadow-lg">
              <div className="flex items-center justify-center h-20 border-b border-pink-100">
                <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">
                  👔 HR Portal
                </h1>
              </div>
              <div className="flex-1 flex flex-col overflow-y-auto p-4">
                <Sidebar role="hr_manager" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col w-0 flex-1 overflow-hidden">
          <Topbar onMenuClick={() => setSidebarOpen(true)} theme="hr" />
          
          <main className="flex-1 relative overflow-y-auto focus:outline-none p-6">
            <div className="max-w-6xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
      <Toaster position="top-right" />
    </AuthProvider>
  );
}
