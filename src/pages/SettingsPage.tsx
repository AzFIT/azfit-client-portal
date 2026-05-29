import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Monitor,
  Bell,
  Palette,
  Shield,
  User,
  Database,
  Plug,
  Camera,
  CalendarDays,
  Smartphone,
  Globe,
  Eye,
  EyeOff,
  Copy,
  Check,
  Trash2,
  Upload,
  Download,
  RefreshCw,
  Moon,
  Sun,
  MonitorIcon,
  CheckCircle2,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

/* ═══════════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════════ */

type SectionId = 'display' | 'notifications' | 'appearance' | 'privacy' | 'account' | 'data' | 'integrations'

interface SectionDef {
  id: SectionId
  label: string
  icon: React.ElementType
}

/* ═══════════════════════════════════════════════════════════
   Constants
   ═══════════════════════════════════════════════════════════ */

const sections: SectionDef[] = [
  { id: 'display', label: 'Display', icon: Monitor },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'privacy', label: 'Privacy', icon: Shield },
  { id: 'account', label: 'Account', icon: User },
  { id: 'data', label: 'Data', icon: Database },
  { id: 'integrations', label: 'Integrations', icon: Plug },
]

const accentColors = [
  { name: 'Cyan', value: '#00AEEF' },
  { name: 'Purple', value: '#8B5CF6' },
  { name: 'Green', value: '#22C55E' },
  { name: 'Pink', value: '#EC4899' },
]

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number]

/* ═══════════════════════════════════════════════════════════
   Shared Sub-Components
   ═══════════════════════════════════════════════════════════ */

function SectionCard({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-6 mb-5">
      <h3 className="text-[#F0F0F0] text-base font-semibold mb-1">{title}</h3>
      {description && <p className="text-[#6B6B6B] text-sm mb-4">{description}</p>}
      <div className="mt-4">{children}</div>
    </div>
  )
}

