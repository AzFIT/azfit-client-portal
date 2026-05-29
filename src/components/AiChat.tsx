import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Bot, User, Sparkles } from 'lucide-react'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
}

const quickHints = [
  'How do I create a program?',
  'Track my nutrition',
  'View client progress',
  'Schedule a session',
]

export default function AiChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Hello! I\'m your AzFIT AI assistant. How can I help you today?',
    },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const handleSend = (text: string) => {
    if (!text.trim()) return
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
    }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      setIsTyping(false)
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Thanks for your message! This is a demo response. The full AI integration will be available soon.',
      }
      setMessages((prev) => [...prev, assistantMsg])
    }, 1500)
  }

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 left-6 z-[350] w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg"
        style={{
          background: 'linear-gradient(135deg, #00AEEF 0%, #8B5CF6 100%)',
          boxShadow: '0 4px 20px rgba(0,174,239,0.3)',
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={!isOpen ? {
          boxShadow: [
            '0 4px 20px rgba(0,174,239,0.3)',
            '0 4px 30px rgba(0,174,239,0.5)',
            '0 4px 20px rgba(0,174,239,0.3)',
          ],
        } : {}}
        transition={!isOpen ? { boxShadow: { duration: 2, repeat: Infinity } } : {}}
        aria-label="Toggle AI Chat"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X size={22} />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <MessageCircle size={22} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="fixed bottom-24 left-6 z-[350] w-[380px] max-w-[calc(100vw-48px)] rounded-2xl overflow-hidden flex flex-col"
            style={{
              height: '520px',
              maxHeight: 'calc(100vh - 140px)',
              background: 'rgba(26, 26, 26, 0.85)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
            }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-[#2A2A2A]"
              style={{ background: 'rgba(20, 20, 20, 0.6)' }}
            >
              <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #00AEEF, #8B5CF6)' }}>
                <Sparkles size={18} className="text-white" />
              </div>
              <div className="flex-1">
                <h4 className="text-[#F0F0F0] font-semibold text-sm">AzFIT AI Assistant</h4>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                  <span className="text-[#6B6B6B] text-xs">Online</span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-[#6B6B6B] hover:text-[#F0F0F0] p-1 rounded-lg hover:bg-[#242424] transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                    msg.role === 'assistant'
                      ? 'bg-gradient-to-br from-[#00AEEF] to-[#8B5CF6]'
                      : 'bg-[#2A2A2A]'
                  }`}>
                    {msg.role === 'assistant' ? <Bot size={14} className="text-white" /> : <User size={14} className="text-[#A0A0A0]" />}
                  </div>
                  <div
                    className={`max-w-[75%] px-3.5 py-2.5 rounded-xl text-sm leading-relaxed ${
                      msg.role === 'assistant'
                        ? 'bg-[#141414] text-[#F0F0F0] border border-[#2A2A2A]'
                        : 'bg-[#00AEEF] text-white'
                    }`}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-2.5"
                >
                  <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-[#00AEEF] to-[#8B5CF6]">
                    <Bot size={14} className="text-white" />
                  </div>
                  <div className="bg-[#141414] border border-[#2A2A2A] rounded-xl px-3.5 py-2.5">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#6B6B6B] animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 rounded-full bg-[#6B6B6B] animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 rounded-full bg-[#6B6B6B] animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />

              {/* Quick Hints */}
              {messages.length <= 1 && (
                <div className="pt-2">
                  <p className="text-[#6B6B6B] text-xs mb-2">Quick actions:</p>
                  <div className="flex flex-wrap gap-2">
                    {quickHints.map((hint) => (
                      <button
                        key={hint}
                        onClick={() => handleSend(hint)}
                        className="text-xs px-3 py-1.5 rounded-full bg-[#141414] border border-[#2A2A2A] text-[#A0A0A0] hover:text-[#00AEEF] hover:border-[#00AEEF]/30 transition-colors duration-200"
                      >
                        {hint}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-[#2A2A2A] bg-[#141414]/50">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSend(input)
                  }}
                  placeholder="Type a message..."
                  className="flex-1 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-4 py-2.5 text-sm text-[#F0F0F0] placeholder:text-[#6B6B6B] focus:outline-none focus:border-[#00AEEF] focus:ring-1 focus:ring-[#00AEEF]/20 transition-all"
                />
                <button
                  onClick={() => handleSend(input)}
                  disabled={!input.trim()}
                  className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#00AEEF] hover:bg-[#009BD6] disabled:opacity-40 disabled:hover:bg-[#00AEEF] text-white transition-all duration-200 hover:scale-105"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
