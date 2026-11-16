import React, { useEffect, useRef, useState } from 'react';
import {
  Bot,
  MessageCircle,
  Send,
  Sparkles,
  X,
  RotateCcw,
  Zap,
} from 'lucide-react';
import { sendEnergyAssistantMessage } from '../../services/api';

const STARTER_QUESTIONS = [
  'Why is my energy usage high?',
  'Which appliance uses the most energy?',
  'Explain my projected electricity bill',
  'How can I save electricity this week?',
];

export default function EnergyAssistant({ activeView = 'overview' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [isOpen, messages, isSending]);

  const resetChat = () => {
    setMessages([]);
    setError('');
    setInput('');
  };

  const sendMessage = async (rawMessage = input) => {
    const message = rawMessage.trim();
    if (!message || isSending) return;

    const history = messages
      .filter((item) => item.role === 'user' || item.role === 'model')
      .slice(-10)
      .map(({ role, text }) => ({ role, text }));

    setMessages((current) => [...current, { role: 'user', text: message }]);
    setInput('');
    setError('');
    setIsSending(true);

    try {
      const result = await sendEnergyAssistantMessage({
        message,
        history,
        activeView,
      });
      setMessages((current) => [...current, { role: 'model', text: result.reply }]);
    } catch (err) {
      setError(err.message || 'Unable to reach the energy assistant. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    sendMessage();
  };

  return (
    <>
      {isOpen && (
        <section
          className="fixed bottom-24 right-4 z-[100] flex h-[min(680px,calc(100dvh-8rem))] w-[min(410px,calc(100vw-2rem))] flex-col overflow-hidden rounded-[26px] border border-slate-200/80 bg-white shadow-[0_24px_90px_rgba(15,23,42,0.22)] dark:border-white/10 dark:bg-[#20252B] dark:shadow-[0_24px_90px_rgba(0,0,0,0.48)] sm:right-6"
          aria-label="WattLume Energy Assistant"
        >
          <header className="relative overflow-hidden bg-[#172D4B] px-5 pb-5 pt-5 text-white">
            <div className="pointer-events-none absolute -right-8 -top-12 h-36 w-36 rounded-full bg-cyan-300/15 blur-2xl" />
            <div className="relative flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/12 ring-1 ring-white/15">
                  <Zap size={21} className="text-cyan-200" />
                </div>
                <div>
                  <h2 className="text-[15px] font-semibold tracking-tight">WattLume Assistant</h2>
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Your energy insights, explained
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={resetChat}
                  title="New conversation"
                  className="rounded-xl p-2 text-slate-300 transition hover:bg-white/10 hover:text-white"
                >
                  <RotateCcw size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  title="Close assistant"
                  className="rounded-xl p-2 text-slate-300 transition hover:bg-white/10 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            <p className="relative mt-4 max-w-[310px] text-[13px] leading-5 text-slate-200">
              Ask about your consumption, appliances, bill forecast or ways to save energy.
            </p>
          </header>

          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto bg-slate-50/80 px-4 py-4 dark:bg-[#191E24]">
            {messages.length === 0 ? (
              <div className="pt-2">
                <div className="mb-4 flex gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-cyan-100 text-cyan-800 dark:bg-cyan-400/15 dark:text-cyan-200">
                    <Sparkles size={16} />
                  </div>
                  <div className="max-w-[290px] rounded-2xl rounded-tl-md border border-slate-200/80 bg-white px-3.5 py-3 text-[13px] leading-5 text-slate-700 shadow-sm dark:border-white/8 dark:bg-[#252C34] dark:text-slate-200">
                    Hi! I can explain the energy data in your WattLume dashboard and help you find practical ways to use less electricity.
                  </div>
                </div>
                <p className="mb-2.5 px-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Try asking</p>
                <div className="grid gap-2">
                  {STARTER_QUESTIONS.map((question) => (
                    <button
                      key={question}
                      type="button"
                      onClick={() => sendMessage(question)}
                      disabled={isSending}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-left text-[12px] font-medium text-slate-700 transition hover:border-cyan-300 hover:bg-cyan-50/70 disabled:opacity-50 dark:border-white/10 dark:bg-[#232A32] dark:text-slate-200 dark:hover:border-cyan-500/50 dark:hover:bg-cyan-400/5"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((message, index) => (
                <div key={`${message.role}-${index}`} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {message.role === 'model' && (
                    <div className="mr-2 mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-cyan-100 text-cyan-800 dark:bg-cyan-400/15 dark:text-cyan-200">
                      <Bot size={15} />
                    </div>
                  )}
                  <div className={`max-w-[84%] whitespace-pre-wrap break-words rounded-2xl px-3.5 py-3 text-[13px] leading-[1.6] ${message.role === 'user' ? 'rounded-br-md bg-[#1D4770] text-white' : 'rounded-tl-md border border-slate-200/80 bg-white text-slate-700 shadow-sm dark:border-white/10 dark:bg-[#252C34] dark:text-slate-200'}`}>
                    {message.text}
                  </div>
                </div>
              ))
            )}
            {isSending && (
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="flex gap-1 rounded-full bg-white px-3 py-2 dark:bg-[#252C34]">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-500" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-500 [animation-delay:120ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-500 [animation-delay:240ms]" />
                </span>
                Checking your energy data…
              </div>
            )}
            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs leading-5 text-rose-700 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-200">
                {error}
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="border-t border-slate-200 bg-white p-3 dark:border-white/10 dark:bg-[#20252B]">
            <div className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2 focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-400/10 dark:border-white/10 dark:bg-[#191E24]">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    sendMessage();
                  }
                }}
                rows={1}
                maxLength={2000}
                placeholder="Ask about your energy use…"
                className="max-h-24 min-h-[38px] flex-1 resize-none bg-transparent px-2 py-2 text-[13px] text-slate-800 outline-none placeholder:text-slate-400 dark:text-slate-100"
              />
              <button
                type="submit"
                disabled={!input.trim() || isSending}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#1D4770] text-white transition hover:bg-[#245887] disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Send message"
              >
                <Send size={16} />
              </button>
            </div>
            <p className="mt-2 text-center text-[10px] text-slate-400">AI responses can be inaccurate. Check important billing decisions against your utility statement.</p>
          </form>
        </section>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-label={isOpen ? 'Close WattLume assistant' : 'Open WattLume assistant'}
        className="fixed bottom-5 right-5 z-[101] flex h-14 w-14 items-center justify-center rounded-2xl bg-[#173D62] text-white shadow-[0_12px_35px_rgba(23,61,98,0.35)] ring-1 ring-white/20 transition duration-200 hover:-translate-y-1 hover:bg-[#20527E] focus:outline-none focus:ring-4 focus:ring-cyan-400/30 sm:bottom-6 sm:right-6"
      >
        {isOpen ? <X size={22} /> : <MessageCircle size={23} />}
        {!isOpen && <span className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-400 dark:border-[#17191D]" />}
      </button>
    </>
  );
}
