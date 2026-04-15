'use client';

import React, { useState, useRef, useEffect } from 'react';
import { aiService } from '@/lib/services';
import { Bot, X, Send, Sparkles, RefreshCw, ChevronDown } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  loading?: boolean;
}

const SUGGESTED = [
  'How many leaves do I have left?',
  'What was my last approved leave?',
  'Draft a sick leave reason for me',
  'What is the company leave policy?',
];

export function AIChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: '👋 Hi! I\'m your Leave Assistant, powered by AI.\n\nAsk me anything about your leaves, balances, or get help writing a leave reason!',
    },
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [activeModel, setActiveModel] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 150);
      // Fetch provider status
      aiService.health().then((s) => setActiveModel(s.activeModel || '')).catch(() => {});
    }
  }, [open]);

  const sendMessage = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || sending) return;

    const userMsg: Message = { id: Date.now() + '-u', role: 'user', content: msg };
    const loadingMsg: Message = { id: Date.now() + '-a', role: 'assistant', content: '', loading: true };

    setMessages((prev) => [...prev, userMsg, loadingMsg]);
    setInput('');
    setSending(true);

    try {
      const reply = await aiService.chat(msg);
      setMessages((prev) =>
        prev.map((m) => (m.id === loadingMsg.id ? { ...m, content: reply, loading: false } : m)),
      );
    } catch (err: any) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === loadingMsg.id
            ? { ...m, content: '⚠️ Sorry, the AI is unavailable right now. Please try again.', loading: false }
            : m,
        ),
      );
    } finally {
      setSending(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: '👋 Hi! I\'m your Leave Assistant, powered by AI.\n\nAsk me anything about your leaves, balances, or get help writing a leave reason!',
      },
    ]);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-[9999] h-14 w-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
        style={{
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          boxShadow: '0 8px 32px -4px rgba(99,102,241,0.6)',
        }}
        aria-label="Open AI Assistant"
      >
        {open ? <X size={22} className="text-white" /> : <Bot size={22} className="text-white" />}

        {/* Pulse ring when closed */}
        {!open && (
          <span className="absolute inset-0 rounded-full animate-ping opacity-30"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }} />
        )}
      </button>

      {/* Chat Panel */}
      <div
        className={`fixed bottom-24 right-6 z-[9998] w-[360px] sm:w-[400px] rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right ${
          open ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'
        }`}
        style={{
          height: '560px',
          background: 'var(--surface-primary, #ffffff)',
          border: '1px solid var(--border, #e5e7eb)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 shrink-0"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
        >
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-white/20 flex items-center justify-center">
              <Bot size={20} className="text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight">Leave AI Assistant</p>
              {activeModel && (
                <p className="text-white/60 text-[10px] leading-tight">{activeModel}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={clearChat}
              className="p-1.5 rounded-lg hover:bg-white/20 transition-colors text-white/70 hover:text-white"
              title="Clear chat"
            >
              <RefreshCw size={14} />
            </button>
            <button
              onClick={() => setOpen(false)}
              className="p-1.5 rounded-lg hover:bg-white/20 transition-colors text-white/70 hover:text-white"
            >
              <ChevronDown size={16} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="h-7 w-7 rounded-full shrink-0 mr-2 mt-0.5 flex items-center justify-center text-white text-xs font-bold"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                  🤖
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'text-white rounded-br-sm'
                    : 'rounded-bl-sm'
                }`}
                style={
                  msg.role === 'user'
                    ? { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }
                    : { background: 'var(--surface-secondary, #f1f5f9)', color: 'var(--text-primary, #1e293b)' }
                }
              >
                {msg.loading ? (
                  <div className="flex items-center gap-1.5 py-0.5">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="h-2 w-2 rounded-full bg-indigo-400 animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                ) : (
                  <span className="whitespace-pre-wrap">{msg.content}</span>
                )}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Suggested prompts (only show if only welcome msg) */}
        {messages.length === 1 && (
          <div className="px-4 pb-2 flex flex-wrap gap-2 shrink-0">
            {SUGGESTED.map((s) => (
              <button
                key={s}
                onClick={() => sendMessage(s)}
                className="text-xs px-3 py-1.5 rounded-full border transition-all hover:scale-105"
                style={{
                  color: 'var(--primary, #6366f1)',
                  borderColor: 'var(--primary, #6366f1)',
                  background: 'transparent',
                }}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input Bar */}
        <div
          className="px-3 py-3 shrink-0 flex items-center gap-2"
          style={{ borderTop: '1px solid var(--border, #e5e7eb)', background: 'var(--surface-primary, #fff)' }}
        >
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Ask about your leaves..."
              disabled={sending}
              className="w-full text-sm px-4 py-2.5 rounded-xl outline-none transition-all"
              style={{
                background: 'var(--surface-secondary, #f1f5f9)',
                color: 'var(--text-primary, #1e293b)',
                border: '1.5px solid transparent',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#6366f1')}
              onBlur={(e) => (e.currentTarget.style.borderColor = 'transparent')}
            />
          </div>
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || sending}
            className="h-10 w-10 rounded-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
          >
            <Send size={16} className="text-white" />
          </button>
        </div>

        {/* Powered-by footer */}
        <div className="px-4 pb-2 flex items-center justify-center gap-1 shrink-0">
          <Sparkles size={10} style={{ color: 'var(--text-muted, #94a3b8)' }} />
          <p className="text-[10px]" style={{ color: 'var(--text-muted, #94a3b8)' }}>
            Ollama · Gemini 1.5 Flash
          </p>
        </div>
      </div>
    </>
  );
}
