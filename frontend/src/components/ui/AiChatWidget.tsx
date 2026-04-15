'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  provider?: 'ollama' | 'gemini';
  timestamp: Date;
}

// ─── Role-aware quick prompts ─────────────────────────────────────────────────
const ROLE_PROMPTS: Record<string, string[]> = {
  employee: [
    'How many sick leaves do I have left?',
    'When was my last approved leave?',
    'Draft a leave reason — I have a doctor appointment',
    'How many pending leaves do I have?',
  ],
  manager: [
    'Who on my team is on leave this week?',
    'How many leaves do I have left?',
    'Show me my team\'s leave summary',
    'Draft a leave reason — attending a conference',
  ],
  hr_manager: [
    'What\'s the absenteeism trend by department?',
    'Who on the team is on leave this week?',
    'How many leaves do I have left?',
    'Show me the leave utilization overview',
  ],
  org_admin: [
    'What\'s the absenteeism trend by department?',
    'Who is on leave this week across the org?',
    'How many leaves do I have left?',
    'Show me the org-wide leave summary',
  ],
};

const DEFAULT_PROMPTS = ROLE_PROMPTS.employee;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function formatTime(date: Date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// ─── Simple inline markdown rendering (bold, italic, bullets) ─────────────
function renderMarkdown(text: string) {
  // Split by lines, process each
  const lines = text.split('\n');
  return lines.map((line, i) => {
    // Bullet points
    const isBullet = /^[\s]*[-•*]\s+/.test(line);
    const cleanLine = isBullet ? line.replace(/^[\s]*[-•*]\s+/, '') : line;
    
    // Bold + italic
    let processed = cleanLine
      .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code style="background:rgba(99,102,241,0.12);padding:1px 5px;border-radius:4px;font-size:0.85em">$1</code>');

    if (isBullet) {
      return (
        <div key={i} className="flex items-start gap-2 ml-1 my-0.5">
          <span style={{ color: 'var(--primary)', fontSize: '8px', lineHeight: '20px' }}>●</span>
          <span dangerouslySetInnerHTML={{ __html: processed }} />
        </div>
      );
    }
    return (
      <span key={i}>
        <span dangerouslySetInnerHTML={{ __html: processed }} />
        {i < lines.length - 1 && <br />}
      </span>
    );
  });
}

// ─── Provider badge ───────────────────────────────────────────────────────────
function ProviderBadge({ provider }: { provider?: 'ollama' | 'gemini' }) {
  if (!provider) return null;
  const isOllama = provider === 'ollama';
  return (
    <span
      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider mt-1"
      style={{
        backgroundColor: isOllama ? 'rgba(99,102,241,0.1)' : 'rgba(16,185,129,0.1)',
        color: isOllama ? 'var(--primary)' : '#34d399',
        border: `1px solid ${isOllama ? 'rgba(99,102,241,0.2)' : 'rgba(16,185,129,0.2)'}`,
      }}
    >
      {isOllama ? '⚡ Ollama' : '✨ Gemini'}
    </span>
  );
}

// ─── Typing indicator ─────────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="flex items-end gap-2.5 mb-3 animate-fadeIn">
      <div
        className="h-8 w-8 rounded-full flex items-center justify-center text-sm shrink-0"
        style={{
          background: 'linear-gradient(135deg, var(--primary-gradient-from), var(--primary-gradient-to))',
          boxShadow: '0 4px 12px var(--primary-shadow)',
        }}
      >
        🤖
      </div>
      <div
        className="px-4 py-3 rounded-2xl rounded-bl-sm"
        style={{
          background: 'var(--surface-secondary)',
          border: '1px solid var(--border)',
        }}
      >
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full"
              style={{
                background: 'var(--primary)',
                animation: `aiDotBounce 1.2s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Status dot ───────────────────────────────────────────────────────────────
function StatusDot({ status }: { status: 'online' | 'offline' | 'checking' }) {
  const colors: Record<string, string> = {
    online: '#22c55e',
    offline: '#ef4444',
    checking: '#f59e0b',
  };
  return (
    <span
      className="inline-block h-2 w-2 rounded-full shrink-0"
      style={{
        backgroundColor: colors[status],
        boxShadow: `0 0 6px ${colors[status]}`,
        animation: status === 'checking' ? 'pulse 1.5s ease-in-out infinite' : undefined,
      }}
    />
  );
}

// ─── Main Widget ──────────────────────────────────────────────────────────────
export function AiChatWidget() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiStatus, setAiStatus] = useState<'online' | 'offline' | 'checking'>('checking');
  const [activeModel, setActiveModel] = useState('');
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const chatBodyRef = useRef<HTMLDivElement>(null);

  // Initialize welcome message
  useEffect(() => {
    if (user) {
      setMessages([
        {
          id: uid(),
          role: 'assistant',
          content: `Hi ${user.name?.split(' ')[0] || 'there'} 👋\n\nI'm **LeaveBot**, your AI leave assistant. I can help you with:\n\n- Check your **leave balances & history**\n- See **who's on leave** this week\n- **Draft professional leave reasons**\n- Answer questions about **team & org trends**\n\nWhat would you like to know?`,
          timestamp: new Date(),
        },
      ]);
    }
  }, [user]);

  // Check AI health when widget opens
  useEffect(() => {
    if (open) {
      setAiStatus('checking');
      api
        .get('/ai/health')
        .then((res) => {
          const data = res.data.data;
          setAiStatus(data.ollama || data.gemini ? 'online' : 'offline');
          setActiveModel(data.activeModel || '');
        })
        .catch(() => setAiStatus('offline'));

      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [open]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (open && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open, loading]);

  // Send message
  const sendMessage = useCallback(
    async (text: string) => {
      const userText = text.trim();
      if (!userText || loading) return;

      const userMsg: Message = {
        id: uid(),
        role: 'user',
        content: userText,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setInput('');
      setLoading(true);

      // Build compact history — last 6 messages only to save tokens
      const historyForApi = messages
        .filter((m) => m.id !== 'welcome')
        .slice(-6)
        .map((m) => ({ role: m.role, content: m.content }));

      abortRef.current = new AbortController();

      try {
        const res = await api.post(
          '/ai/chat',
          { message: userText, history: historyForApi },
          { signal: abortRef.current.signal as any },
        );

        const { reply, provider } = res.data.data;
        const botMsg: Message = {
          id: uid(),
          role: 'assistant',
          content: reply || 'Sorry, I could not generate a response.',
          provider,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMsg]);

        // If panel is closed, show notification dot
        if (!open) setHasNewMessage(true);
      } catch (err: any) {
        if (err.name === 'CanceledError' || err.name === 'AbortError') return;
        const errMsg =
          err.response?.data?.message ||
          'AI service is temporarily unavailable. Please try again.';
        setMessages((prev) => [
          ...prev,
          {
            id: uid(),
            role: 'assistant',
            content: `⚠️ ${errMsg}`,
            timestamp: new Date(),
          },
        ]);
      } finally {
        setLoading(false);
        abortRef.current = null;
      }
    },
    [messages, loading, open],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleClear = () => {
    if (abortRef.current) abortRef.current.abort();
    setMessages([
      {
        id: uid(),
        role: 'assistant',
        content: `Chat cleared! 🧹\n\nAsk me anything about your leaves.`,
        timestamp: new Date(),
      },
    ]);
    setLoading(false);
  };

  const handleToggle = () => {
    setOpen((o) => !o);
    if (!open) setHasNewMessage(false);
  };

  if (!user) return null;

  const quickPrompts = ROLE_PROMPTS[user.role] || DEFAULT_PROMPTS;
  const hasUserMessages = messages.some((m) => m.role === 'user');

  return (
    <>
      {/* ── Keyframes ── */}
      <style>{`
        @keyframes aiDotBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-6px); opacity: 1; }
        }
        @keyframes aiPanelIn {
          from { opacity: 0; transform: translateY(24px) scale(0.92); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes aiPanelOut {
          from { opacity: 1; transform: translateY(0) scale(1); }
          to   { opacity: 0; transform: translateY(24px) scale(0.92); }
        }
        @keyframes aiFabRing {
          0%, 100% { box-shadow: 0 0 0 0 var(--primary-shadow); }
          50%       { box-shadow: 0 0 0 12px transparent; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes msgIn {
          from { opacity: 0; transform: translateY(12px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes shimmerWave {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .ai-panel-enter { animation: aiPanelIn 0.3s cubic-bezier(0.16,1,0.3,1); }
        .ai-fab-pulse { animation: aiFabRing 2.5s ease-in-out infinite; }
        .ai-msg-in { animation: msgIn 0.3s ease-out; }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .ai-chat-body::-webkit-scrollbar { width: 4px; }
        .ai-chat-body::-webkit-scrollbar-track { background: transparent; }
        .ai-chat-body::-webkit-scrollbar-thumb { background: var(--scrollbar-thumb); border-radius: 10px; }
        .ai-notification-dot {
          position: absolute; top: -2px; right: -2px;
          width: 14px; height: 14px; border-radius: 50%;
          background: #ef4444; border: 2px solid var(--card-bg);
          animation: pulse 1.5s ease-in-out infinite;
        }
      `}</style>

      {/* ── Chat Panel ── */}
      {open && (
        <div
          id="ai-chat-panel"
          className="ai-panel-enter fixed bottom-24 right-6 z-[9998] flex flex-col rounded-3xl overflow-hidden"
          style={{
            width: 'min(400px, calc(100vw - 2rem))',
            maxHeight: 'min(620px, calc(100vh - 8rem))',
            background: 'var(--card-bg)',
            border: '1px solid var(--border)',
            boxShadow: `0 25px 60px -12px rgba(0,0,0,0.25), 0 0 0 1px var(--border-light)`,
          }}
        >
          {/* ─── Header ─── */}
          <div
            className="flex items-center justify-between px-5 py-4 shrink-0"
            style={{
              background: `linear-gradient(135deg, var(--primary-gradient-from), var(--primary-gradient-to))`,
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="h-10 w-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-lg"
                style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              >
                🤖
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-white leading-none">LeaveBot</p>
                  <StatusDot status={aiStatus} />
                </div>
                <p className="text-[10px] text-white/60 mt-1 leading-none">
                  {activeModel || 'Connecting…'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                id="ai-chat-clear-btn"
                onClick={handleClear}
                title="Clear conversation"
                className="h-8 w-8 rounded-xl flex items-center justify-center text-white/60 hover:text-white hover:bg-white/15 transition-all"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="1 4 1 10 7 10" /><polyline points="23 20 23 14 17 14" />
                  <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
                </svg>
              </button>
              <button
                id="ai-chat-close-btn"
                onClick={() => setOpen(false)}
                title="Minimize"
                className="h-8 w-8 rounded-xl flex items-center justify-center text-white/60 hover:text-white hover:bg-white/15 transition-all"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
            </div>
          </div>

          {/* ─── Messages ─── */}
          <div
            ref={chatBodyRef}
            className="ai-chat-body flex-1 overflow-y-auto px-4 py-4"
            style={{ minHeight: 0 }}
          >
            {messages.map((msg, idx) => (
              <div
                key={msg.id}
                className={`ai-msg-in flex items-end gap-2.5 mb-3 ${
                  msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                {/* Avatar */}
                <div
                  className="h-8 w-8 rounded-full flex items-center justify-center text-xs shrink-0 font-bold"
                  style={{
                    background:
                      msg.role === 'user'
                        ? `linear-gradient(135deg, var(--avatar-from), var(--avatar-to))`
                        : `linear-gradient(135deg, var(--primary-gradient-from), var(--primary-gradient-to))`,
                    color: 'white',
                    boxShadow:
                      msg.role === 'user'
                        ? `0 4px 12px var(--avatar-shadow)`
                        : `0 4px 12px var(--primary-shadow)`,
                    fontSize: msg.role === 'user' ? '10px' : '14px',
                  }}
                >
                  {msg.role === 'user'
                    ? (user.name || 'U').substring(0, 2).toUpperCase()
                    : '🤖'}
                </div>

                {/* Bubble */}
                <div
                  className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                  style={{ maxWidth: '75%' }}
                >
                  <div
                    className="px-4 py-3 rounded-2xl text-[13px] leading-relaxed"
                    style={{
                      background:
                        msg.role === 'user'
                          ? `linear-gradient(135deg, var(--primary-gradient-from), var(--primary-gradient-to))`
                          : 'var(--surface-secondary)',
                      color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
                      border: msg.role === 'user' ? 'none' : '1px solid var(--border)',
                      borderBottomLeftRadius: msg.role === 'assistant' ? '6px' : undefined,
                      borderBottomRightRadius: msg.role === 'user' ? '6px' : undefined,
                      boxShadow: msg.role === 'user'
                        ? `0 4px 16px var(--primary-shadow)`
                        : '0 2px 8px var(--card-shadow)',
                    }}
                  >
                    {msg.role === 'assistant' ? renderMarkdown(msg.content) : msg.content}
                  </div>
                  <div className="flex items-center gap-2 mt-1 px-1">
                    {msg.role === 'assistant' && <ProviderBadge provider={msg.provider} />}
                    <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {loading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {/* ─── Quick Prompts (only before first user msg) ─── */}
          {!hasUserMessages && !loading && (
            <div className="px-4 pb-3 shrink-0 animate-fadeIn">
              <p
                className="text-[10px] font-bold uppercase tracking-widest mb-2 px-0.5"
                style={{ color: 'var(--text-muted)' }}
              >
                Suggested
              </p>
              <div className="grid grid-cols-1 gap-1.5">
                {quickPrompts.map((prompt, i) => (
                  <button
                    key={i}
                    id={`ai-quick-prompt-${i}`}
                    onClick={() => sendMessage(prompt)}
                    className="text-left text-xs px-3 py-2.5 rounded-xl transition-all duration-200 group"
                    style={{
                      background: 'var(--surface-secondary)',
                      color: 'var(--text-secondary)',
                      border: '1px solid var(--border)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--primary)';
                      e.currentTarget.style.color = 'var(--primary)';
                      e.currentTarget.style.background = 'var(--primary-light)';
                      e.currentTarget.style.transform = 'translateX(4px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border)';
                      e.currentTarget.style.color = 'var(--text-secondary)';
                      e.currentTarget.style.background = 'var(--surface-secondary)';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}
                  >
                    <span className="mr-1.5" style={{ opacity: 0.5 }}>💬</span>
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ─── Input Form ─── */}
          <form
            onSubmit={handleSubmit}
            className="shrink-0 px-4 py-3 flex items-center gap-2.5"
            style={{
              borderTop: '1px solid var(--border)',
              background: 'var(--surface)',
            }}
          >
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                id="ai-chat-input"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={loading ? 'LeaveBot is thinking…' : 'Ask about your leaves…'}
                disabled={loading}
                className="w-full text-sm px-4 py-2.5 rounded-xl outline-none transition-all duration-200"
                style={{
                  background: 'var(--input-bg)',
                  border: '1.5px solid var(--input-border)',
                  color: 'var(--input-text)',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--input-focus-border)';
                  e.target.style.boxShadow = `0 0 0 3px var(--input-focus-ring)`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--input-border)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            <button
              id="ai-chat-send-btn"
              type="submit"
              disabled={!input.trim() || loading}
              className="h-10 w-10 rounded-xl flex items-center justify-center transition-all duration-200 shrink-0"
              style={{
                background:
                  !input.trim() || loading
                    ? 'var(--surface-secondary)'
                    : `linear-gradient(135deg, var(--primary-gradient-from), var(--primary-gradient-to))`,
                color: !input.trim() || loading ? 'var(--text-muted)' : 'white',
                cursor: !input.trim() || loading ? 'not-allowed' : 'pointer',
                boxShadow: input.trim() && !loading ? `0 4px 12px var(--primary-shadow)` : 'none',
                transform: input.trim() && !loading ? 'scale(1)' : 'scale(0.95)',
              }}
            >
              {loading ? (
                <div
                  className="h-4 w-4 rounded-full border-2 border-transparent animate-spin"
                  style={{ borderTopColor: 'var(--text-muted)' }}
                />
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              )}
            </button>
          </form>

          {/* ─── Footer ─── */}
          <div
            className="flex items-center justify-center gap-2 py-2 shrink-0"
            style={{ background: 'var(--surface-secondary)', borderTop: '1px solid var(--border-light)' }}
          >
            <span className="text-[9px] font-medium" style={{ color: 'var(--text-muted)' }}>
              ⚡ Powered by Ollama & Gemini — Token-efficient mode
            </span>
          </div>
        </div>
      )}

      {/* ── FAB Button ── */}
      <button
        id="ai-chat-fab"
        onClick={handleToggle}
        title="AI Leave Assistant"
        className={`fixed bottom-6 right-6 z-[9999] h-14 w-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 ${
          !open ? 'ai-fab-pulse' : ''
        }`}
        style={{
          background: open
            ? `linear-gradient(135deg, var(--primary-hover), var(--primary-gradient-to))`
            : `linear-gradient(135deg, var(--primary-gradient-from), var(--primary-gradient-to))`,
          boxShadow: `0 8px 32px var(--primary-shadow)`,
        }}
      >
        {/* Notification dot */}
        {!open && hasNewMessage && <div className="ai-notification-dot" />}

        <span
          className="text-xl transition-transform duration-300"
          style={{ transform: open ? 'rotate(90deg) scale(0.9)' : 'none' }}
        >
          {open ? '✕' : '🤖'}
        </span>
      </button>
    </>
  );
}
