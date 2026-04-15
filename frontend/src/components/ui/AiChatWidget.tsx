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

// ─── Suggested quick prompts ──────────────────────────────────────────────────
const QUICK_PROMPTS = [
  'How many sick leaves do I have left?',
  'When was my last approved leave?',
  'Who on my team is on leave this week?',
  'Draft a leave reason — I have a fever',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function ProviderBadge({ provider }: { provider?: 'ollama' | 'gemini' }) {
  if (!provider) return null;
  const isOllama = provider === 'ollama';
  return (
    <span
      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider mt-1.5"
      style={{
        backgroundColor: isOllama ? 'rgba(99,102,241,0.12)' : 'rgba(16,185,129,0.12)',
        color: isOllama ? '#818cf8' : '#34d399',
        border: `1px solid ${isOllama ? 'rgba(99,102,241,0.25)' : 'rgba(16,185,129,0.25)'}`,
      }}
    >
      {isOllama ? '⚡ Ollama' : '✨ Gemini'}
    </span>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 mb-3">
      <div
        className="h-7 w-7 rounded-full flex items-center justify-center text-sm shrink-0"
        style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
      >
        🤖
      </div>
      <div
        className="px-4 py-3 rounded-2xl rounded-bl-sm"
        style={{ background: 'var(--surface-secondary)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full"
              style={{
                background: 'var(--primary)',
                animation: `aiDot 1.2s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Widget ──────────────────────────────────────────────────────────────
export function AiChatWidget() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: uid(),
      role: 'assistant',
      content: `Hi ${user?.name?.split(' ')[0] || 'there'} 👋 I'm LeaveBot, your AI leave assistant. Ask me anything about your leaves, team schedules, or I can draft a leave reason for you!`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // scroll to bottom on new message
  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open, loading]);

  // focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [open]);

  const sendMessage = useCallback(
    async (text: string) => {
      const userText = text.trim();
      if (!userText || loading) return;

      setError(null);
      const userMsg: Message = {
        id: uid(),
        role: 'user',
        content: userText,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setInput('');
      setLoading(true);

      // Build history for the API (last 6 msgs, excluding welcome)
      const historyForApi = messages
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
      } catch (err: any) {
        if (err.name === 'CanceledError' || err.name === 'AbortError') return;
        const errMsg =
          err.response?.data?.message ||
          'AI service is temporarily unavailable. Please try again.';
        setError(errMsg);
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
    [messages, loading],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleQuickPrompt = (prompt: string) => {
    sendMessage(prompt);
  };

  const handleClear = () => {
    setMessages([
      {
        id: uid(),
        role: 'assistant',
        content: `Chat cleared! Ask me anything about your leaves 😊`,
        timestamp: new Date(),
      },
    ]);
    setError(null);
  };

  if (!user) return null;

  return (
    <>
      {/* ── Keyframe injector ── */}
      <style>{`
        @keyframes aiDot {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-6px); opacity: 1; }
        }
        @keyframes aiSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes aiFabPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(99,102,241,0.4); }
          50%       { box-shadow: 0 0 0 10px rgba(99,102,241,0); }
        }
        .ai-chat-panel { animation: aiSlideUp 0.25s ease-out; }
        .ai-fab { animation: aiFabPulse 2.5s ease-in-out infinite; }
      `}</style>

      {/* ── Chat Panel ── */}
      {open && (
        <div
          id="ai-chat-panel"
          className="ai-chat-panel fixed bottom-24 right-6 z-50 flex flex-col rounded-2xl overflow-hidden shadow-2xl"
          style={{
            width: '360px',
            maxHeight: '580px',
            background: 'var(--card-bg)',
            border: '1px solid var(--border)',
            boxShadow: '0 25px 60px -12px rgba(0,0,0,0.35)',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 shrink-0"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            }}
          >
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center text-base">
                🤖
              </div>
              <div>
                <p className="text-sm font-bold text-white leading-none">LeaveBot</p>
                <p className="text-[10px] text-white/70 mt-0.5">AI Leave Assistant</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                id="ai-chat-clear-btn"
                onClick={handleClear}
                title="Clear chat"
                className="h-7 w-7 rounded-lg flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all text-xs"
              >
                🗑
              </button>
              <button
                id="ai-chat-close-btn"
                onClick={() => setOpen(false)}
                title="Close"
                className="h-7 w-7 rounded-lg flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            className="flex-1 overflow-y-auto px-3 py-4 space-y-1"
            style={{ minHeight: 0 }}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-end gap-2 mb-2 ${
                  msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                {/* Avatar */}
                <div
                  className="h-7 w-7 rounded-full flex items-center justify-center text-sm shrink-0 font-bold"
                  style={{
                    background:
                      msg.role === 'user'
                        ? 'linear-gradient(135deg, #10b981, #059669)'
                        : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    color: 'white',
                    fontSize: msg.role === 'user' ? '11px' : '14px',
                  }}
                >
                  {msg.role === 'user'
                    ? (user.name || 'U').substring(0, 2).toUpperCase()
                    : '🤖'}
                </div>

                {/* Bubble */}
                <div
                  className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className="px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed max-w-[240px]"
                    style={{
                      background:
                        msg.role === 'user'
                          ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                          : 'var(--surface-secondary)',
                      color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
                      border: msg.role === 'user' ? 'none' : '1px solid var(--border)',
                      borderBottomLeftRadius: msg.role === 'assistant' ? '4px' : '16px',
                      borderBottomRightRadius: msg.role === 'user' ? '4px' : '16px',
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {msg.content}
                  </div>
                  {msg.role === 'assistant' && <ProviderBadge provider={msg.provider} />}
                  <span
                    className="text-[9px] mt-1 px-1"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {msg.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            ))}

            {loading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts (only show when no user msg yet) */}
          {messages.filter((m) => m.role === 'user').length === 0 && !loading && (
            <div className="px-3 pb-2 shrink-0">
              <p className="text-[10px] font-semibold uppercase tracking-wider mb-2 px-1" style={{ color: 'var(--text-muted)' }}>
                Try asking:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    id={`ai-quick-prompt-${i}`}
                    onClick={() => handleQuickPrompt(prompt)}
                    className="text-xs px-2.5 py-1.5 rounded-lg transition-all hover:scale-105 text-left"
                    style={{
                      background: 'var(--surface-secondary)',
                      color: 'var(--text-secondary)',
                      border: '1px solid var(--border)',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = 'var(--primary)';
                      (e.currentTarget as HTMLElement).style.color = 'var(--primary)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
                      (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
                    }}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="shrink-0 px-3 py-3 flex items-center gap-2"
            style={{
              borderTop: '1px solid var(--border)',
              background: 'var(--surface-secondary)',
            }}
          >
            <input
              ref={inputRef}
              id="ai-chat-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your leaves…"
              disabled={loading}
              className="flex-1 text-sm px-3 py-2 rounded-xl outline-none transition-all"
              style={{
                background: 'var(--input-bg)',
                border: '1px solid var(--input-border)',
                color: 'var(--input-text)',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--input-focus-border)';
                e.target.style.boxShadow = '0 0 0 2px var(--input-focus-ring)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--input-border)';
                e.target.style.boxShadow = 'none';
              }}
            />
            <button
              id="ai-chat-send-btn"
              type="submit"
              disabled={!input.trim() || loading}
              className="h-9 w-9 rounded-xl flex items-center justify-center transition-all shrink-0"
              style={{
                background:
                  !input.trim() || loading
                    ? 'var(--surface-hover)'
                    : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: !input.trim() || loading ? 'var(--text-muted)' : 'white',
                cursor: !input.trim() || loading ? 'not-allowed' : 'pointer',
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
        </div>
      )}

      {/* ── FAB Button ── */}
      <button
        id="ai-chat-fab"
        onClick={() => setOpen((o) => !o)}
        title="AI Leave Assistant"
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full flex items-center justify-center shadow-2xl transition-all hover:scale-110 active:scale-95"
        style={{
          background: open
            ? 'linear-gradient(135deg, #4f46e5, #7c3aed)'
            : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          boxShadow: '0 8px 30px rgba(99,102,241,0.5)',
          ...(open ? {} : { animationName: 'aiFabPulse', animationDuration: '2.5s', animationIterationCount: 'infinite' }),
        }}
      >
        <span className="text-2xl transition-transform" style={{ transform: open ? 'rotate(15deg)' : 'none' }}>
          {open ? '✕' : '🤖'}
        </span>
      </button>
    </>
  );
}