function ToggleRow({
  title,
  description,
  checked,
  onCheckedChange,
}: {
  title: string
  description?: string
  checked: boolean
  onCheckedChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-[#1F1F1F] last:border-0">
      <div className="flex-1 pr-4">
        <p className="text-[#F0F0F0] text-sm font-medium">{title}</p>
        {description && <p className="text-[#6B6B6B] text-xs mt-0.5">{description}</p>}
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   Section 1: Display Preferences
   ═══════════════════════════════════════════════════════════ */

function SegmentedControl({
  options,
  value,
  onChange,
  disabled,
}: {
  options: string[]
  value: string
  onChange: (v: string) => void
  disabled?: boolean
}) {
  return (
    <div className={`inline-flex bg-[#1A1A1A] rounded-lg p-0.5 border border-[#2A2A2A] ${disabled ? 'opacity-50' : ''}`}>
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => !disabled && onChange(opt)}
          className={`px-3 py-1.5 text-sm rounded-md transition-all duration-200 ${
            value === opt
              ? 'bg-[#242424] text-[#00AEEF] font-medium'
              : 'text-[#A0A0A0] hover:text-[#F0F0F0]'
          }`}
          disabled={disabled}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}

function DisplaySection() {
  const [units, setUnits] = useState<'Metric' | 'Imperial'>('Metric')
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY')
  const [timeFormat, setTimeFormat] = useState<'24-hour' | '12-hour'>('24-hour')
  const [language, setLanguage] = useState('English')

  return (
    <div>
      <SectionCard title="Date &amp; Time" description="Configure how dates and times are displayed.">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-[#A0A0A0] text-sm">Date Format</Label>
            <SegmentedControl options={['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD']} value={dateFormat} onChange={setDateFormat} />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-[#A0A0A0] text-sm">Time Format</Label>
            <SegmentedControl options={['24-hour', '12-hour']} value={timeFormat} onChange={(v: string) => setTimeFormat(v as '24-hour' | '12-hour')} />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-[#A0A0A0] text-sm">Timezone</Label>
            <Select defaultValue="Asia/Hong_Kong" disabled>
              <SelectTrigger className="w-[220px] bg-[#1A1A1A] border-[#2A2A2A] text-[#F0F0F0] opacity-60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">
                <SelectItem value="Asia/Hong_Kong">Asia/Hong Kong (GMT+8)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Measurement Units" description="Choose your preferred units for weight, height, and distance.">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-[#A0A0A0] text-sm">Units System</Label>
            <SegmentedControl options={['Metric', 'Imperial']} value={units} onChange={(v) => setUnits(v as 'Metric' | 'Imperial')} />
          </div>
          <div className="flex items-center gap-6 text-sm">
            <span className="text-[#6B6B6B]">Weight: <span className="text-[#A0A0A0]">{units === 'Metric' ? 'kg' : 'lb'}</span></span>
            <span className="text-[#6B6B6B]">Height: <span className="text-[#A0A0A0]">{units === 'Metric' ? 'cm' : 'in'}</span></span>
            <span className="text-[#6B6B6B]">Body Fat: <span className="text-[#A0A0A0]">%</span></span>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Currency" description="Currency display for all monetary values.">
        <div className="flex items-center justify-between">
          <Label className="text-[#A0A0A0] text-sm">Currency</Label>
          <div className="flex items-center gap-3">
            <span className="text-[#6B6B6B] text-sm">HKD (locked)</span>
            <Select defaultValue="HKD" disabled>
              <SelectTrigger className="w-[160px] bg-[#1A1A1A] border-[#2A2A2A] text-[#F0F0F0] opacity-60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">
                <SelectItem value="HKD">HKD</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Language" description="Select your preferred interface language.">
        <div className="flex items-center justify-between">
          <Label className="text-[#A0A0A0] text-sm">Language</Label>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-[200px] bg-[#1A1A1A] border-[#2A2A2A] text-[#F0F0F0]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">
              <SelectItem value="English">English</SelectItem>
              <SelectItem value="zh-HK">繁體中文</SelectItem>
              <SelectItem value="zh-CN">简体中文</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </SectionCard>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   Section 2: Notifications
   ═══════════════════════════════════════════════════════════ */

function NotificationsSection() {
  const [emailToggles, setEmailToggles] = useState({
    weeklySummary: true,
    sessionReminders: true,
    clientUpdates: true,
    systemAlerts: true,
  })
  const [pushToggles, setPushToggles] = useState({
    sessionReminders: true,
    clientMessages: true,
    goalMilestones: true,
  })
  const [inApp, _setInApp] = useState<'All' | 'Mentions only' | 'None'>('All')
  const [quietHours, setQuietHours] = useState(true)
  const [channel, setChannel] = useState<'email' | 'push' | 'inapp'>('email')

  const updateEmail = (key: string, v: boolean) =>
    setEmailToggles((p) => ({ ...p, [key]: v }))
  const updatePush = (key: string, v: boolean) =>
    setPushToggles((p) => ({ ...p, [key]: v }))

  return (
    <div>
      {/* Channel tabs */}
      <div className="inline-flex bg-[#1A1A1A] rounded-lg p-0.5 border border-[#2A2A2A] mb-5">
        {(['email', 'push', 'inapp'] as const).map((c) => (
          <button
            key={c}
            onClick={() => setChannel(c)}
            className={`px-4 py-1.5 text-sm rounded-md transition-all capitalize ${
              channel === c ? 'bg-[#242424] text-[#00AEEF] font-medium' : 'text-[#A0A0A0] hover:text-[#F0F0F0]'
            }`}
          >
            {c === 'inapp' ? 'In-App' : c}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {channel === 'email' && (
          <motion.div key="email" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <SectionCard title="Email Notifications">
              <ToggleRow title="Weekly summary" description="Receive a weekly progress and schedule summary." checked={emailToggles.weeklySummary} onCheckedChange={(v) => updateEmail('weeklySummary', v)} />
              <ToggleRow title="Session reminders" description="Reminder 24h and 1h before your sessions." checked={emailToggles.sessionReminders} onCheckedChange={(v) => updateEmail('sessionReminders', v)} />
              <ToggleRow title="Client updates" description="Missed check-ins, low adherence alerts, etc." checked={emailToggles.clientUpdates} onCheckedChange={(v) => updateEmail('clientUpdates', v)} />
              <ToggleRow title="System alerts" description="Login from new device, password changes." checked={emailToggles.systemAlerts} onCheckedChange={(v) => updateEmail('systemAlerts', v)} />
            </SectionCard>
          </motion.div>
        )}
        {channel === 'push' && (
          <motion.div key="push" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <SectionCard title="Push Notifications">
              <ToggleRow title="Session reminders" description="Push notification before scheduled sessions." checked={pushToggles.sessionReminders} onCheckedChange={(v) => updatePush('sessionReminders', v)} />
              <ToggleRow title="Client messages" description="When clients send you a message." checked={pushToggles.clientMessages} onCheckedChange={(v) => updatePush('clientMessages', v)} />
              <ToggleRow title="Goal milestones" description="When clients reach a goal milestone." checked={pushToggles.goalMilestones} onCheckedChange={(v) => updatePush('goalMilestones', v)} />
            </SectionCard>
          </motion.div>
        )}
        {channel === 'inapp' && (
          <motion.div key="inapp" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <SectionCard title="In-App Notifications" description="Control which notifications appear inside the app.">
              <div className="space-y-3">
                {(['All', 'Mentions only', 'None'] as const).map((opt) => (
                  <label key={opt} className="flex items-center gap-3 p-3 rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] cursor-pointer hover:border-[#3A3A3A] transition-colors">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${inApp === opt ? 'border-[#00AEEF]' : 'border-[#6B6B6B]'}`}>
                      {inApp === opt && <div className="w-2 h-2 rounded-full bg-[#00AEEF]" />}
                    </div>
                    <span className="text-[#F0F0F0] text-sm">{opt}</span>
                  </label>
                ))}
              </div>
            </SectionCard>
          </motion.div>
        )}
      </AnimatePresence>

      <SectionCard title="Quiet Hours" description="Pause notifications during sleep hours.">
        <ToggleRow title="Enable quiet hours" description="22:00 - 07:00 — notifications will be silenced." checked={quietHours} onCheckedChange={setQuietHours} />
      </SectionCard>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   Section 3: Appearance
   ═══════════════════════════════════════════════════════════ */

function ThemeCard({
  icon: Icon,
  label,
  selected,
  onClick,
}: {
  icon: React.ElementType
  label: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${
        selected ? 'border-[#00AEEF] bg-[rgba(0,174,239,0.08)]' : 'border-[#2A2A2A] bg-[#1A1A1A] hover:border-[#3A3A3A]'
      }`}
    >
      <Icon size={24} className={selected ? 'text-[#00AEEF]' : 'text-[#A0A0A0]'} />
      <span className={`text-sm ${selected ? 'text-[#00AEEF] font-medium' : 'text-[#A0A0A0]'}`}>{label}</span>
      {selected && <CheckCircle2 size={16} className="text-[#00AEEF] absolute top-2 right-2" />}
    </button>
  )
}

function AppearanceSection() {
  const resolveTheme = (t: string | null): 'Dark' | 'Light' => {
    if (t === 'light' || t === 'Dark') return 'Light'
    if (t === 'dark' || t === 'Light') return 'Dark'
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    return prefersDark ? 'Dark' : 'Light'
  }

  const [theme, setThemeState] = useState<'Dark' | 'Light'>(() => {
    return resolveTheme(localStorage.getItem('azfit-theme'))
  })

  useEffect(() => {
    const handler = (e: Event) => {
      const custom = e as CustomEvent
      setThemeState(custom.detail === 'dark' ? 'Dark' : 'Light')
    }
    window.addEventListener('azfit-theme-change', handler)
    return () => window.removeEventListener('azfit-theme-change', handler)
  }, [])

  const setGlobalTheme = (mode: 'Dark' | 'Light') => {
    const t = mode === 'Dark' ? 'dark' : 'light'
    localStorage.setItem('azfit-theme', t)
    window.dispatchEvent(new CustomEvent('azfit-theme-change', { detail: t }))
    document.documentElement.classList.remove('dark', 'light')
    document.documentElement.classList.add(t)
    setThemeState(mode)
  }

  const [accent, setAccent] = useState('#00AEEF')
  const [density, setDensity] = useState<'Comfortable' | 'Compact' | 'Spacious'>('Comfortable')
  const [animations, setAnimations] = useState(true)

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-2 space-y-5">
        <SectionCard title="Theme Mode">
          <div className="grid grid-cols-3 gap-3">
            <ThemeCard icon={Moon} label="Dark" selected={theme === 'Dark'} onClick={() => setGlobalTheme('Dark')} />
            <ThemeCard icon={Sun} label="Light" selected={theme === 'Light'} onClick={() => setGlobalTheme('Light')} />
            <ThemeCard icon={MonitorIcon} label="System" selected={false} onClick={() => {
              const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
              setGlobalTheme(prefersDark ? 'Dark' : 'Light')
            }} />
          </div>
        </SectionCard>

        <SectionCard title="Accent Color">
          <div className="flex items-center gap-4">
            {accentColors.map((c) => (
              <button
                key={c.value}
                onClick={() => setAccent(c.value)}
                className="group relative"
                aria-label={`Select ${c.name} accent`}
              >
                <div
                  className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ${
                    accent === c.value ? 'scale-110' : 'border-transparent group-hover:scale-105'
                  }`}
                  style={{
                    backgroundColor: c.value,
                    borderColor: accent === c.value ? c.value : 'transparent',
                    boxShadow: accent === c.value ? `0 0 0 3px ${c.value}33` : 'none',
                  }}
                />
                {accent === c.value && (
                  <Check size={14} className="absolute inset-0 m-auto text-white" strokeWidth={3} />
                )}
              </button>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="UI Density">
          <SegmentedControl
            options={['Compact', 'Comfortable', 'Spacious']}
            value={density}
            onChange={(v) => setDensity(v as typeof density)}
          />
        </SectionCard>

        <SectionCard title="Animations">
          <ToggleRow title="Enable animations" description="Page transitions, micro-interactions, and scroll animations." checked={animations} onCheckedChange={setAnimations} />
        </SectionCard>
      </div>

      {/* Preview panel */}
      <div className="xl:col-span-1">
        <div className="sticky top-4">
          <SectionCard title="Preview">
            <div
              className="rounded-xl p-4 border transition-all duration-300"
              style={{
                backgroundColor: theme === 'Light' ? '#F8F9FA' : '#0A0A0A',
                borderColor: theme === 'Light' ? '#E5E7EB' : '#2A2A2A',
                padding: density === 'Compact' ? '8px' : density === 'Spacious' ? '24px' : '16px',
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: accent }}>A</div>
                <div>
                  <p className="text-sm font-medium" style={{ color: theme === 'Light' ? '#111827' : '#F0F0F0' }}>Sample Card</p>
                  <p className="text-xs" style={{ color: theme === 'Light' ? '#6B7280' : '#6B6B6B' }}>Preview your settings</p>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="h-2 flex-1 rounded-full" style={{ backgroundColor: accent, opacity: 0.3 }} />
                <div className="h-2 flex-1 rounded-full" style={{ backgroundColor: accent, opacity: 0.3 }} />
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs" style={{ color: theme === 'Light' ? '#6B7280' : '#A0A0A0' }}>Density: {density}</span>
                <div className="w-8 h-4 rounded-full relative" style={{ backgroundColor: accent }}>
                  <div className="absolute right-0.5 top-0.5 w-3 h-3 rounded-full bg-white" />
                </div>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   Section 4: Privacy
   ═══════════════════════════════════════════════════════════ */

function PrivacySection() {
  const [profileVisibility, _setProfileVisibility] = useState<'Trainers only' | 'All authenticated' | 'Public'>('Trainers only')
  const [activityStatus, setActivityStatus] = useState(true)
  const [dataCollection, setDataCollection] = useState(true)
  const [readReceipt, setReadReceipt] = useState(true)
  const [dataSharing, setDataSharing] = useState(false)

  return (
    <div>
      <SectionCard title="Profile Visibility" description="Who can see your profile and credentials.">
        <div className="space-y-2">
          {(['Trainers only', 'All authenticated', 'Public'] as const).map((opt) => (
            <label key={opt} className="flex items-center gap-3 p-3 rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] cursor-pointer hover:border-[#3A3A3A] transition-colors">
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${profileVisibility === opt ? 'border-[#00AEEF]' : 'border-[#6B6B6B]'}`}>
                {profileVisibility === opt && <div className="w-2 h-2 rounded-full bg-[#00AEEF]" />}
              </div>
              <span className="text-[#F0F0F0] text-sm">{opt}</span>
            </label>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Activity Status">
        <ToggleRow title="Show when I'm online" description="Display an online indicator to others." checked={activityStatus} onCheckedChange={setActivityStatus} />
        <ToggleRow title="Show when I read messages" description="Others can see when you've read their messages." checked={readReceipt} onCheckedChange={setReadReceipt} />
      </SectionCard>

      <SectionCard title="Data Collection">
        <ToggleRow title="Allow analytics" description="Help improve AzFIT by sharing anonymous usage data." checked={dataCollection} onCheckedChange={setDataCollection} />
        <ToggleRow title="Allow data sharing" description="Allow trainers to share anonymized data for research." checked={dataSharing} onCheckedChange={setDataSharing} />
      </SectionCard>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   Section 5: Account
   ═══════════════════════════════════════════════════════════ */

function AccountSection() {
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [avatar, setAvatar] = useState<string | null>(null)
  const [name, setName] = useState('Azwar H.')
  const [email] = useState('azwar@aztechfit.hk')
  const [phone, setPhone] = useState('9123 4567')
  const [bio, setBio] = useState('Certified personal trainer specializing in body composition transformation.')
  const [sessions] = useState([
    { id: '1', device: 'MacBook Pro', browser: 'Chrome', location: 'Hong Kong', current: true, lastActive: 'Current session' },
    { id: '2', device: 'iPhone 15 Pro', browser: 'Safari', location: 'Hong Kong', current: false, lastActive: '2 hours ago' },
    { id: '3', device: 'iPad Air', browser: 'Chrome', location: 'Hong Kong', current: false, lastActive: '3 days ago' },
  ])

  const handleAvatarChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setAvatar(url)
    }
  }, [])

  return (
    <div>
      {/* Profile Card */}
      <SectionCard title="Profile">
        <div className="flex items-start gap-6 mb-6">
          <div className="relative flex-shrink-0">
            <img
              src={avatar || '/avatar-placeholder.png'}
              alt="Profile"
              className="w-20 h-20 rounded-full object-cover border-2 border-[#2A2A2A]"
            />
            <label className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#00AEEF] hover:bg-[#009BD6] rounded-full flex items-center justify-center cursor-pointer transition-colors shadow-lg">
              <Camera size={14} className="text-white" />
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </label>
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <Label className="text-[#A0A0A0] text-xs mb-1">Full Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} className="bg-[#1A1A1A] border-[#2A2A2A] text-[#F0F0F0]" />
            </div>
            <div>
              <Label className="text-[#A0A0A0] text-xs mb-1">Email</Label>
              <div className="flex items-center gap-2">
                <Input value={email} disabled className="bg-[#1A1A1A] border-[#2A2A2A] text-[#F0F0F0] opacity-60" />
                <Button variant="ghost" size="sm" className="text-[#00AEEF] hover:text-[#009BD6] shrink-0">Change</Button>
              </div>
            </div>
            <div>
              <Label className="text-[#A0A0A0] text-xs mb-1">Phone</Label>
              <div className="flex items-center gap-2">
                <span className="text-[#A0A0A0] text-sm bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2">+852</span>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="bg-[#1A1A1A] border-[#2A2A2A] text-[#F0F0F0] flex-1" />
              </div>
            </div>
            <div>
              <Label className="text-[#A0A0A0] text-xs mb-1">Bio <span className="text-[#6B6B6B]">({bio.length}/200)</span></Label>
              <Textarea value={bio} onChange={(e) => setBio(e.target.value.slice(0, 200))} className="bg-[#1A1A1A] border-[#2A2A2A] text-[#F0F0F0] min-h-[80px]" />
            </div>
            <Button className="bg-[#00AEEF] hover:bg-[#009BD6] text-white">Save Changes</Button>
          </div>
        </div>
      </SectionCard>

      {/* Password */}
      <SectionCard title="Change Password">
        <div className="space-y-3 max-w-md">
          <div className="relative">
            <Label className="text-[#A0A0A0] text-xs mb-1">Current Password</Label>
            <Input type={showCurrent ? 'text' : 'password'} placeholder="••••••••" className="bg-[#1A1A1A] border-[#2A2A2A] text-[#F0F0F0] pr-10" />
            <button onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-[26px] text-[#6B6B6B] hover:text-[#A0A0A0]">
              {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <div className="relative">
            <Label className="text-[#A0A0A0] text-xs mb-1">New Password</Label>
            <Input type={showNew ? 'text' : 'password'} placeholder="••••••••" className="bg-[#1A1A1A] border-[#2A2A2A] text-[#F0F0F0] pr-10" />
            <button onClick={() => setShowNew(!showNew)} className="absolute right-3 top-[26px] text-[#6B6B6B] hover:text-[#A0A0A0]">
              {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <div className="relative">
            <Label className="text-[#A0A0A0] text-xs mb-1">Confirm New Password</Label>
            <Input type={showConfirm ? 'text' : 'password'} placeholder="••••••••" className="bg-[#1A1A1A] border-[#2A2A2A] text-[#F0F0F0] pr-10" />
            <button onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-[26px] text-[#6B6B6B] hover:text-[#A0A0A0]">
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <Button className="bg-[#00AEEF] hover:bg-[#009BD6] text-white">Update Password</Button>
        </div>
      </SectionCard>

      {/* Two-Factor Auth */}
      <SectionCard title="Two-Factor Authentication">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <p className="text-[#F0F0F0] text-sm font-medium">Status</p>
              <span className="px-2 py-0.5 text-xs rounded-full bg-[rgba(234,179,8,0.15)] text-[#EAB308] font-medium">Not enabled</span>
            </div>
            <p className="text-[#6B6B6B] text-xs">Add an extra layer of security to your account.</p>
          </div>
          <Button variant="outline" className="border-[#00AEEF] text-[#00AEEF] hover:bg-[rgba(0,174,239,0.1)]">Enable 2FA</Button>
        </div>
      </SectionCard>

      {/* Active Sessions */}
      <SectionCard title="Active Sessions" description="You're signed in on these devices.">
        <div className="space-y-3">
          {sessions.map((s) => (
            <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-[#1A1A1A] border border-[#2A2A2A]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#242424] flex items-center justify-center">
                  <Smartphone size={16} className="text-[#A0A0A0]" />
                </div>
                <div>
                  <p className="text-[#F0F0F0] text-sm font-medium">{s.device} — {s.browser}</p>
                  <p className="text-[#6B6B6B] text-xs">{s.location} · {s.lastActive}</p>
                </div>
              </div>
              {s.current ? (
                <span className="text-[#22C55E] text-xs font-medium">Current</span>
              ) : (
                <Button variant="ghost" size="sm" className="text-[#EF4444] hover:text-[#DC2626] hover:bg-[rgba(239,68,68,0.1)]">Revoke</Button>
              )}
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Danger Zone */}
      <div className="bg-[#141414] border border-[rgba(239,68,68,0.3)] rounded-xl p-6 mb-5">
        <h3 className="text-[#EF4444] text-base font-semibold mb-4 flex items-center gap-2">
          <Trash2 size={16} />
          Danger Zone
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#F0F0F0] text-sm font-medium">Deactivate Account</p>
              <p className="text-[#6B6B6B] text-xs">Temporarily disable your account. You can reactivate anytime.</p>
            </div>
            <Button variant="outline" className="border-[#EF4444] text-[#EF4444] hover:bg-[rgba(239,68,68,0.1)]">Deactivate</Button>
          </div>
          <div className="h-px bg-[rgba(239,68,68,0.2)]" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#F0F0F0] text-sm font-medium">Delete Account</p>
              <p className="text-[#6B6B6B] text-xs">Permanently delete your account and all data. This cannot be undone.</p>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-[#EF4444] hover:bg-[#DC2626] text-white">Delete Account</Button>
              </DialogTrigger>
              <DialogContent className="bg-[#141414] border-[#2A2A2A] text-[#F0F0F0] max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-[#EF4444]">Delete Account</DialogTitle>
                  <DialogDescription className="text-[#6B6B6B]">
                    This action is permanent and cannot be undone. All your data will be permanently removed.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Label className="text-[#A0A0A0] text-sm mb-2">Type DELETE to confirm</Label>
                  <Input placeholder="DELETE" className="bg-[#1A1A1A] border-[#2A2A2A] text-[#F0F0F0]" />
                </div>
                <DialogFooter>
                  <Button variant="ghost" className="text-[#A0A0A0]">Cancel</Button>
                  <Button className="bg-[#EF4444] hover:bg-[#DC2626] text-white">Permanently Delete</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   Section 6: Data Management
   ═══════════════════════════════════════════════════════════ */

function DataSection() {
  const [exportFormat, setExportFormat] = useState<'JSON' | 'CSV'>('JSON')
  const [importFiles, setImportFiles] = useState<File[]>([])
  const [lastBackup] = useState('15/04/2026 03:00')
  const [storageUsed] = useState(62)

  const handleImportDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      ['application/json', 'text/csv'].includes(f.type) || f.name.endsWith('.json') || f.name.endsWith('.csv')
    )
    setImportFiles(files)
  }, [])

  return (
    <div>
      <SectionCard title="Export Your Data" description="Download all your data in your preferred format.">
        <div className="space-y-4">
          <div>
            <Label className="text-[#A0A0A0] text-sm mb-2">Format</Label>
            <SegmentedControl options={['JSON', 'CSV']} value={exportFormat} onChange={(v) => setExportFormat(v as 'JSON' | 'CSV')} />
          </div>
          <Button className="bg-[#00AEEF] hover:bg-[#009BD6] text-white">
            <Download size={16} className="mr-2" />
            Export Data
          </Button>
        </div>
      </SectionCard>

      <SectionCard title="Import Data" description="Import data from a previous export or another platform.">
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleImportDrop}
          className="border-2 border-dashed border-[#2A2A2A] hover:border-[#00AEEF] rounded-xl bg-[#1A1A1A] p-8 text-center transition-colors cursor-pointer"
          onClick={() => document.getElementById('import-file')?.click()}
        >
          <Upload size={32} className="mx-auto text-[#6B6B6B] mb-3" />
          <p className="text-[#A0A0A0] text-sm mb-1">Drag files here or click to browse</p>
          <p className="text-[#6B6B6B] text-xs">JSON, CSV supported</p>
          <input
            id="import-file"
            type="file"
            accept=".json,.csv"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && setImportFiles(Array.from(e.target.files))}
          />
        </div>
        {importFiles.length > 0 && (
          <div className="mt-3 space-y-2">
            {importFiles.map((f, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-[#1A1A1A] border border-[#2A2A2A]">
                <span className="text-[#F0F0F0] text-sm">{f.name}</span>
                <span className="text-[#6B6B6B] text-xs">{(f.size / 1024).toFixed(0)} KB</span>
              </div>
            ))}
            <Button className="mt-2 bg-[#00AEEF] hover:bg-[#009BD6] text-white">
              <Upload size={16} className="mr-2" />
              Import {importFiles.length} File{importFiles.length > 1 ? 's' : ''}
            </Button>
          </div>
        )}
      </SectionCard>

      <SectionCard title="Backup" description="Automatic backups are created weekly.">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[#F0F0F0] text-sm">Last backup: <span className="text-[#A0A0A0]">{lastBackup}</span></p>
            <p className="text-[#6B6B6B] text-xs mt-1">Next backup: 22/04/2026 03:00</p>
          </div>
          <Button variant="outline" className="border-[#00AEEF] text-[#00AEEF] hover:bg-[rgba(0,174,239,0.1)]">
            <RefreshCw size={16} className="mr-2" />
            Backup Now
          </Button>
        </div>
      </SectionCard>

      <SectionCard title="Storage Usage">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#A0A0A0]">1.2 GB / 5 GB used</span>
            <span className="text-[#00AEEF] font-medium">{storageUsed}%</span>
          </div>
          <Progress value={storageUsed} className="h-2 bg-[#1A1A1A] [&>div]:bg-[#00AEEF]" />
          <div className="flex gap-4 text-xs text-[#6B6B6B] pt-2">
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#00AEEF]" /> Photos (60%)</span>
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#8B5CF6]" /> Documents (25%)</span>
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#F97316]" /> Other (15%)</span>
          </div>
        </div>
      </SectionCard>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   Section 7: Integrations
   ═══════════════════════════════════════════════════════════ */

function IntegrationsSection() {
  const [googleSheets, setGoogleSheets] = useState(false)
  const [icalUrl] = useState('https://azfit.app/api/calendar/ical/abc123')
  const [apiKey, setApiKey] = useState('sk_live_abc123_xyz789')
  const [showKey, setShowKey] = useState(false)
  const [copied, setCopied] = useState(false)
  const [webhookUrl, setWebhookUrl] = useState('')
  const [webhookSecret, setWebhookSecret] = useState('')

  const handleCopy = useCallback((text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [])

  return (
    <div>
      <SectionCard title="Connected Apps">
        <div className="space-y-3">
          {/* Google Sheets */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-[#1A1A1A] border border-[#2A2A2A]">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-[#242424] flex items-center justify-center">
                <Globe size={20} className="text-[#22C55E]" />
              </div>
              <div>
                <p className="text-[#F0F0F0] text-sm font-medium">Google Sheets</p>
                <p className="text-[#6B6B6B] text-xs">Sync client data to spreadsheets</p>
              </div>
            </div>
            {googleSheets ? (
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-xs rounded-full bg-[rgba(34,197,94,0.15)] text-[#22C55E] font-medium">Connected</span>
                <Button variant="ghost" size="sm" className="text-[#EF4444] hover:text-[#DC2626]" onClick={() => setGoogleSheets(false)}>Disconnect</Button>
              </div>
            ) : (
              <Button size="sm" className="bg-[#00AEEF] hover:bg-[#009BD6] text-white" onClick={() => setGoogleSheets(true)}>Connect</Button>
            )}
          </div>

          {/* Calendar Sync */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-[#1A1A1A] border border-[#2A2A2A]">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-[#242424] flex items-center justify-center">
                <CalendarDays size={20} className="text-[#8B5CF6]" />
              </div>
              <div>
                <p className="text-[#F0F0F0] text-sm font-medium">Calendar Sync</p>
                <p className="text-[#6B6B6B] text-xs">iCal feed for external calendars</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <code className="text-xs text-[#A0A0A0] bg-[#0A0A0A] px-2 py-1 rounded border border-[#2A2A2A] hidden sm:block max-w-[200px] truncate">{icalUrl}</code>
              <Button variant="ghost" size="sm" className="text-[#00AEEF] hover:text-[#009BD6]" onClick={() => handleCopy(icalUrl)}>
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </Button>
            </div>
          </div>

          {/* WhatsApp */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-[#1A1A1A] border border-[#2A2A2A]">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-[#242424] flex items-center justify-center">
                <Smartphone size={20} className="text-[#22C55E]" />
              </div>
              <div>
                <p className="text-[#F0F0F0] text-sm font-medium">WhatsApp Business</p>
                <p className="text-[#6B6B6B] text-xs">Send client reminders via WhatsApp</p>
              </div>
            </div>
            <Button size="sm" variant="outline" className="border-[#00AEEF] text-[#00AEEF] hover:bg-[rgba(0,174,239,0.1)]">Setup</Button>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="API Keys" description="Manage API keys for third-party integrations.">
        <div className="space-y-3">
          <Label className="text-[#A0A0A0] text-xs">Live API Key</Label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="bg-[#1A1A1A] border-[#2A2A2A] text-[#F0F0F0] pr-20"
              />
              <button
                onClick={() => setShowKey(!showKey)}
                className="absolute right-10 top-1/2 -translate-y-1/2 text-[#6B6B6B] hover:text-[#A0A0A0]"
              >
                {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <Button variant="ghost" size="icon" className="text-[#00AEEF] hover:text-[#009BD6]" onClick={() => handleCopy(apiKey)}>
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </Button>
            <Button variant="outline" size="sm" className="border-[#2A2A2A] text-[#A0A0A0] hover:text-[#F0F0F0] shrink-0">
              <RefreshCw size={14} className="mr-1" />
              Regenerate
            </Button>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Webhooks" description="Receive real-time event notifications.">
        <div className="space-y-3">
          <div>
            <Label className="text-[#A0A0A0] text-xs mb-1">Webhook URL</Label>
            <Input value={webhookUrl} onChange={(e) => setWebhookUrl(e.target.value)} placeholder="https://your-app.com/webhook" className="bg-[#1A1A1A] border-[#2A2A2A] text-[#F0F0F0]" />
          </div>
          <div>
            <Label className="text-[#A0A0A0] text-xs mb-1">Secret Key</Label>
            <Input value={webhookSecret} onChange={(e) => setWebhookSecret(e.target.value)} placeholder="whsec_..." className="bg-[#1A1A1A] border-[#2A2A2A] text-[#F0F0F0]" />
          </div>
          <div className="flex gap-2">
            <Button className="bg-[#00AEEF] hover:bg-[#009BD6] text-white">Add Webhook</Button>
            <Button variant="outline" className="border-[#2A2A2A] text-[#A0A0A0]">Send Test</Button>
          </div>
        </div>
      </SectionCard>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   Main Settings Page
   ═══════════════════════════════════════════════════════════ */

export default function SettingsPage() {
  const [active, setActive] = useState<SectionId>('display')

  const renderSection = () => {
    switch (active) {
      case 'display': return <DisplaySection />
      case 'notifications': return <NotificationsSection />
      case 'appearance': return <AppearanceSection />
      case 'privacy': return <PrivacySection />
      case 'account': return <AccountSection />
      case 'data': return <DataSection />
      case 'integrations': return <IntegrationsSection />
      default: return <DisplaySection />
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease }}
      className="flex flex-col lg:flex-row gap-6"
    >
      {/* Settings Sidebar */}
      <aside className="lg:w-[200px] flex-shrink-0">
        <div className="lg:sticky lg:top-4 bg-[#141414] border border-[#2A2A2A] rounded-xl overflow-hidden">
          <nav className="py-2">
            {sections.map((s) => {
              const Icon = s.icon
              const isActive = active === s.id
              return (
                <button
                  key={s.id}
                  onClick={() => setActive(s.id)}
                  className={`w-full flex items-center gap-3 h-10 px-4 text-sm transition-all duration-200 relative ${
                    isActive
                      ? 'text-[#00AEEF] font-medium'
                      : 'text-[#A0A0A0] hover:text-[#F0F0F0] hover:bg-[#242424]'
                  }`}
                  style={isActive ? { background: 'rgba(0,174,239,0.08)', borderLeft: '3px solid #00AEEF' } : { borderLeft: '3px solid transparent' }}
                >
                  <Icon size={18} className="flex-shrink-0" />
                  <span>{s.label}</span>
                </button>
              )
            })}
          </nav>
        </div>
      </aside>

      {/* Settings Content */}
      <main className="flex-1 min-w-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2, ease }}
          >
            <h2 className="text-[#F0F0F0] text-2xl font-semibold mb-6">
              {sections.find((s) => s.id === active)?.label} Preferences
            </h2>
            {renderSection()}
          </motion.div>
        </AnimatePresence>
      </main>
    </motion.div>
  )
}
