'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import {
  BarChart3,
  PieChart,
  Users,
  Calendar,
  ArrowRight,
  TrendingUp,
  FileText,
  Clock,
} from 'lucide-react';

interface ReportCard {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: any;
  gradient: string;
  roles: string[];
  tag?: string;
}

const reportCards: ReportCard[] = [
  {
    id: 'my-balance',
    title: 'My Leave Balance',
    description: 'Detailed breakdown of your personal leave balance across all leave types with utilization percentages.',
    href: '/reports/my-balance',
    icon: PieChart,
    gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    roles: ['all'],
    tag: 'Personal',
  },
  {
    id: 'my-history',
    title: 'My Leave History',
    description: 'Complete log of all your leave applications with monthly breakdown and status analysis.',
    href: '/reports/my-history',
    icon: Calendar,
    gradient: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
    roles: ['all'],
    tag: 'Personal',
  },
  {
    id: 'org-summary',
    title: 'Organization Summary',
    description: 'High-level snapshot of leave usage across the entire organization with trends and approval metrics.',
    href: '/reports/org-summary',
    icon: BarChart3,
    gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)',
    roles: ['org_admin', 'hr_manager'],
    tag: 'Admin',
  },
  {
    id: 'team-summary',
    title: 'Team Leave Summary',
    description: 'Overview of your team members\' leave usage, balances, and pending requests.',
    href: '/reports/team-summary',
    icon: Users,
    gradient: 'linear-gradient(135deg, #10b981, #059669)',
    roles: ['org_admin', 'hr_manager', 'manager'],
    tag: 'Manager',
  },
];

export default function ReportsHub() {
  const { user } = useAuth();

  const filteredReports = reportCards.filter((card) => {
    if (card.roles.includes('all')) return true;
    return user?.role && card.roles.includes(user.role);
  });

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div
            className="h-10 w-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, var(--primary-gradient-from), var(--primary-gradient-to))' }}
          >
            <BarChart3 size={20} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Reports
          </h1>
        </div>
        <p className="mt-1" style={{ color: 'var(--text-muted)' }}>
          Access detailed analytics and insights about leave data
        </p>
      </div>

      {/* Quick Stats Bar */}
      <div
        className="rounded-2xl p-6 flex flex-wrap items-center gap-8"
        style={{
          background: 'linear-gradient(135deg, var(--primary-gradient-from), var(--primary-gradient-to))',
        }}
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <FileText size={20} className="text-white" />
          </div>
          <div>
            <p className="text-white/70 text-xs font-semibold uppercase tracking-wider">Available Reports</p>
            <p className="text-white text-2xl font-bold">{filteredReports.length}</p>
          </div>
        </div>
        <div className="h-10 w-px bg-white/20 hidden sm:block" />
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <TrendingUp size={20} className="text-white" />
          </div>
          <div>
            <p className="text-white/70 text-xs font-semibold uppercase tracking-wider">Current Year</p>
            <p className="text-white text-2xl font-bold">{new Date().getFullYear()}</p>
          </div>
        </div>
        <div className="h-10 w-px bg-white/20 hidden sm:block" />
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Clock size={20} className="text-white" />
          </div>
          <div>
            <p className="text-white/70 text-xs font-semibold uppercase tracking-wider">Last Updated</p>
            <p className="text-white text-lg font-bold">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
          </div>
        </div>
      </div>

      {/* Report Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredReports.map((card, index) => (
          <Link key={card.id} href={card.href} className="block group">
            <div
              className="modern-card rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 h-full"
              style={{
                animationDelay: `${index * 100}ms`,
              }}
            >
              {/* Card top gradient bar */}
              <div className="h-1.5" style={{ background: card.gradient }} />

              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="h-12 w-12 rounded-xl flex items-center justify-center shadow-lg"
                    style={{ background: card.gradient }}
                  >
                    <card.icon size={22} className="text-white" />
                  </div>
                  {card.tag && (
                    <span
                      className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
                      style={{
                        background: 'var(--surface-secondary)',
                        color: 'var(--text-muted)',
                      }}
                    >
                      {card.tag}
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                  {card.title}
                </h3>
                <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-muted)' }}>
                  {card.description}
                </p>

                <div className="flex items-center gap-2 text-sm font-semibold group-hover:gap-3 transition-all duration-300" style={{ color: 'var(--primary)' }}>
                  <span>View Report</span>
                  <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
