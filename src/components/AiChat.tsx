import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
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
  LayoutDashboard,
  Volume2,
  VolumeX,
  Command,
  ArrowRight,
} from 'lucide-react'

/* ═══════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════ */
interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  isCommandOutput?: boolean
}

interface ParsedCommand {
  clientId: string
  clientName: string
  action: string
  date: string
  time: string
  params: Record<string, string>
}

interface QuickAction {
  label: string
  icon: React.ElementType
  symbol: string
  path?: string
}

type Theme = 'dark' | 'light'

/* ═══════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════ */

const CLIENTS: Record<string, string> = {
  azzi: 'Azzi',
  john: 'John Smith',
  emma: 'Emma Wilson',
  sarah: 'Sarah Chen',
  mike: 'Mike Ross',
  lisa: 'Lisa Park',
  david: 'David Kim',
  rachel: 'Rachel Green',
}

const SLASH_COMMANDS: { cmd: string; desc: string; path?: string }[] = [
  { cmd: '/program', desc: 'Program Library', path: '/programs' },
  { cmd: '/create', desc: 'Program Creator', path: '/programs/create' },
  { cmd: '/client', desc: 'Clients', path: '/clients' },
  { cmd: '/calendar', desc: 'Calendar', path: '/calendar' },
  { cmd: '/exercise', desc: 'Exercise Library', path: '/exercises' },
  { cmd: '/nutrition', desc: 'Nutrition', path: '/nutrition' },
  { cmd: '/photo', desc: 'Progress Photos', path: '/photos' },
  { cmd: '/dashboard', desc: 'Dashboard', path: '/dashboard' },
  { cmd: '/setting', desc: 'Settings', path: '/settings' },
  { cmd: '/sample', desc: 'Show a sample command' },
  { cmd: '/help', desc: 'Show all commands' },
]

const TONE_STYLES: Record<string, { greeting: string; closing: string }> = {
  professional: {
    greeting: 'Dear',
    closing: 'Best regards,',
  },
  friendly: {
    greeting: 'Hey',
    closing: 'See you soon!',
  },
  coach: {
    greeting: "Let's go",
    closing: 'Crush it! 💪',
  },
}

const quickActions: QuickAction[] = [
  { label: 'Create program', icon: Dumbbell, symbol: '⌘P', path: '/programs/create' },
  { label: 'Add client', icon: Users, symbol: '⌘C', path: '/clients' },
  { label: 'Schedule', icon: CalendarDays, symbol: '⌘S', path: '/calendar' },
  { label: 'Exercises', icon: BookOpen, symbol: '⌘E', path: '/exercises' },
  { label: 'Nutrition', icon: Apple, symbol: '⌘N', path: '/nutrition' },
  { label: 'Progress', icon: Camera, symbol: '⌘T', path: '/photos' },
  { label: 'Dashboard', icon: LayoutDashboard, symbol: '⌘D', path: '/dashboard' },
  { label: 'Settings', icon: Settings, symbol: '⌘,', path: '/settings' },
]

/* ═══════════════════════════════════════════════════════
   COMMAND PARSER
   ═══════════════════════════════════════════════════════ */
function parseCommand(input: string): ParsedCommand | null {
  const trimmed = input.trim()
  if (!trimmed.startsWith('@')) return null

  // Remove @ and split by /
  const withoutAt = trimmed.slice(1)
  const parts = withoutAt.split('/').filter(Boolean)
  if (parts.length < 2) return null

  const clientId = parts[0].toLowerCase()
  const clientName = CLIENTS[clientId] || parts[0]
  const action = parts[1].toLowerCase()
  const date = parts[2] || 'today'
  const time = parts[3] || ''

  const params: Record<string, string> = {}
  for (let i = 4; i < parts.length; i++) {
    const p = parts[i]
    const colonIdx = p.indexOf(':')
    if (colonIdx > 0) {
      params[p.slice(0, colonIdx).toLowerCase()] = p.slice(colonIdx + 1)
    }
  }

  return { clientId, clientName, action, date, time, params }
}

/* ═══════════════════════════════════════════════════════
   DATE / TIME FORMATTERS
   ═══════════════════════════════════════════════════════ */
