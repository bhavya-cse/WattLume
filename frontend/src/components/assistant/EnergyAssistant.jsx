import React, { useEffect, useRef, useState } from 'react';
import {
  Bot,
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
  const assistantRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [isOpen, messages, isSending]);

  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (event) => {
      if (!assistantRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('pointerdown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('pointerdown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

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
      setMessages((current) => [
        ...current,
        { role: 'model', text: result.reply },
      ]);
    } catch (err) {
      setError(err.message || 'Unable to reach Lumi. Please try again.');
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
          ref={assistantRef}
          className="fixed bottom-24 right-4 z-[100] flex h-[min(620px,calc(100dvh-8rem))] w-[min(390px,calc(100vw-2rem))] flex-col overflow-hidden rounded-[30px] border border-white/75 bg-white/22 shadow-[0_25px_80px_rgba(40,45,75,0.14)] backdrop-blur-[36px] backdrop-saturate-150 dark:border-white/20 dark:bg-[#172039]/26 dark:shadow-[0_30px_100px_rgba(0,0,0,0.38)] sm:right-6"
          aria-label="Lumi — Energy Companion"
        >
          {/* AI header */}
          <header className="relative z-10 overflow-hidden border-b border-white/15 bg-gradient-to-br from-[#101b3c] via-[#20265b] to-[#432b78] px-5 pb-6 pt-5 text-white">
            <div className="pointer-events-none absolute -right-10 -top-20 h-52 w-52 rounded-full border border-white/10 bg-violet-300/10 blur-2xl" />
            <div className="pointer-events-none absolute bottom-[-85px] left-20 h-40 w-40 rounded-full bg-cyan-300/20 blur-3xl" />

            <div className="relative flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-white/25 bg-white/15 shadow-[0_0_30px_rgba(139,125,255,0.3)] backdrop-blur-xl">
                  <img src="/assets/wattlume-chatbot.png" alt="WattLume" className="h-10 w-10 object-contain" />
                  <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-[#29275e] bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-[16px] font-semibold tracking-tight">
                      Lumi
                    </h2>
                    <span className="rounded-full border border-violet-200/25 bg-violet-300/15 px-2 py-0.5 text-[9px] font-semibold tracking-wider text-violet-100">
                      ENERGY COMPANION
                    </span>
                  </div>
                  <p className="mt-1 flex items-center gap-1.5 text-[11px] text-blue-100/75">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
                    Your intelligent energy companion
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={resetChat}
                  title="New conversation"
                  className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-white/70 transition hover:bg-white/15 hover:text-white"
                >
                  <RotateCcw size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  title="Close assistant"
                  className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-white/70 transition hover:bg-white/15 hover:text-white"
                >
                  <X size={17} />
                </button>
              </div>
            </div>

            <div className="relative mt-5">
              <p className="max-w-[320px] text-[13px] leading-[1.65] text-white/85">
                Your energy, understood. Ask questions, explore insights and discover smarter ways to save.
              </p>
              <div className="mt-4 flex items-center gap-2">
                <span className="rounded-full border border-cyan-200/20 bg-cyan-300/10 px-2.5 py-1 text-[10px] text-cyan-100">
                  <Zap size={10} className="mr-1 inline" />
                  Energy insights
                </span>
              </div>
            </div>
          </header>

          {/* Conversation area */}
          <div
            ref={scrollRef}
            className="relative z-10 flex-1 space-y-4 overflow-y-auto bg-white/10 backdrop-blur-[30px] backdrop-saturate-150 px-4 py-5 dark:bg-[#11182b]/10"
          >
            {messages.length === 0 ? (
              <div className="relative z-10 pt-1">
                <div className="mb-5 flex items-start gap-2.5">
                  <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-violet-200/70 bg-white/75 text-violet-600 shadow-[0_5px_20px_rgba(100,80,180,0.12)] backdrop-blur-xl dark:border-violet-300/15 dark:bg-violet-400/10 dark:text-violet-200">
                    <img src="/assets/wattlume-chatbot.png" alt="Lumi" className="h-8 w-8 object-contain" />
                  </div>
                  <div className="rounded-[20px] rounded-tl-md border border-white/55 bg-white/20 px-4 py-3.5 text-[13px] leading-[1.7] text-slate-700 shadow-[0_8px_30px_rgba(53,65,120,0.07)] backdrop-blur-xl dark:border-cyan-200/20 dark:bg-[#17243a]/[.82] dark:text-slate-100 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_12px_32px_rgba(0,0,0,0.2)]">
                    <span className="mb-1 block font-semibold text-[#29285d] dark:text-violet-200">
                      Hi! I'm Lumi. Your personal energy companion.
                    </span>
                    I can help you understand your energy consumption, appliance patterns and projected electricity bill. What would you like to explore?
                  </div>
                </div>

                <div className="mb-3 flex items-center gap-2 px-1">
                  <Sparkles size={13} className="text-violet-500 dark:text-violet-300" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                    Explore with AI
                  </p>
                  <div className="h-px flex-1 bg-gradient-to-r from-violet-300/50 to-transparent" />
                </div>

                <div className="grid gap-2.5">
                  {STARTER_QUESTIONS.map((question, index) => (
                    <button
                      key={question}
                      type="button"
                      onClick={() => sendMessage(question)}
                      disabled={isSending}
                      className="group flex items-center justify-between gap-3 rounded-2xl border border-white/45 bg-white/22 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] px-3.5 py-3 text-left text-[12px] font-medium text-slate-700 shadow-[0_5px_20px_rgba(53,65,120,0.045)] backdrop-blur-xl transition duration-200 hover:-translate-y-0.5 hover:border-violet-300/55 hover:bg-white/55 hover:shadow-[0_8px_25px_rgba(105,83,190,0.12)] disabled:opacity-50 dark:border-cyan-100/10 dark:bg-[#17243a]/45 dark:text-slate-200 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] dark:hover:border-cyan-200/25 dark:hover:bg-[#263b58]/55 dark:hover:shadow-[0_8px_24px_rgba(0,0,0,0.2)]"
                    >
                      <span>{question}</span>
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-100 to-cyan-100 text-violet-600 transition group-hover:from-violet-500 group-hover:to-indigo-500 group-hover:text-white dark:from-violet-400/15 dark:to-cyan-400/10 dark:text-violet-200">
                        <span className="text-sm">↗</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={`relative z-10 flex items-end gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'model' && (
                    <div className="mb-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-violet-200/70 bg-white/80 text-violet-600 shadow-sm backdrop-blur-xl dark:border-violet-300/20 dark:bg-violet-400/10 dark:text-violet-200">
                      <img src="/assets/wattlume-chatbot.png" alt="Lumi" className="h-7 w-7 object-contain" />
                    </div>
                  )}

                  <div
                    className={`max-w-[84%] whitespace-pre-wrap break-words px-4 py-3 text-[13px] leading-[1.7] shadow-[0_8px_25px_rgba(35,45,95,0.07)] backdrop-blur-xl ${
                      message.role === 'user'
                        ? 'rounded-[20px] rounded-br-md border border-violet-400/30 bg-gradient-to-br from-[#5146a8] via-[#4844a0] to-[#28618c] text-white shadow-[0_8px_25px_rgba(70,65,160,0.2)]'
                        : 'rounded-[20px] rounded-bl-md border border-white/55 bg-white/30 text-slate-700 dark:border-cyan-200/15 dark:bg-[#202a3d]/75 dark:text-slate-100 dark:shadow-[0_10px_30px_rgba(0,0,0,0.22)]'
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              ))
            )}

            {isSending && (
              <div className="flex items-end gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-violet-200/60 bg-white/80 text-violet-600 shadow-sm dark:border-violet-300/20 dark:bg-violet-400/10 dark:text-violet-200">
                  <img src="/assets/wattlume-chatbot.png" alt="Lumi" className="h-7 w-7 object-contain" />
                </div>
                <div className="flex items-center gap-3 rounded-2xl rounded-bl-md border border-white/55 bg-white/28 px-4 py-3 shadow-sm backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.07]">
                  <span className="flex gap-1.5">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-500" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-500 [animation-delay:120ms]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-500 [animation-delay:240ms]" />
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Thinking about your energy…
                  </span>
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-2xl border border-rose-200/80 bg-rose-50/80 px-3.5 py-3 text-xs leading-5 text-rose-700 backdrop-blur-xl dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-200">
                {error}
              </div>
            )}
          </div>

          {/* Glass composer */}
          <form
            onSubmit={handleSubmit}
            className="relative z-10 border-t border-white/45 bg-white/16 px-4 pb-3 pt-3 backdrop-blur-[30px] backdrop-saturate-150 dark:border-white/10 dark:bg-[#11182b]/22"
          >
            <div className="flex items-end gap-2 rounded-[21px] border border-white/55 bg-white/25 p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_5px_25px_rgba(55,55,120,0.07)] ring-1 ring-violet-200/30 transition focus-within:border-violet-300 focus-within:ring-2 focus-within:ring-violet-400/20 dark:border-white/10 dark:bg-white/[0.045] dark:ring-white/5 dark:focus-within:border-violet-300/40">
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
                placeholder="Ask WattLume anything…"
                className="max-h-24 min-h-[40px] flex-1 resize-none bg-transparent px-2.5 py-2.5 text-[13px] text-slate-800 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-300"
              />
              <button
                type="submit"
                disabled={!input.trim() || isSending}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[15px] bg-gradient-to-br from-[#6354c9] via-[#5144a8] to-[#287e9c] text-white shadow-[0_5px_16px_rgba(83,70,175,0.3)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_22px_rgba(83,70,175,0.4)] disabled:cursor-not-allowed disabled:opacity-35 disabled:shadow-none"
                aria-label="Send message"
              >
                <Send size={16} />
              </button>
            </div>
            <p className="mt-2.5 text-center text-[9px] tracking-wide text-slate-400 dark:text-slate-500">
              AI RESPONSES MAY NEED VERIFICATION
            </p>
          </form>
        </section>
      )}

      {/* Original chatbot picture — intentionally unchanged */}
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-label={isOpen ? 'Close Lumi' : 'Open Lumi'}
        className="fixed bottom-5 right-5 z-[101] flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-[#173D62] shadow-[0_12px_35px_rgba(23,61,98,0.4)] ring-2 ring-cyan-300/60 transition duration-200 hover:-translate-y-1 hover:scale-105 hover:shadow-[0_14px_40px_rgba(34,211,238,0.3)] focus:outline-none focus:ring-4 focus:ring-cyan-400/40 sm:bottom-6 sm:right-6"
      >
        {isOpen ? (
          <X size={23} className="text-white" />
        ) : (
          <img
            src="/assets/wattlume-chatbot.png"
            alt="WattLume chatbot"
            className="h-full w-full object-cover"
          />
        )}
        {!isOpen && (
          <span className="absolute right-0 top-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-400 dark:border-[#17191D]" />
        )}
      </button>
    </>
  );
}
