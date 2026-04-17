'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { aiService } from '@/lib/services';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import {
  ShieldAlert,
  AlertTriangle,
  TrendingUp,
  Calendar,
  RefreshCw,
  Activity,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Users,
  Clock,
  Zap,
  Filter,
  Brain,
} from 'lucide-react';

interface RiskFlag {
  label: string;
  value: string;
}

interface AbsenteeismAlert {
  _id: string;
  userId: string;
  employeeName: string;
  department: string;
  riskLevel: 'high' | 'medium' | 'low';
  riskScore: number;
  flags: RiskFlag[];
  aiSummary: string;
  provider: string;
  periodStart: string;
  periodEnd: string;
  createdAt: string;
}

const riskConfig = {
  high: {
    label: 'High Risk',
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.08)',
    borderColor: 'rgba(239, 68, 68, 0.2)',
    icon: '🔴',
    gradient: 'linear-gradient(135deg, #ef4444, #dc2626)',
  },
  medium: {
    label: 'Medium Risk',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.08)',
    borderColor: 'rgba(245, 158, 11, 0.2)',
    icon: '🟡',
    gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
  },
  low: {
    label: 'Low Risk',
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.08)',
    borderColor: 'rgba(16, 185, 129, 0.2)',
    icon: '🟢',
    gradient: 'linear-gradient(135deg, #10b981, #059669)',
  },
};