function resolveDate(dateStr: string): string {
  const today = new Date()
  const d = dateStr.toLowerCase()

  if (d === 'today') return today.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' })
  if (d === 'tomorrow') {
    const t = new Date(today)
    t.setDate(t.getDate() + 1)
    return t.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' })
  }
  if (d === 'nextweek') {
    const t = new Date(today)
    t.setDate(t.getDate() + 7)
    return t.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' })
  }

  // DD/MM/YY or DD/MM/YYYY
  const match = d.match(/(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4})/)
  if (match) {
    const [, day, month, year] = match
    const fullYear = year.length === 2 ? `20${year}` : year
    const parsed = new Date(`${fullYear}-${month}-${day}`)
    if (!isNaN(parsed.getTime())) {
      return parsed.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' })
    }
  }

  return dateStr
}

function formatTime(timeStr: string): string {
  if (!timeStr) return ''
  const t = timeStr.replace(/[:\s]/g, '')
  if (t.length === 4) return `${t.slice(0, 2)}:${t.slice(2)}`
  if (t.length === 3) return `${t.slice(0, 1)}:${t.slice(1)}`
  return timeStr
}

/* ═══════════════════════════════════════════════════════
   COMMAND MESSAGE GENERATOR
   ═══════════════════════════════════════════════════════ */
function generateCommandMessage(cmd: ParsedCommand): string {
  const { clientName, action, date, time, params } = cmd
  const resolvedDate = resolveDate(date)
  const formattedTime = formatTime(time)
  const tone = params.tone || 'friendly'
  const emoji = params.emoji || ''
  const location = params.location || ''
  const note = params.note || ''
  const style = TONE_STYLES[tone] || TONE_STYLES.friendly

  const dateTimeStr = formattedTime
    ? `${resolvedDate} at ${formattedTime}`
    : resolvedDate

  const locationStr = location ? ` at ${location}` : ''
  const noteStr = note ? ` ${note.charAt(0).toUpperCase() + note.slice(1)}.` : ''

  const messages: Record<string, string> = {
    session_reminder: `${style.greeting} ${clientName}${emoji ? ' ' + emoji : ''}, just a reminder of our session on ${dateTimeStr}${locationStr}.${noteStr} ${style.closing}`,

    session_cancel: `${style.greeting} ${clientName}${emoji ? ' ' + emoji : ''}, I wanted to let you know that our session on ${dateTimeStr}${locationStr} has been cancelled.${noteStr} We'll reschedule soon.`,

    session_reschedule: `${style.greeting} ${clientName}${emoji ? ' ' + emoji : ''}, our session has been moved to ${dateTimeStr}${locationStr}.${noteStr} Let me know if this works for you!`,

    session_confirm: `${style.greeting} ${clientName}${emoji ? ' ' + emoji : ''}, confirming our session on ${dateTimeStr}${locationStr}.${noteStr} Looking forward to it!`,

    progress_update: `${style.greeting} ${clientName}${emoji ? ' ' + emoji : ''}, here's your progress update for ${resolvedDate}.${noteStr} Keep up the great work!`,

    check_in: `Hey ${clientName}${emoji ? ' ' + emoji : ''}! How are you feeling today? Ready to crush your session${formattedTime ? ' at ' + formattedTime : ''}?${noteStr}`,

    nutrition_reminder: `Hi ${clientName}${emoji ? ' ' + emoji : ''}, don't forget to stay hydrated and prep your meals for ${resolvedDate}.${noteStr} Nutrition is key!`,

    auto_reply: `Auto-reply enabled for ${clientName}. I'll automatically confirm session requests and send reminders.${location ? ' Location set to ' + location + '.' : ''}`,

    repeat: `Recurring reminder set for ${clientName}: ${params.repeat || 'weekly'} check-ins starting ${resolvedDate}.${noteStr}`,

    cancel_all: `All upcoming sessions for ${clientName} have been cancelled.${noteStr} Please reach out to reschedule.`,
  }

  return (
    messages[action] ||
    `${style.greeting} ${clientName}${emoji ? ' ' + emoji : ''}, message regarding ${action} on ${dateTimeStr}${locationStr}.${noteStr}`
  )
}

/* ═══════════════════════════════════════════════════════
   SOUND
   ═══════════════════════════════════════════════════════ */
