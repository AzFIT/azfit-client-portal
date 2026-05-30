import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Sparkles,
  Trash2,
  Dumbbell,
  Users,
  CalendarDays,
  Apple,
  Camera,
  Settings,
  BookOpen,
  Zap,
} from 'lucide-react'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
}

type Theme = 'dark' | 'light'

const quickHints = [
  { label: 'Create a program', icon: Dumbbell },
  { label: 'Add a new client', icon: Users },
  { label: 'Schedule a session', icon: CalendarDays },
  { label: 'Log client nutrition', icon: Apple },
  { label: 'Find an exercise', icon: BookOpen },
  { label: 'Track client progress', icon: Camera },
  { label: 'Use Program Creator', icon: Zap },
  { label: 'Change my settings', icon: Settings },
]

/* ── Knowledge Base ───────────────────────────────────── */
function getKnowledgeResponse(input: string): string | null {
  const q = input.toLowerCase()

  const knowledge: { keywords: string[]; response: string }[] = [
    {
      keywords: ['create', 'program', 'build', 'new program', 'make program'],
      response: 'To create a program, go to **Programs → Program Creator** in the sidebar. You can build a custom program by selecting training methods, setting duration and frequency, and assigning it to clients. You can also duplicate existing programs to use as a template.',
    },
    {
      keywords: ['client', 'add client', 'new client', 'onboard'],
      response: 'To add a new client, go to **Clients** in the sidebar and click the **+ Add Client** button. You\'ll fill out a 4-step questionnaire covering personal info, health & lifestyle, fitness profile, and a final review. The client will then appear in your client list.',
    },
    {
      keywords: ['schedule', 'session', 'calendar', 'book', 'appointment'],
      response: 'Use the **Calendar** page to schedule sessions. Click any time slot to open the context menu, then choose the session type (Training, Assessment, Check-in, etc.). You can also drag and drop existing sessions to reschedule them. The calendar supports day, week, and month views.',
    },
    {
      keywords: ['nutrition', 'diet', 'meal', 'macros', 'calorie', 'food'],
      response: 'The **Nutrition** page lets you log and review client nutrition data. You can track macronutrients, meal plans, and dietary adherence. Use it alongside the client profile to see full health and fitness progress.',
    },
    {
      keywords: ['exercise', 'find exercise', 'workout', 'movement', 'video'],
      response: 'Visit the **Exercise Library** from the sidebar to browse 200+ exercises with video demonstrations. You can filter by muscle group, equipment, difficulty, and exercise type. Each exercise includes a description, safety notes, and an embedded video.',
    },
    {
      keywords: ['progress', 'photo', 'measurement', 'body fat', 'weight', 'track'],
      response: 'To track client progress, go to **Photos** in the sidebar or open a client\'s profile page. You can upload progress photos, log measurements, body weight, and body fat percentage. Visual charts help you and your client see improvements over time.',
    },
    {
      keywords: ['program creator', 'wizard', 'all in one'],
      response: 'The **Program Creator** (under Programs) is a guided tool that walks you through building a program step-by-step. You can choose from pre-built templates or create fully custom training plans with specific exercises, sets, reps, and rest periods.',
    },
    {
      keywords: ['setting', 'theme', 'dark mode', 'light mode', 'notification', 'profile'],
      response: 'Go to **Settings** in the sidebar to customize your account. You can toggle between dark and light mode, update your profile, manage notifications, and configure app preferences. Your theme preference is saved automatically.',
    },
    {
      keywords: ['dashboard', 'home', 'overview', 'stats'],
      response: 'The **Dashboard** gives you a quick overview of your training business. You can see total revenue, upcoming sessions, client compliance stats, and follow-up alerts. It\'s designed to be your daily command center.',
    },
    {
      keywords: ['login', 'sign in', 'demo', 'try demo', 'trainer login'],
      response: 'On the login page, select **Trainer** mode and enter your credentials. If you just want to explore the platform, click **Try Demo Mode** to access the full trainer dashboard with sample data pre-loaded.',
    },
    {
      keywords: ['export', 'pdf', 'report', 'download'],
      response: 'You can export client data and program details from the respective pages. Look for export or print buttons in the client profile and program detail views. PDF reports are great for sharing progress with clients.',
    },
    {
      keywords: ['hi', 'hello', 'hey', 'good morning', 'good afternoon'],
      response: 'Hello! I\'m your AzFIT AI assistant. I can help you with creating programs, managing clients, scheduling sessions, using the Exercise Library, and more. What would you like to do today?',
    },
    {
      keywords: ['help', 'support', 'how do i', 'how to', 'what can you do'],
      response: 'I can help you navigate the AzFIT platform! Ask me about:\n\n• Creating or editing training programs\n• Adding and managing clients\n• Scheduling sessions on the calendar\n• Finding exercises in the library\n• Tracking client progress and photos\n• Using the Program Creator\n\nJust type your question or use the quick action buttons below.',
    },
  ]

  for (const item of knowledge) {
    if (item.keywords.some((k) => q.includes(k))) {
      return item.response
    }
  }
  return null
}

