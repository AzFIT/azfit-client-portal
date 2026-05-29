import { useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  X,
  Send,
  Trash2,
  Bot,
  User,
} from 'lucide-react';
import { useAIChatStore } from './useAIChatStore';
import { sendMessageToKimi } from './AIService';

const SUGGESTIONS = [
  'How do I create a workout?',
  'Calculate my TDEE',
  'What exercises target chest?',
  'Help with client nutrition',
];

const AZFIT_BLUE = '#00AEEF';

export default function AIChatWindow() {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { messages, isLoading, addMessage, setLoading, clearMessages, toggleOpen } =
    useAIChatStore();

  const scrollToBottom = useCallback(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  const handleSend = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading) return;

      // Add user message
      addMessage({ role: 'user', content: trimmed });
      setLoading(true);

      // Wait for the store to update before calling API
      setTimeout(async () => {
        try {
          const currentMessages = useAIChatStore.getState().messages;
          const response = await sendMessageToKimi(currentMessages);
          addMessage({ role: 'assistant', content: response });
        } catch {
          addMessage({
            role: 'assistant',
            content:
              "I'm sorry, I encountered an error. Please try again.",
          });
        } finally {
          setLoading(false);
          // Focus input after response
          setTimeout(() => inputRef.current?.focus(), 100);
        }
      }, 50);
    },
    [isLoading, addMessage, setLoading]
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const input = inputRef.current;
      if (!input) return;
      const value = input.value;
      input.value = '';
      handleSend(value);
    },
    [handleSend]
  );

  const handleSuggestionClick = useCallback(
    (suggestion: string) => {
      handleSend(suggestion);
    },
    [handleSend]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        const input = e.currentTarget;
        const value = input.value;
        input.value = '';
        handleSend(value);
      }
    },
    [handleSend]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ type: 'spring', duration: 0.4, bounce: 0.15 }}
      className="fixed z-50 flex flex-col overflow-hidden shadow-2xl sm:bottom-[88px] sm:right-6 sm:top-auto sm:left-auto sm:w-[380px] sm:h-[520px] inset-x-3 top-3 bottom-3 sm:inset-auto"
      style={{
        borderRadius: '1rem',
        backgroundColor: '#0F1623',
        border: '1px solid rgba(0, 174, 239, 0.2)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 shrink-0"
        style={{
          background: 'linear-gradient(135deg, #00AEEF, #3B82F6)',
        }}
      >
        <div className="flex items-center gap-2.5">
          {/* Gradient orb avatar */}
          <div
            className="flex items-center justify-center rounded-full"
            style={{
              width: 32,
              height: 32,
              background: 'linear-gradient(135deg, #00AEEF 0%, #3B82F6 50%, #60A5FA 100%)',
              boxShadow: '0 0 12px rgba(0, 174, 239, 0.5)',
            }}
          >
            <Sparkles className="text-white" size={16} />
          </div>
          <span className="font-semibold text-white text-sm">AzFIT AI</span>
        </div>
        <div className="flex items-center gap-1">
          {/* Clear messages button */}
          {messages.length > 0 && (
            <button
              onClick={clearMessages}
              className="p-1.5 rounded-lg transition-colors hover:bg-white/20"
              title="Clear conversation"
            >
              <Trash2 size={14} className="text-white/90" />
            </button>
          )}
          {/* Close button */}
          <button
            onClick={toggleOpen}
            className="p-1.5 rounded-lg transition-colors hover:bg-white/20"
            title="Close chat"
          >
            <X size={18} className="text-white" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-3"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: `${AZFIT_BLUE} transparent`,
        }}
      >
        {/* Empty State */}
        {messages.length === 0 && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-center h-full gap-4"
          >
            <div
              className="flex items-center justify-center rounded-full"
              style={{
                width: 56,
                height: 56,
                background: 'linear-gradient(135deg, #00AEEF 0%, #3B82F6 100%)',
                boxShadow: '0 0 20px rgba(0, 174, 239, 0.3)',
              }}
            >
              <Bot size={28} className="text-white" />
            </div>
            <p className="text-center text-sm leading-relaxed" style={{ color: '#9CA3AF' }}>
              Hi! I&apos;m your AzFIT AI assistant.
              <br />
              How can I help you today?
            </p>
            {/* Suggestion Chips */}
            <div className="flex flex-wrap justify-center gap-2 mt-1">
              {SUGGESTIONS.map((suggestion, index) => (
                <motion.button
                  key={suggestion}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index, duration: 0.3 }}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="text-xs px-3 py-1.5 rounded-full transition-all cursor-pointer"
                  style={{
                    border: '1px solid #1E3A5F',
                    color: '#9CA3AF',
                    backgroundColor: 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(0, 174, 239, 0.1)';
                    e.currentTarget.style.borderColor = '#00AEEF';
                    e.currentTarget.style.color = '#F9FAFB';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.borderColor = '#1E3A5F';
                    e.currentTarget.style.color = '#9CA3AF';
                  }}
                >
                  {suggestion}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Messages */}
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', duration: 0.4, bounce: 0.1 }}
              className={`flex items-start gap-2 ${
                msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              {/* Avatar */}
              <div
                className="flex items-center justify-center rounded-full shrink-0"
                style={{
                  width: 28,
                  height: 28,
                  backgroundColor:
                    msg.role === 'user' ? '#00AEEF' : '#1F2937',
                }}
              >
                {msg.role === 'user' ? (
                  <User size={14} className="text-white" />
                ) : (
                  <Bot size={14} className="text-[#00AEEF]" />
                )}
              </div>

              {/* Message Bubble */}
              <div
                className="max-w-[85%] sm:max-w-[75%] px-3.5 py-2.5 text-sm leading-relaxed break-words"
                style={{
                  borderRadius: '1rem',
                  backgroundColor:
                    msg.role === 'user' ? '#00AEEF' : '#1F2937',
                  color: msg.role === 'user' ? '#FFFFFF' : '#F9FAFB',
                }}
              >
                {msg.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing Indicator */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="flex items-start gap-2"
            >
              <div
                className="flex items-center justify-center rounded-full shrink-0"
                style={{
                  width: 28,
                  height: 28,
                  backgroundColor: '#1F2937',
                }}
              >
                <Bot size={14} className="text-[#00AEEF]" />
              </div>
              <div
                className="px-4 py-3 flex items-center gap-1.5"
                style={{
                  borderRadius: '1rem',
                  backgroundColor: '#1F2937',
                }}
              >
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="rounded-full"
                    style={{
                      width: 6,
                      height: 6,
                      backgroundColor: '#00AEEF',
                    }}
                    animate={{
                      scale: [1, 1.4, 1],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 1.2,
                      repeat: Infinity,
                      delay: i * 0.2,
                      ease: 'easeInOut',
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form
        onSubmit={handleSubmit}
        className="shrink-0 px-3 py-3"
        style={{
          borderTop: '1px solid rgba(0, 174, 239, 0.1)',
        }}
      >
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl"
          style={{
            backgroundColor: '#1A2332',
            border: '1px solid #1E3A5F',
          }}
        >
          <input
            ref={inputRef}
            type="text"
            placeholder="Ask AzFIT AI..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-500"
            style={{ color: '#F9FAFB' }}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center justify-center p-1.5 rounded-lg transition-all shrink-0"
            style={{
              backgroundColor: isLoading
                ? 'rgba(0, 174, 239, 0.3)'
                : '#00AEEF',
              opacity: isLoading ? 0.6 : 1,
              cursor: isLoading ? 'not-allowed' : 'pointer',
            }}
          >
            <Send size={14} className="text-white" />
          </button>
        </div>
      </form>
    </motion.div>
  );
}