let audioCtx: AudioContext | null = null
function playNotificationSound(enabled: boolean) {
  if (!enabled) return
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    const osc = audioCtx.createOscillator()
    const gain = audioCtx.createGain()
    osc.connect(gain)
    gain.connect(audioCtx.destination)
    osc.type = 'sine'
    osc.frequency.setValueAtTime(523.25, audioCtx.currentTime) // C5
    osc.frequency.exponentialRampToValueAtTime(659.25, audioCtx.currentTime + 0.1) // E5
    gain.gain.setValueAtTime(0.08, audioCtx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3)
    osc.start(audioCtx.currentTime)
    osc.stop(audioCtx.currentTime + 0.3)
  } catch {
    // Audio not supported
  }
}

/* ═══════════════════════════════════════════════════════
   KNOWLEDGE BASE (with link markup)
   ═══════════════════════════════════════════════════════ */
function getKnowledgeResponse(input: string): string | null {
  const q = input.toLowerCase()

  const knowledge: { keywords: string[]; response: string }[] = [
    {
      keywords: ['create', 'program', 'build', 'new program', 'make program'],
      response: 'To create a program, go to {{link:Programs|/programs}} → {{link:Program Creator|/programs/create}}. You can build custom programs, select training methods, set duration and frequency, and assign them to clients. You can also duplicate existing programs to use as a template.',
    },
    {
      keywords: ['client', 'add client', 'new client', 'onboard'],
      response: 'To add a new client, go to {{link:Clients|/clients}} and click **+ Add Client**. You\'ll fill out a 4-step questionnaire covering personal info, health & lifestyle, fitness profile, and a final review. The client will then appear in your client list.',
    },
    {
      keywords: ['schedule', 'session', 'calendar', 'book', 'appointment'],
      response: 'Use the {{link:Calendar|/calendar}} to schedule sessions. Click any time slot to open the context menu, then choose the session type (Training, Assessment, Check-in, etc.). You can also drag and drop existing sessions to reschedule them.',
    },
    {
      keywords: ['nutrition', 'diet', 'meal', 'macros', 'calorie', 'food'],
      response: 'The {{link:Nutrition|/nutrition}} page lets you log and review client nutrition data. You can track macronutrients, meal plans, and dietary adherence. Use it alongside the client profile to see full health and fitness progress.',
    },
    {
      keywords: ['exercise', 'find exercise', 'workout', 'movement', 'video'],
      response: 'Visit the {{link:Exercise Library|/exercises}} to browse 200+ exercises with video demonstrations. You can filter by muscle group, equipment, difficulty, and exercise type. Each exercise includes a description, safety notes, and an embedded video.',
    },
    {
      keywords: ['progress', 'photo', 'measurement', 'body fat', 'weight', 'track'],
      response: 'To track client progress, go to {{link:Photos|/photos}} or open a client\'s profile page. You can upload progress photos, log measurements, body weight, and body fat percentage. Visual charts help you and your client see improvements over time.',
    },
    {
      keywords: ['program creator', 'wizard', 'all in one'],
      response: 'The {{link:Program Creator|/programs/create}} is a guided tool that walks you through building a program step-by-step. You can choose from pre-built templates or create fully custom training plans with specific exercises, sets, reps, and rest periods.',
    },
    {
      keywords: ['setting', 'theme', 'dark mode', 'light mode', 'notification', 'profile'],
      response: 'Go to {{link:Settings|/settings}} to customize your account. You can toggle between dark and light mode, update your profile, manage notifications, and configure app preferences. Your theme preference is saved automatically.',
    },
    {
      keywords: ['dashboard', 'home', 'overview', 'stats'],
      response: 'The {{link:Dashboard|/dashboard}} gives you a quick overview of your training business. You can see total revenue, upcoming sessions, client compliance stats, and follow-up alerts. It\'s designed to be your daily command center.',
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
      response: 'I can help you navigate the AzFIT platform! Ask me about:\n\n• Creating or editing training programs\n• Adding and managing clients\n• Scheduling sessions on the calendar\n• Finding exercises in the library\n• Tracking client progress and photos\n• Using the Program Creator\n\nJust type your question, use a command like `@azzi/session_reminder/tomorrow/1730`, or use the quick action buttons below.',
    },
  ]

  for (const item of knowledge) {
    if (item.keywords.some((k) => q.includes(k))) {
      return item.response
    }
  }
  return null
}