export default function AiChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [hasUnread, setHasUnread] = useState(false)
  const [theme, setTheme] = useState<Theme>('dark')
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hello! I'm your AzFIT AI assistant. I can help you with programs, clients, scheduling, exercises, and more. What would you like to do?",
    },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  /* Detect theme */
  useEffect(() => {
    const detect = () => {
      const saved = localStorage.getItem('azfit-theme')
      if (saved === 'light' || saved === 'dark') {
        setTheme(saved)
        return
      }
      setTheme(document.documentElement.classList.contains('light') ? 'light' : 'dark')
    }
    detect()
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail
      if (detail === 'light' || detail === 'dark') setTheme(detail)
    }
    window.addEventListener('azfit-theme-change', handler)
    const observer = new MutationObserver(() => {
      detect()
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => {
      window.removeEventListener('azfit-theme-change', handler)
      observer.disconnect()
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  /* Show unread dot when new assistant msg arrives while closed */
  useEffect(() => {
    const last = messages[messages.length - 1]
    if (last?.role === 'assistant' && !isOpen) {
      setHasUnread(true)
    }
  }, [messages, isOpen])

  useEffect(() => {
    if (isOpen) setHasUnread(false)
  }, [isOpen])

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

    const knowledge = getKnowledgeResponse(text)

    setTimeout(() => {
      setIsTyping(false)
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content:
          knowledge ??
          "I'm not sure about that yet. I can help you with programs, clients, calendar scheduling, the Exercise Library, nutrition tracking, and settings. Try asking something like 'How do I create a program?' or use the quick actions below.",
      }
      setMessages((prev) => [...prev, assistantMsg])
    }, knowledge ? 800 : 1200)
  }

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: "Hello! I'm your AzFIT AI assistant. How can I help you today?",
      },
    ])
  }

  const isDark = theme === 'dark'

  /* Theme-aware colours */
  const panelBg = isDark
    ? 'bg-[#141414]/90 border-[#2A2A2A]'
    : 'bg-white/95 border-[#E2E8F0]'
  const headerBg = isDark ? 'bg-[#0F0F0F]/80' : 'bg-[#F8FAFC]/80'
  const headerBorder = isDark ? 'border-[#2A2A2A]' : 'border-[#E2E8F0]'
  const titleText = isDark ? 'text-[#F0F0F0]' : 'text-[#0F172A]'
  const subtitleText = isDark ? 'text-[#6B6B6B]' : 'text-[#94A3B8]'
  const msgBgAssistant = isDark
    ? 'bg-[#1A1A1A] border-[#2A2A2A] text-[#F0F0F0]'
    : 'bg-[#F1F5F9] border-[#E2E8F0] text-[#0F172A]'
  const msgBgUser = 'bg-[#00AEEF] text-white'
  const inputBg = isDark ? 'bg-[#1A1A1A] border-[#2A2A2A]' : 'bg-white border-[#E2E8F0]'
  const inputText = isDark ? 'text-[#F0F0F0] placeholder:text-[#6B6B6B]' : 'text-[#0F172A] placeholder:text-[#94A3B8]'
  const quickBg = isDark
    ? 'bg-[#1A1A1A] border-[#2A2A2A] text-[#A0A0A0] hover:text-[#00AEEF] hover:border-[#00AEEF]/30'
    : 'bg-white border-[#E2E8F0] text-[#64748B] hover:text-[#00AEEF] hover:border-[#00AEEF]/30'
  const iconMuted = isDark ? 'text-[#6B6B6B]' : 'text-[#94A3B8]'
  const scrollThumb = isDark ? 'scrollbar-dark' : 'scrollbar-light'
  const typingDot = isDark ? 'bg-[#6B6B6B]' : 'bg-[#CBD5E1]'

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-5 left-5 sm:bottom-6 sm:left-6 z-[350] w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-white shadow-lg"
        style={{
          background: 'linear-gradient(135deg, #00AEEF 0%, #8B5CF6 100%)',
          boxShadow: '0 4px 20px rgba(0,174,239,0.3)',
        }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        animate={!isOpen ? {
          boxShadow: [
            '0 4px 20px rgba(0,174,239,0.3)',
            '0 4px 32px rgba(0,174,239,0.5)',
            '0 4px 20px rgba(0,174,239,0.3)',
          ],
        } : {}}
        transition={!isOpen ? { boxShadow: { duration: 2.5, repeat: Infinity } } : {}}
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
              <X size={20} />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative"
            >
              <MessageCircle size={20} />
              {/* Unread dot */}
              {hasUnread && (
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#EF4444] border-2 border-white dark:border-[#141414]" />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className={cn(
              'fixed bottom-[72px] sm:bottom-24 left-4 sm:left-6 z-[350] w-[calc(100vw-32px)] sm:w-[400px] max-w-[420px] rounded-2xl overflow-hidden flex flex-col backdrop-blur-xl',
              panelBg,
              scrollThumb,
            )}
            style={{
              height: 'min(520px, calc(100vh - 120px))',
              boxShadow: isDark
                ? '0 8px 32px rgba(0,0,0,0.5)'
                : '0 8px 32px rgba(0,0,0,0.12)',
            }}
          >
            {/* Header */}
            <div className={cn('flex items-center gap-3 px-4 py-3.5 border-b', headerBg, headerBorder)}>
              <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #00AEEF, #8B5CF6)' }}>
                <Sparkles size={16} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className={cn('font-semibold text-sm truncate', titleText)}>
                  AzFIT AI Assistant
                </h4>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
                  <span className={cn('text-xs', subtitleText)}>Online</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={clearChat}
                  className={cn('p-1.5 rounded-lg transition-colors', iconMuted, 'hover:text-[#EF4444] hover:bg-[#EF4444]/10')}
                  title="Clear chat"
                >
                  <Trash2 size={15} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className={cn('p-1.5 rounded-lg transition-colors', iconMuted, isDark ? 'hover:text-[#F0F0F0] hover:bg-[#242424]' : 'hover:text-[#0F172A] hover:bg-[#F1F5F9]')}
                >
                  <X size={18} />
                </button>
              </div>
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
                  <div
                    className={cn(
                      'w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0',
                      msg.role === 'assistant'
                        ? 'bg-gradient-to-br from-[#00AEEF] to-[#8B5CF6]'
                        : isDark ? 'bg-[#2A2A2A]' : 'bg-[#E2E8F0]'
                    )}
                  >
                    {msg.role === 'assistant' ? (
                      <Bot size={14} className="text-white" />
                    ) : (
                      <User size={14} className={isDark ? 'text-[#A0A0A0]' : 'text-[#64748B]'} />
                    )}
                  </div>
                  <div
                    className={cn(
                      'max-w-[78%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed border',
                      msg.role === 'assistant' ? msgBgAssistant : msgBgUser,
                      msg.role === 'user' ? 'rounded-br-md' : 'rounded-bl-md'
                    )}
                  >
                    {msg.content.split('\n').map((line, i) => (
                      <span key={i}>
                        {line.includes('**') ? (
                          <>
                            {line.split('**').map((part, j) =>
                              j % 2 === 1 ? (
                                <strong key={j} className="font-semibold">{part}</strong>
                              ) : (
                                part
                              )
                            )}
                          </>
                        ) : (
                          line
                        )}
                        {i < msg.content.split('\n').length - 1 && <br />}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2.5">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-[#00AEEF] to-[#8B5CF6]">
                    <Bot size={14} className="text-white" />
                  </div>
                  <div className={cn('border rounded-xl px-3.5 py-2.5', isDark ? 'bg-[#1A1A1A] border-[#2A2A2A]' : 'bg-[#F1F5F9] border-[#E2E8F0]')}>
                    <div className="flex gap-1">
                      <span className={cn('w-2 h-2 rounded-full animate-bounce', typingDot)} style={{ animationDelay: '0ms' }} />
                      <span className={cn('w-2 h-2 rounded-full animate-bounce', typingDot)} style={{ animationDelay: '150ms' }} />
                      <span className={cn('w-2 h-2 rounded-full animate-bounce', typingDot)} style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />

              {/* Quick Hints */}
              {messages.length <= 1 && (
                <div className="pt-2">
                  <p className={cn('text-xs mb-2', subtitleText)}>Quick actions:</p>
                  <div className="flex flex-wrap gap-2">
                    {quickHints.map((hint) => (
                      <button
                        key={hint.label}
                        onClick={() => handleSend(hint.label)}
                        className={cn(
                          'flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-full border transition-colors duration-200',
                          quickBg
                        )}
                      >
                        <hint.icon size={12} />
                        {hint.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className={cn('p-3.5 border-t', headerBg, headerBorder)}>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSend(input)
                  }}
                  placeholder="Type a message..."
                  className={cn(
                    'flex-1 rounded-xl px-4 py-2.5 text-sm outline-none transition-all focus:ring-1 focus:ring-[#00AEEF]/20 border',
                    inputBg,
                    inputText,
                    'focus:border-[#00AEEF]'
                  )}
                />
                <button
                  onClick={() => handleSend(input)}
                  disabled={!input.trim()}
                  className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#00AEEF] hover:bg-[#009BD6] disabled:opacity-40 disabled:hover:bg-[#00AEEF] text-white transition-all duration-200 hover:scale-105 flex-shrink-0"
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

/* Utility */
function cn(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}
