'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: number | string;
  subtitle?: string;
  color: 'indigo' | 'emerald' | 'rose' | 'amber' | 'blue' | 'purple';
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const colorStyles = {
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', shadow: 'shadow-indigo-100', iconBg: 'bg-indigo-100/50', accent: 'bg-indigo-600' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', shadow: 'shadow-emerald-100', iconBg: 'bg-emerald-100/50', accent: 'bg-emerald-600' },
  rose: { bg: 'bg-rose-50', text: 'text-rose-600', shadow: 'shadow-rose-100', iconBg: 'bg-rose-100/50', accent: 'bg-rose-600' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-600', shadow: 'shadow-amber-100', iconBg: 'bg-amber-100/50', accent: 'bg-amber-600' },
  blue: { bg: 'bg-blue-50', text: 'text-blue-600', shadow: 'shadow-blue-100', iconBg: 'bg-blue-100/50', accent: 'bg-blue-600' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-600', shadow: 'shadow-purple-100', iconBg: 'bg-purple-100/50', accent: 'bg-purple-600' },
};

export function StatCard({ 
  icon, 
  title, 
  value, 
  subtitle, 
  color, 
  trend 
}: StatCardProps) {
  const styles = colorStyles[color] || colorStyles.indigo;

  return (
    <div className="modern-card p-6 flex flex-col group hover:-translate-y-2 transition-all duration-500">
      <div className="flex items-center justify-between mb-6">
        <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110", styles?.bg || 'bg-slate-50', styles?.text || 'text-slate-600')}>
          {icon}
        </div>
        {trend && (
          <div className={cn(
            "flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black tracking-wide",
            trend.isPositive ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
          )}>
            {trend.isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {Math.abs(trend.value)}%
          </div>
        )}
      </div>
      
      <div className="space-y-1">
        <p className="text-4xl font-black text-slate-900 tracking-tight">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{title}</p>
        {subtitle && (
          <p className="text-xs font-semibold text-slate-500 pt-2 flex items-center gap-2">
            <span className={cn("h-1.5 w-1.5 rounded-full", styles.accent || 'bg-slate-300')} />
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

interface QuickActionCardProps {
  icon: string;
  title: string;
  description: string;
  href: string;
  color?: string;
  badge?: number;
}

export function QuickActionCard({ 
  icon, 
  title, 
  description, 
  href, 
  color, 
  badge
}: QuickActionCardProps) {
  return (
    <Link href={href} className="group">
      <div className="modern-card p-5 h-full relative overflow-hidden group-hover:border-indigo-200 transition-all duration-500">
        <div className="absolute -right-6 -top-6 h-24 w-24 bg-slate-50 rounded-full group-hover:bg-indigo-50/50 transition-colors" />
        
        {badge !== undefined && badge > 0 && (
          <div className="absolute top-4 right-4 bg-rose-500 text-white text-[10px] font-black rounded-lg px-2 py-1 shadow-lg shadow-rose-200 animate-bounce">
            {badge} Action Required
          </div>
        )}

        <div className="relative">
          <div className="text-4xl mb-4 group-hover:scale-125 transition-transform duration-500 origin-left inline-block">{icon}</div>
          <h3 className="font-black text-slate-900 leading-tight mb-1 group-hover:text-indigo-600 transition-colors">{title}</h3>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider leading-relaxed">{description}</p>
        </div>
      </div>
    </Link>
  );
}

export function ActivityItem({ icon, title, description, time, color }: any) {
  return (
    <div className="flex items-start gap-5 p-5 rounded-2xl hover:bg-slate-50 transition-all duration-300 group">
      <div className={cn(
        "h-12 w-12 rounded-2xl flex items-center justify-center text-xl flex-shrink-0 transition-all group-hover:scale-110",
        color
      )}>
        {icon}
      </div>
      <div className="flex-1 min-w-0 pt-0.5">
        <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{title}</p>
        <p className="text-xs font-semibold text-slate-500 mt-1 leading-relaxed line-clamp-2">{description}</p>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 mt-3">{time}</p>
      </div>
    </div>
  );
}