/* ═══════════════════════════════════════════════════════
   MESSAGE RENDERER — parse {{link:Text|/path}} markup
   ═══════════════════════════════════════════════════════ */
function LinkableMessage({
  content,
  onNavigate,
}: {
  content: string
  onNavigate: (path: string) => void
}) {
  const parts: React.ReactNode[] = []
  let remaining = content
  let key = 0

  const linkRegex = /\{\{link:([^|]+)\|([^}]+)\}\}/g
  let match: RegExpExecArray | null
  let lastIndex = 0

  while ((match = linkRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push(
        <PlainText key={key++} text={remaining.slice(lastIndex, match.index)} />
      )
    }
    const [, text, path] = match
    parts.push(
      <button
        key={key++}
        onClick={() => onNavigate(path)}
        className="inline-flex items-center gap-0.5 text-[#00AEEF] hover:text-[#33BEF2] hover:underline font-medium transition-colors"
      >
        {text}
        <ArrowRight size={11} className="inline" />
      </button>
    )
    lastIndex = linkRegex.lastIndex
  }

  if (lastIndex < content.length) {
    parts.push(<PlainText key={key++} text={content.slice(lastIndex)} />)
  }

  if (parts.length === 0) {
    return <PlainText text={content} />
  }

  return <>{parts}</>
}

function PlainText({ text }: { text: string }) {
  return (
    <>
      {text.split('\n').map((line, i, arr) => (
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
          {i < arr.length - 1 && <br />}
        </span>
      ))}
    </>
  )
}