export default function AbsenteeismAlertsPage() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<AbsenteeismAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [filterLevel, setFilterLevel] = useState<string>('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [lastRunInfo, setLastRunInfo] = useState<{ generated: number; periodStart: string; periodEnd: string } | null>(null);

  const loadAlerts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await aiService.getAbsenteeismAlerts({
        riskLevel: filterLevel || undefined,
      });
      setAlerts(data || []);
    } catch (err: any) {
      console.error('Failed to load alerts:', err);
    } finally {
      setLoading(false);
    }
  }, [filterLevel]);

  useEffect(() => {
    if (user && ['org_admin', 'hr_manager'].includes(user.role)) {
      loadAlerts();
    }
  }, [user, loadAlerts]);

  const handleRunAnalysis = async () => {
    if (running) return;
    setRunning(true);
    try {
      const result = await aiService.runAbsenteeismAnalysis();
      setLastRunInfo(result);
      await loadAlerts();
    } catch (err: any) {
      console.error('Analysis failed:', err);
    } finally {
      setRunning(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  // Count by risk level
  const highCount = alerts.filter((a) => a.riskLevel === 'high').length;
  const mediumCount = alerts.filter((a) => a.riskLevel === 'medium').length;
  const lowCount = alerts.filter((a) => a.riskLevel === 'low').length;

  // Access guard
  if (user && !['org_admin', 'hr_manager'].includes(user.role)) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-6">
        <div className="h-20 w-20 rounded-3xl flex items-center justify-center text-4xl"
          style={{ background: 'var(--surface-secondary)' }}>
          🔒
        </div>
        <p className="text-lg font-bold" style={{ color: 'var(--text-secondary)' }}>
          Admin or HR access required
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      {/* ── Header Banner ── */}
      <div
        className="relative overflow-hidden rounded-2xl p-6 md:p-8 text-white"
        style={{
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
          boxShadow: '0 12px 40px -8px rgba(99, 102, 241, 0.4)',
        }}
      >
        <div className="absolute top-0 right-0 -mr-16 -mt-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-12 -mb-12 h-40 w-40 rounded-full bg-white/5 blur-2xl" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
              <Brain size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight">
                Absenteeism Risk Alerts
              </h1>
              <p className="text-sm font-medium text-white/60 mt-1">
                AI-powered pattern detection • Last 90 days analysis
              </p>
            </div>
          </div>

          <button
            onClick={handleRunAnalysis}
            disabled={running}
            className={cn(
              'flex items-center gap-3 px-6 py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all duration-300',
              running
                ? 'bg-white/20 cursor-not-allowed'
                : 'bg-white/20 hover:bg-white/30 active:scale-95 backdrop-blur-sm border border-white/20',
            )}
          >
            <RefreshCw size={18} className={cn(running && 'animate-spin')} />
            {running ? 'Analyzing...' : 'Run Analysis Now'}
          </button>
        </div>
      </div>

      {/* ── Run Result Toast ── */}
      {lastRunInfo && (
        <div
          className="rounded-xl p-4 flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-500"
          style={{
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
          }}
        >
          <div className="h-10 w-10 rounded-xl flex items-center justify-center text-white"
            style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
            <Sparkles size={20} />
          </div>
          <div className="flex-1">
            <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
              Analysis complete — {lastRunInfo.generated} risk alert{lastRunInfo.generated !== 1 ? 's' : ''} generated
            </p>
            <p className="text-xs font-medium mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Period: {new Date(lastRunInfo.periodStart).toLocaleDateString()} → {new Date(lastRunInfo.periodEnd).toLocaleDateString()}
            </p>
          </div>
          <button onClick={() => setLastRunInfo(null)} className="text-sm font-bold px-3 py-1 rounded-lg hover:opacity-70 transition-opacity"
            style={{ color: '#10b981' }}>
            Dismiss
          </button>
        </div>
      )}

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <SummaryCard icon={<Users size={24} />} label="Total Flagged" value={alerts.length} color="#6366f1" />
        <SummaryCard icon={<ShieldAlert size={24} />} label="High Risk" value={highCount} color="#ef4444" />
        <SummaryCard icon={<AlertTriangle size={24} />} label="Medium Risk" value={mediumCount} color="#f59e0b" />
        <SummaryCard icon={<Activity size={24} />} label="Low Risk" value={lowCount} color="#10b981" />
      </div>

      {/* ── Filter Bar ── */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl"
          style={{ background: 'var(--surface-secondary)', color: 'var(--text-secondary)' }}>
          <Filter size={16} />
          <span className="text-xs font-bold uppercase tracking-widest">Risk Level</span>
        </div>
        {['', 'high', 'medium', 'low'].map((level) => (
          <button
            key={level}
            onClick={() => setFilterLevel(level)}
            className={cn(
              'px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300',
              filterLevel === level
                ? 'text-white shadow-lg'
                : 'hover:opacity-80',
            )}
            style={
              filterLevel === level
                ? {
                    background: level ? riskConfig[level as keyof typeof riskConfig]?.gradient : 'var(--primary)',
                    boxShadow: `0 4px 15px ${level ? riskConfig[level as keyof typeof riskConfig]?.borderColor : 'var(--primary-shadow)'}`,
                  }
                : {
                    background: 'var(--surface)',
                    border: `1px solid var(--border-light)`,
                    color: 'var(--text-secondary)',
                  }
            }
          >
            {level ? riskConfig[level as keyof typeof riskConfig]?.label : 'All'}
          </button>
        ))}
      </div>

      {/* ── Alert Cards ── */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="shimmer h-28 rounded-2xl" />
          ))}
        </div>
      ) : alerts.length === 0 ? (
        <EmptyState onRun={handleRunAnalysis} running={running} />
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <AlertCard
              key={alert._id}
              alert={alert}
              isExpanded={expandedId === alert._id}
              onToggle={() => toggleExpand(alert._id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Summary Card Component ─────────────────────────────────────────────────
function SummaryCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div
      className="modern-card p-5 flex items-center gap-4 transition-all duration-300 hover:-translate-y-1"
    >
      <div
        className="h-12 w-12 rounded-xl flex items-center justify-center text-white shrink-0"
        style={{ background: `linear-gradient(135deg, ${color}, ${color}dd)`, boxShadow: `0 6px 20px ${color}33` }}
      >
        {icon}
      </div>
      <div>
        <p className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>{value}</p>
        <p className="text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: 'var(--text-muted)' }}>{label}</p>
      </div>
    </div>
  );
}

// ─── Alert Card Component ───────────────────────────────────────────────────
function AlertCard({
  alert,
  isExpanded,
  onToggle,
}: {
  alert: AbsenteeismAlert;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const config = riskConfig[alert.riskLevel];

  return (
    <div
      className="modern-card overflow-hidden transition-all duration-500"
      style={{
        borderLeft: `4px solid ${config.color}`,
      }}
    >
      {/* Main Row */}
      <button
        onClick={onToggle}
        className="w-full text-left p-5 md:p-6 flex items-center gap-4 md:gap-6 hover:bg-opacity-50 transition-colors duration-200"
        style={{ background: isExpanded ? config.bgColor : 'transparent' }}
      >
        {/* Risk Score Circle */}
        <div className="relative shrink-0">
          <div
            className="h-16 w-16 rounded-2xl flex flex-col items-center justify-center text-white font-black"
            style={{
              background: config.gradient,
              boxShadow: `0 6px 20px ${config.borderColor}`,
            }}
          >
            <span className="text-xl leading-none">{alert.riskScore}</span>
            <span className="text-[8px] font-bold uppercase tracking-widest opacity-70 mt-0.5">Score</span>
          </div>
        </div>

        {/* Employee Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="text-lg font-black truncate" style={{ color: 'var(--text-primary)' }}>
              {alert.employeeName}
            </h3>
            <span
              className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest"
              style={{
                background: config.bgColor,
                color: config.color,
                border: `1px solid ${config.borderColor}`,
              }}
            >
              {config.label}
            </span>
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] mt-1.5" style={{ color: 'var(--text-muted)' }}>
            {alert.department}
          </p>
          {/* AI Summary (always visible) */}
          <p className="text-sm mt-2 leading-relaxed line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
            <Sparkles size={13} className="inline-block mr-1 opacity-60" style={{ color: config.color }} />
            {alert.aiSummary}
          </p>
        </div>

        {/* Expand Toggle */}
        <div className="shrink-0 flex items-center gap-2">
          <span className="hidden md:inline-block text-xs font-bold uppercase tracking-widest"
            style={{ color: 'var(--text-muted)' }}>
            {alert.flags.length} Flag{alert.flags.length !== 1 ? 's' : ''}
          </span>
          <div
            className="h-8 w-8 rounded-lg flex items-center justify-center transition-transform duration-300"
            style={{
              background: 'var(--surface-secondary)',
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          >
            <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} />
          </div>
        </div>
      </button>

      {/* Expanded Flags Section */}
      <div
        className={cn(
          'overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]',
          isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0',
        )}
      >
        <div className="px-5 md:px-6 pb-5 md:pb-6 pt-2">
          <div className="border-t pt-5" style={{ borderColor: 'var(--border-light)' }}>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-2"
              style={{ color: 'var(--text-muted)' }}>
              <Zap size={12} />
              Detected Risk Signals
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {alert.flags.map((flag, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl flex items-start gap-3 transition-all duration-200"
                  style={{
                    background: config.bgColor,
                    border: `1px solid ${config.borderColor}`,
                  }}
                >
                  <div className="h-2 w-2 rounded-full mt-1.5 shrink-0" style={{ background: config.color }} />
                  <div className="min-w-0">
                    <p className="text-xs font-black uppercase tracking-wider" style={{ color: config.color }}>
                      {flag.label}
                    </p>
                    <p className="text-xs font-medium mt-1 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      {flag.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Meta info */}
            <div className="flex items-center gap-5 mt-5 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5"
                style={{ color: 'var(--text-muted)' }}>
                <Clock size={11} />
                {new Date(alert.periodStart).toLocaleDateString()} – {new Date(alert.periodEnd).toLocaleDateString()}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5"
                style={{ color: 'var(--text-muted)' }}>
                <Brain size={11} />
                Provider: {alert.provider}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5"
                style={{ color: 'var(--text-muted)' }}>
                <Calendar size={11} />
                Generated: {new Date(alert.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Empty State ────────────────────────────────────────────────────────────
function EmptyState({ onRun, running }: { onRun: () => void; running: boolean }) {
  return (
    <div className="modern-card py-20 flex flex-col items-center justify-center text-center space-y-6">
      <div className="relative">
        <div
          className="h-24 w-24 rounded-3xl flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.1))',
          }}
        >
          <ShieldAlert size={48} style={{ color: 'var(--primary)', opacity: 0.5 }} />
        </div>
        <div
          className="absolute -bottom-1 -right-1 h-8 w-8 rounded-lg flex items-center justify-center text-white"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
        >
          <Sparkles size={14} />
        </div>
      </div>
      <div>
        <h3 className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>
          No Risk Alerts Yet
        </h3>
        <p className="text-sm font-medium mt-2 max-w-md" style={{ color: 'var(--text-muted)' }}>
          Run the AI-powered absenteeism analysis to detect patterns like Monday/Friday leaves, 
          bridge holidays, increasing frequency, and balance exhaustion.
        </p>
      </div>
      <button
        onClick={onRun}
        disabled={running}
        className="flex items-center gap-3 px-8 py-3.5 rounded-xl text-white font-bold text-sm transition-all duration-300 hover:-translate-y-0.5 active:scale-95"
        style={{
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          boxShadow: '0 8px 25px rgba(99, 102, 241, 0.3)',
        }}
      >
        <RefreshCw size={18} className={cn(running && 'animate-spin')} />
        {running ? 'Running Analysis...' : 'Generate Risk Alerts'}
      </button>
    </div>
  );
}