/* ═══════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════ */
export default function AiChat() {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [hasUnread, setHasUnread] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [theme, setTheme] = useState<Theme>('dark')
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hello! I'm your AzFIT AI assistant. Ask me anything or use the quick actions below.",
    },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showAutocomplete, setShowAutocomplete] = useState(false)
  const [slashMatch, setSlashMatch] = useState<typeof SLASH_COMMANDS>([])
  const [clientMatch, setClientMatch] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

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
    const observer = new MutationObserver(() => detect())
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => {
      window.removeEventListener('azfit-theme-change', handler)
      observer.disconnect()
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  useEffect(() => {
    const last = messages[messages.length - 1]
    if (last?.role === 'assistant' && !isOpen) {
      setHasUnread(true)
      playNotificationSound(soundEnabled)
    }
  }, [messages, isOpen, soundEnabled])

  useEffect(() => {
    if (isOpen) setHasUnread(false)
  }, [isOpen])

  /* Autocomplete logic */
  useEffect(() => {
    const val = input.trim()
    if (val.startsWith('/')) {
      const q = val.slice(1).toLowerCase()
      const matches = SLASH_COMMANDS.filter((c) => c.cmd.slice(1).startsWith(q))
      setSlashMatch(matches)
      setShowAutocomplete(matches.length > 0)
      setClientMatch([])
    } else if (val.includes('@')) {
      const afterAt = val.slice(val.lastIndexOf('@') + 1).toLowerCase()
      const matches = Object.keys(CLIENTS).filter((k) => k.startsWith(afterAt))
      setClientMatch(matches)
      setShowAutocomplete(matches.length > 0)
      setSlashMatch([])
    } else {
      setShowAutocomplete(false)
      setSlashMatch([])
      setClientMatch([])
    }
  }, [input])

  const insertAutocomplete = useCallback((text: string) => {
    const val = input
    if (val.startsWith('/')) {
      setInput(text + ' ')
    } else if (val.includes('@')) {
      const atIndex = val.lastIndexOf('@')
      setInput(val.slice(0, atIndex) + '@' + text + '/')
    }
    setShowAutocomplete(false)
    inputRef.current?.focus()
  }, [input])

  const handleSend = useCallback((text: string) => {
    if (!text.trim()) return
    setShowAutocomplete(false)

    const trimmed = text.trim()

    /* Handle slash commands */
    if (trimmed.startsWith('/')) {
      const cmd = SLASH_COMMANDS.find((c) => trimmed.toLowerCase().startsWith(c.cmd))
      if (cmd?.path) {
        navigate(cmd.path)
        setIsOpen(false)
        return
      }
      if (trimmed === '/help') {
        const navCommands = SLASH_COMMANDS.filter((c) => c.path).map((c) => `${c.cmd} → ${c.desc}`).join('\n')
        const otherCommands = SLASH_COMMANDS.filter((c) => !c.path && c.cmd !== '/help').map((c) => `${c.cmd} → ${c.desc}`).join('\n')
        setMessages((prev) => [
          ...prev,
          { id: Date.now().toString(), role: 'user', content: trimmed },
          { id: (Date.now() + 1).toString(), role: 'assistant', content: `**Navigation**\n${navCommands}\n\n**Other**\n${otherCommands}\n\n**Client commands**\n@client/action/date/time/params\nExample: @azzi/session_reminder/tomorrow/1730` },
        ])
        setInput('')
        return
      }
      if (trimmed === '/sample') {
        const samples = [
          '@azzi/session_reminder/tomorrow/1730',
          '@john/session_cancel/31/05/26/1600/location:OnePT',
          '@emma/progress_update/week/emoji:💪/tone:coach',
          '@sarah/check_in/today/emoji:🔥/note:bring water bottle',
        ]
        const sample = samples[Math.floor(Math.random() * samples.length)]
        setMessages((prev) => [
          ...prev,
          { id: Date.now().toString(), role: 'user', content: trimmed },
          { id: (Date.now() + 1).toString(), role: 'assistant', content: `Here's a sample command you can copy and modify:\n\n**${sample}**\n\nType it in the input box and press Enter to see the generated message.` },
        ])
        setInput('')
        return
      }
    }

    /* Handle @ commands */
    const parsed = parseCommand(trimmed)
    if (parsed) {
      const output = generateCommandMessage(parsed)
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), role: 'user', content: trimmed },
        { id: (Date.now() + 1).toString(), role: 'assistant', content: output, isCommandOutput: true },
      ])
      setInput('')
      return
    }

    /* Regular knowledge query */
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: trimmed,
    }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    const knowledge = getKnowledgeResponse(trimmed)

    setTimeout(() => {
      setIsTyping(false)
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content:
          knowledge ??
          "I'm not sure about that yet. Try:\n• A knowledge question like 'How do I create a program?'\n• A command like `@azzi/session_reminder/tomorrow/1730`\n• A slash command like `/calendar`\n• Use the quick actions below.",
      }
      setMessages((prev) => [...prev, assistantMsg])
    }, knowledge ? 700 : 1100)
  }, [navigate])

  const clearChat = useCallback(() => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: "Hello! I'm your AzFIT AI assistant. Ask me anything or use the quick actions below.",
      },
    ])
  }, [])

  const isDark = theme === 'dark'

  /* Theme-aware colours — solid, no glassmorphism */
  const panelBg = isDark ? 'bg-[#141414] border-[#2A2A2A]' : 'bg-white border-[#E2E8F0]'
  const headerBg = isDark ? 'bg-[#0F0F0F]' : 'bg-[#F8FAFC]'
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
  const typingDot = isDark ? 'bg-[#6B6B6B]' : 'bg-[#CBD5E1]'
  const dropdownBg = isDark ? 'bg-[#1A1A1A] border-[#2A2A2A]' : 'bg-white border-[#E2E8F0]'
  const dropdownHover = isDark ? 'hover:bg-[#242424]' : 'hover:bg-[#F1F5F9]'
  const cmdOutputBg = isDark ? 'bg-[#00AEEF]/5 border-[#00AEEF]/20' : 'bg-[#00AEEF]/5 border-[#00AEEF]/15'

  return (
    <>
      {/* Floating Button — bottom-right */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-[350] w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-white shadow-lg"
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
              'fixed bottom-[72px] sm:bottom-24 right-4 sm:right-6 z-[350] w-[calc(100vw-32px)] sm:w-[420px] max-w-[440px] rounded-2xl overflow-hidden flex flex-col',
              panelBg,
            )}
            style={{
              height: 'min(560px, calc(100vh - 120px))',
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
                  onClick={() => setSoundEnabled((v) => !v)}
                  className={cn('p-1.5 rounded-lg transition-colors', iconMuted, soundEnabled ? 'hover:text-[#00AEEF]' : 'hover:text-[#EF4444]')}
                  title={soundEnabled ? 'Mute sound' : 'Unmute sound'}
                >
                  {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
                </button>
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
                      'max-w-[78%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed border break-words whitespace-pre-wrap',
                      msg.role === 'assistant' ? msgBgAssistant : msgBgUser,
                      msg.role === 'user' ? 'rounded-br-md' : 'rounded-bl-md',
                      msg.isCommandOutput && cmdOutputBg
                    )}
                  >
                    {msg.role === 'assistant' ? (
                      <LinkableMessage content={msg.content} onNavigate={(p) => { navigate(p); setIsOpen(false) }} />
                    ) : (
                      <PlainText text={msg.content} />
                    )}
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
                <div className="pt-2 space-y-3">
                  <p className={cn('text-xs', subtitleText)}>Quick actions:</p>
                  <div className="flex flex-wrap gap-2">
                    {quickActions.map((hint) => (
                      <button
                        key={hint.label}
                        onClick={() => {
                          if (hint.path) {
                            navigate(hint.path)
                            setIsOpen(false)
                          } else {
                            handleSend(hint.label)
                          }
                        }}
                        className={cn(
                          'flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-full border transition-colors duration-200',
                          quickBg
                        )}
                      >
                        <hint.icon size={12} />
                        {hint.label}
                        <span className={cn('text-[9px] px-1 py-0 rounded bg-[#00AEEF]/10 text-[#00AEEF] font-mono', isDark ? 'border border-[#00AEEF]/20' : '')}>
                          {hint.symbol}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className={cn('p-3.5 border-t', headerBg, headerBorder)}>
              <div className="relative">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          if (showAutocomplete && (slashMatch.length > 0 || clientMatch.length > 0)) {
                            if (slashMatch.length > 0) insertAutocomplete(slashMatch[0].cmd)
                            else if (clientMatch.length > 0) insertAutocomplete(clientMatch[0])
                          } else {
                            handleSend(input)
                          }
                        } else if (e.key === 'Escape') {
                          setShowAutocomplete(false)
                        }
                      }}
                      placeholder="Type / for commands or @ for clients..."
                      className={cn(
                        'w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all focus:ring-1 focus:ring-[#00AEEF]/20 border pr-8',
                        inputBg,
                        inputText,
                        'focus:border-[#00AEEF]'
                      )}
                    />
                    <Command size={14} className={cn('absolute right-3 top-1/2 -translate-y-1/2', iconMuted)} />
                  </div>
                  <button
                    onClick={() => handleSend(input)}
                    disabled={!input.trim()}
                    className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#00AEEF] hover:bg-[#009BD6] disabled:opacity-40 disabled:hover:bg-[#00AEEF] text-white transition-all duration-200 hover:scale-105 flex-shrink-0"
                  >
                    <Send size={16} />
                  </button>
                </div>

                {/* Autocomplete Dropdown */}
                <AnimatePresence>
                  {showAutocomplete && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.15 }}
                      className={cn('absolute bottom-full left-0 mb-1 w-full rounded-lg border shadow-lg overflow-hidden z-50', dropdownBg)}
                    >
                      {slashMatch.length > 0 && (
                        <div className="py-1">
                          {slashMatch.map((cmd) => (
                            <button
                              key={cmd.cmd}
                              onClick={() => insertAutocomplete(cmd.cmd)}
                              className={cn('w-full flex items-center justify-between px-3 py-2 text-left text-sm transition-colors', dropdownHover, isDark ? 'text-[#F0F0F0]' : 'text-[#0F172A]')}
                            >
                              <span className="font-mono text-[#00AEEF]">{cmd.cmd}</span>
                              <span className={cn('text-xs', subtitleText)}>{cmd.desc}</span>
                            </button>
                          ))}
                        </div>
                      )}
                      {clientMatch.length > 0 && (
                        <div className="py-1">
                          {clientMatch.map((client) => (
                            <button
                              key={client}
                              onClick={() => insertAutocomplete(client)}
                              className={cn('w-full flex items-center justify-between px-3 py-2 text-left text-sm transition-colors', dropdownHover, isDark ? 'text-[#F0F0F0]' : 'text-[#0F172A]')}
                            >
                              <span className="font-semibold">@{client}</span>
                              <span className={cn('text-xs', subtitleText)}>{CLIENTS[client]}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
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
