import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Plus, User, Activity,
  X, ChevronRight, MoreVertical,
  Edit2, Trash2, Users, TrendingUp, Clock,
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

// ── Types ──────────────────────────────────────────────
interface Client {
  id: string
  name: string
  email: string
  phone: string
  avatar: string
  dob: string
  age: number
  sex: 'Male' | 'Female' | 'Other'
  fatLossKilos: string
  fatLossDeadline: string
  fatLossWhy: string
  status: 'Active' | 'Inactive' | 'On Hold'
  clientId: string
  weight: number
  bodyFat: number
  goal: string
  program: string
  sessionsCompleted: number
  startDate: string
  nextSession: string
  medicalConditions: string
  injuries: string
  medications: string
  activityLevel: string
  sleepHours: string
  stressLevel: string
  occupation: string
  trainingExperience: string
  trainingDaysPerWeek: string
  preferredTime: string
  equipmentAccess: string
  notes: string
}

// ── Demo Data ──────────────────────────────────────────
const DEMO_CLIENTS: Client[] = [
  {
    id: '1', name: 'Sarah Johnson', email: 'sarah.j@email.com', phone: '+852 9123 4567',
    avatar: './avatar-placeholder.png', dob: '1996-03-15', age: 28, sex: 'Female', status: 'Active', clientId: '#CLT-0042',
    weight: 58.5, bodyFat: 18.2, goal: 'Fat Loss', program: 'Strength & Conditioning',
    sessionsCompleted: 47, startDate: '2024-06-15', nextSession: 'Today, 14:00',
    medicalConditions: 'None', injuries: 'Previous ankle sprain (2023)', medications: 'None',
    activityLevel: 'Moderate', sleepHours: '7-8', stressLevel: 'Medium',
    occupation: 'Marketing Manager', trainingExperience: 'Beginner (0-1 year)',
    trainingDaysPerWeek: '4', preferredTime: 'Evening (17:00-20:00)',
    equipmentAccess: 'Full gym',
    fatLossKilos: '10', fatLossDeadline: '2025-06-15', fatLossWhy: 'Want to feel more confident and improve energy levels for work.',
    notes: 'Motivated client, responds well to strength training.',
  },
  {
    id: '2', name: 'Michael Chen', email: 'mike.chen@email.com', phone: '+852 9234 5678',
    avatar: './avatar-placeholder.png', dob: '1989-07-22', age: 35, sex: 'Male', status: 'Active', clientId: '#CLT-0038',
    weight: 82.0, bodyFat: 22.5, goal: 'Muscle Gain', program: 'Hypertrophy Phase 2',
    sessionsCompleted: 32, startDate: '2024-08-01', nextSession: 'Tomorrow, 09:00',
    medicalConditions: 'Mild hypertension', injuries: 'None', medications: 'Lisinopril',
    activityLevel: 'Low', sleepHours: '6-7', stressLevel: 'High',
    occupation: 'Software Engineer', trainingExperience: 'Intermediate (1-3 years)',
    trainingDaysPerWeek: '5', preferredTime: 'Morning (06:00-09:00)',
    equipmentAccess: 'Full gym',
    fatLossKilos: '', fatLossDeadline: '', fatLossWhy: '',
    notes: 'Focus on compound lifts. Monitor blood pressure.',
  },
  {
    id: '3', name: 'Emily Wong', email: 'emily.w@email.com', phone: '+852 9345 6789',
    avatar: './avatar-placeholder.png', dob: '2000-11-08', age: 24, sex: 'Female', status: 'Active', clientId: '#CLT-0051',
    weight: 52.0, bodyFat: 20.1, goal: 'General Fitness', program: 'Functional Fitness',
    sessionsCompleted: 18, startDate: '2024-09-20', nextSession: 'Wed, 16:30',
    medicalConditions: 'Asthma', injuries: 'None', medications: 'Salbutamol inhaler',
    activityLevel: 'Moderate', sleepHours: '8+', stressLevel: 'Low',
    occupation: 'University Student', trainingExperience: 'Beginner (0-1 year)',
    trainingDaysPerWeek: '3', preferredTime: 'Afternoon (14:00-17:00)',
    equipmentAccess: 'Full gym',
    fatLossKilos: '', fatLossDeadline: '', fatLossWhy: '',
    notes: 'Prefers variety. Keep workouts engaging.',
  },
  {
    id: '4', name: 'David Park', email: 'david.park@email.com', phone: '+852 9456 7890',
    avatar: './avatar-placeholder.png', dob: '1982-05-30', age: 42, sex: 'Male', status: 'On Hold', clientId: '#CLT-0029',
    weight: 91.5, bodyFat: 28.3, goal: 'Weight Loss', program: 'Fat Loss Accelerator',
    sessionsCompleted: 64, startDate: '2024-01-10', nextSession: '—',
    medicalConditions: 'Type 2 diabetes', injuries: 'Lower back pain', medications: 'Metformin',
    activityLevel: 'Sedentary', sleepHours: '5-6', stressLevel: 'High',
    occupation: 'Investment Banker', trainingExperience: 'Intermediate (1-3 years)',
    trainingDaysPerWeek: '3', preferredTime: 'Early Morning (05:00-07:00)',
    equipmentAccess: 'Home gym',
    fatLossKilos: '15', fatLossDeadline: '2025-09-01', fatLossWhy: 'Doctor recommended weight loss to manage diabetes.',
    notes: 'On hold due to work travel. Resume Jan 2025.',
  },
  {
    id: '5', name: 'Jessica Lee', email: 'jessica.lee@email.com', phone: '+852 9567 8901',
    avatar: './avatar-placeholder.png', dob: '1993-09-12', age: 31, sex: 'Female', status: 'Active', clientId: '#CLT-0048',
    weight: 61.0, bodyFat: 21.5, goal: 'Strength', program: 'Powerlifting Intro',
    sessionsCompleted: 28, startDate: '2024-07-22', nextSession: 'Thu, 18:00',
    medicalConditions: 'None', injuries: 'None', medications: 'None',
    activityLevel: 'High', sleepHours: '7-8', stressLevel: 'Medium',
    occupation: 'Physiotherapist', trainingExperience: 'Advanced (3+ years)',
    trainingDaysPerWeek: '4', preferredTime: 'Evening (17:00-20:00)',
    equipmentAccess: 'Full gym',
    fatLossKilos: '', fatLossDeadline: '', fatLossWhy: '',
    notes: 'Very knowledgeable. Focus on technique refinement.',
  },
  {
    id: '6', name: 'Ryan Thompson', email: 'ryan.t@email.com', phone: '+852 9678 9012',
    avatar: './avatar-placeholder.png', dob: '1998-01-18', age: 26, sex: 'Male', status: 'Inactive', clientId: '#CLT-0035',
    weight: 75.0, bodyFat: 15.8, goal: 'Athletic Performance', program: 'Sports Conditioning',
    sessionsCompleted: 12, startDate: '2024-10-05', nextSession: '—',
    medicalConditions: 'None', injuries: 'ACL reconstruction (2022)', medications: 'None',
    activityLevel: 'High', sleepHours: '8+', stressLevel: 'Low',
    occupation: 'Professional Athlete', trainingExperience: 'Advanced (3+ years)',
    trainingDaysPerWeek: '6', preferredTime: 'Morning (06:00-09:00)',
    equipmentAccess: 'Full gym + sports facility',
    fatLossKilos: '', fatLossDeadline: '', fatLossWhy: '',
    notes: 'Inactive - moved overseas.',
  },
]

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  Active: { bg: 'rgba(34,197,94,0.15)', text: '#22C55E', dot: '#22C55E' },
  Inactive: { bg: 'rgba(107,107,107,0.15)', text: '#6B6B6B', dot: '#6B6B6B' },
  'On Hold': { bg: 'rgba(234,179,8,0.15)', text: '#EAB308', dot: '#EAB308' },
}

const GOAL_COLORS: Record<string, string> = {
  'Fat Loss': '#22C55E',
  'Weight Loss': '#22C55E',
  'Muscle Gain': '#8B5CF6',
  'Strength': '#00AEEF',
  'General Fitness': '#F97316',
  'Athletic Performance': '#EC4899',
  'Rehabilitation': '#EAB308',
}

// ── Components ─────────────────────────────────────────

function ClientCard({ client, index, onEdit, onDelete }: {
  client: Client
  index: number
  onEdit: (c: Client) => void
  onDelete: (id: string) => void
}) {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const status = STATUS_STYLES[client.status]
  const goalColor = GOAL_COLORS[client.goal] || '#C0C0C0'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
      className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-5 cursor-pointer transition-all duration-200 hover:-translate-y-[2px] hover:border-[#3A3A3A] group"
      onClick={() => navigate(`/clients/${client.id}`)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#1A1A1A] border border-[#2A2A2A] overflow-hidden flex-shrink-0">
            <img src={client.avatar} alt={client.name} className="w-full h-full object-cover" />
          </div>
          <div>
            <h3 className="text-[#F0F0F0] font-semibold text-sm">{client.name}</h3>
            <p className="text-[#6B6B6B] text-xs">{client.clientId}</p>
          </div>
        </div>
        <div className="relative">
          <button
            onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen) }}
            className="text-[#6B6B6B] hover:text-[#F0F0F0] p-1 rounded transition-colors"
          >
            <MoreVertical size={16} />
          </button>
          <AnimatePresence>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute right-0 top-7 w-40 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg shadow-xl z-50 py-1"
                >
                  <button
                    onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onEdit(client) }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#A0A0A0] hover:text-[#F0F0F0] hover:bg-[#242424] transition-colors"
                  >
                    <Edit2 size={13} /> Edit
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onDelete(client.id) }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#EF4444] hover:bg-[#242424] transition-colors"
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1"
          style={{ backgroundColor: status.bg, color: status.text }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: status.dot }} />
          {client.status}
        </span>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[rgba(192,192,192,0.1)]"
          style={{ color: goalColor }}>
          {client.goal}
        </span>
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-[#6B6B6B]">Program</span>
          <span className="text-[#A0A0A0] font-medium">{client.program}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[#6B6B6B]">Sessions</span>
          <span className="text-[#A0A0A0] font-medium">{client.sessionsCompleted}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[#6B6B6B]">Next Session</span>
          <span className="text-[#00AEEF] font-medium">{client.nextSession}</span>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-[#1F1F1F] flex items-center justify-between">
        <div className="flex items-center gap-1 text-[#6B6B6B] text-xs">
          <Activity size={12} />
          {client.weight}kg · {client.bodyFat}% BF
        </div>
        <ChevronRight size={14} className="text-[#6B6B6B] group-hover:text-[#00AEEF] transition-colors" />
      </div>
    </motion.div>
  )
}

// ── Client Form Modal ──────────────────────────────────

const ACTIVITY_LEVELS = ['Sedentary', 'Low', 'Moderate', 'High', 'Athlete']
const SLEEP_OPTIONS = ['<5', '5-6', '6-7', '7-8', '8+']
const STRESS_OPTIONS = ['Low', 'Medium', 'High']
const EXPERIENCE_OPTIONS = ['None', 'Beginner (0-1 year)', 'Intermediate (1-3 years)', 'Advanced (3+ years)']
const TRAINING_DAYS = ['1', '2', '3', '4', '5', '6', '7']
const TIME_OPTIONS = ['Early Morning (05:00-07:00)', 'Morning (06:00-09:00)', 'Afternoon (14:00-17:00)', 'Evening (17:00-20:00)', 'Night (20:00-22:00)']
const EQUIPMENT_OPTIONS = ['Home gym', 'Full gym', 'Bodyweight only', 'Full gym + sports facility']
const GOAL_OPTIONS = ['Fat Loss', 'Muscle Gain', 'Strength', 'General Fitness', 'Athletic Performance', 'Rehabilitation']

function ClientFormModal({
  open,
  onClose,
  initialClient,
}: {
  open: boolean
  onClose: () => void
  initialClient?: Client | null
}) {
  const isEdit = !!initialClient
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<Partial<Client>>({
    status: 'Active',
    sex: 'Female',
    avatar: './avatar-placeholder.png',
    startDate: new Date().toISOString().split('T')[0],
  })

  const calculateAge = (dob: string): number => {
    if (!dob) return 0
    const birth = new Date(dob)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  useEffect(() => {
    if (initialClient) {
      setForm(initialClient)
    } else {
      setForm({
        status: 'Active', sex: 'Female', avatar: './avatar-placeholder.png',
        startDate: new Date().toISOString().split('T')[0],
      })
    }
    setStep(1)
  }, [initialClient, open])

  const update = (field: keyof Client, value: string | number) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = () => {
    onClose()
  }

  const steps = [
    { num: 1, label: 'Personal Info' },
    { num: 2, label: 'Health & Lifestyle' },
    { num: 3, label: 'Fitness Profile' },
    { num: 4, label: 'Review' },
  ]

  const StepIndicator = () => (
    <div className="flex items-center gap-2 mb-6">
      {steps.map((s, i) => (
        <div key={s.num} className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
            step >= s.num ? 'bg-[#00AEEF] text-white' : 'bg-[#2A2A2A] text-[#6B6B6B]'
          }`}>
            {s.num}
          </div>
          <span className={`text-xs hidden sm:block ${step >= s.num ? 'text-[#F0F0F0]' : 'text-[#6B6B6B]'}`}>
            {s.label}
          </span>
          {i < steps.length - 1 && <div className="w-4 h-[1px] bg-[#2A2A2A]" />}
        </div>
      ))}
    </div>
  )

  const Input = ({ label, field, type = 'text', placeholder = '', required = false }: {
    label: string
    field: keyof Client
    type?: string
    placeholder?: string
    required?: boolean
  }) => (
    <div>
      <label className="text-xs text-[#A0A0A0] mb-1 block">
        {label} {required && <span className="text-[#EF4444]">*</span>}
      </label>
      <input
        type={type}
        value={(form[field] as string) || ''}
        onChange={(e) => update(field, e.target.value)}
        placeholder={placeholder}
        className="w-full h-10 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 text-[#F0F0F0] text-sm placeholder:text-[#3A3A3A] focus:outline-none focus:border-[#00AEEF] transition-colors"
      />
    </div>
  )

  const SelectField = ({ label, field, options }: { label: string; field: keyof Client; options: string[] }) => (
    <div>
      <label className="text-xs text-[#A0A0A0] mb-1 block">{label}</label>
      <select
        value={(form[field] as string) || ''}
        onChange={(e) => update(field, e.target.value)}
        className="w-full h-10 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 text-[#F0F0F0] text-sm focus:outline-none focus:border-[#00AEEF] transition-colors"
      >
        <option value="" className="bg-[#1A1A1A]">Select...</option>
        {options.map(o => <option key={o} value={o} className="bg-[#1A1A1A]">{o}</option>)}
      </select>
    </div>
  )

  const TextArea = ({ label, field, placeholder, rows = 3 }: { label: string; field: keyof Client; placeholder?: string; rows?: number }) => (
    <div>
      <label className="text-xs text-[#A0A0A0] mb-1 block">{label}</label>
      <textarea
        rows={rows}
        value={(form[field] as string) || ''}
        onChange={(e) => update(field, e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2 text-[#F0F0F0] text-sm placeholder:text-[#3A3A3A] resize-none focus:outline-none focus:border-[#00AEEF] transition-colors"
      />
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-[#141414] border-[#2A2A2A] text-[#F0F0F0] max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {isEdit ? 'Edit Client' : 'New Client Questionnaire'}
          </DialogTitle>
        </DialogHeader>

        <StepIndicator />

        <div className="space-y-4 mt-2">
          {step === 1 && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Full Name" field="name" placeholder="John Doe" required />
                <Input label="Email" field="email" type="email" placeholder="john@email.com" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Phone" field="phone" placeholder="+852 9123 4567" />
                <div>
                  <label className="text-xs text-[#A0A0A0] mb-1 block">Date of Birth</label>
                  <input
                    type="date"
                    value={form.dob || ''}
                    onChange={(e) => {
                      const dob = e.target.value
                      setForm(prev => ({ ...prev, dob, age: calculateAge(dob) }))
                    }}
                    className="w-full h-10 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 text-[#F0F0F0] text-sm focus:outline-none focus:border-[#00AEEF] transition-colors"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[#A0A0A0] mb-1 block">Age</label>
                  <div className="w-full h-10 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 text-[#F0F0F0] text-sm flex items-center">
                    {form.dob ? calculateAge(form.dob) : <span className="text-[#3A3A3A]">Auto-calculated from DOB</span>}
                  </div>
                </div>
                <SelectField label="Gender" field="sex" options={['Male', 'Female', 'Other']} />
              </div>
              <Input label="Start Date" field="startDate" type="date" />
              <SelectField label="Primary Goal" field="goal" options={GOAL_OPTIONS} />

              {/* Conditional Fat Loss fields */}
              {form.goal === 'Fat Loss' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4 pt-2 border-t border-[#2A2A2A]"
                >
                  <p className="text-xs text-[#00AEEF] font-medium uppercase tracking-wider">Fat Loss Details</p>
                  <div className="grid grid-cols-2 gap-3">
                    <Input label="How many kilos would you like to lose?" field="fatLossKilos" type="number" placeholder="e.g. 10" />
                    <Input label="By when would you like to achieve this?" field="fatLossDeadline" type="date" />
                  </div>
                  <TextArea label="Why did you choose this goal?" field="fatLossWhy" placeholder="Tell us your motivation..." rows={3} />
                </motion.div>
              )}
            </>
          )}

          {step === 2 && (
            <>
              <TextArea label="Medical Conditions" field="medicalConditions" placeholder="List any medical conditions..." />
              <TextArea label="Past / Current Injuries" field="injuries" placeholder="Describe any injuries..." />
              <TextArea label="Current Medications" field="medications" placeholder="List any medications..." />
              <div className="grid grid-cols-3 gap-3">
                <SelectField label="Activity Level" field="activityLevel" options={ACTIVITY_LEVELS} />
                <SelectField label="Sleep (hours)" field="sleepHours" options={SLEEP_OPTIONS} />
                <SelectField label="Stress Level" field="stressLevel" options={STRESS_OPTIONS} />
              </div>
              <Input label="Occupation" field="occupation" placeholder="Software Engineer" />
            </>
          )}

          {step === 3 && (
            <>
              <SelectField label="Training Experience" field="trainingExperience" options={EXPERIENCE_OPTIONS} />
              <SelectField label="Training Days/Week" field="trainingDaysPerWeek" options={TRAINING_DAYS} />
              <SelectField label="Preferred Training Time" field="preferredTime" options={TIME_OPTIONS} />
              <SelectField label="Equipment Access" field="equipmentAccess" options={EQUIPMENT_OPTIONS} />
              <TextArea label="Additional Notes" field="notes" placeholder="Any other relevant information..." rows={4} />
            </>
          )}

          {step === 4 && (
            <div className="space-y-3">
              <h4 className="text-[#F0F0F0] font-semibold text-sm">Review Information</h4>
              {[
                ['Name', form.name],
                ['Email', form.email],
                ['Phone', form.phone],
                ['Date of Birth', form.dob],
                ['Age', form.age],
                ['Gender', form.sex],
                ['Goal', form.goal],
                ...(form.goal === 'Fat Loss' ? [
                  ['Target Loss', `${form.fatLossKilos} kg`],
                  ['Deadline', form.fatLossDeadline],
                  ['Motivation', form.fatLossWhy],
                ] : []),
                ['Medical', form.medicalConditions],
                ['Injuries', form.injuries],
                ['Experience', form.trainingExperience],
                ['Days/Week', form.trainingDaysPerWeek],
                ['Preferred Time', form.preferredTime],
                ['Equipment', form.equipmentAccess],
              ].map(([label, value]) => value ? (
                <div key={label} className="flex justify-between text-sm border-b border-[#1F1F1F] pb-2">
                  <span className="text-[#6B6B6B]">{label}</span>
                  <span className="text-[#F0F0F0]">{String(value)}</span>
                </div>
              ) : null)}
            </div>
          )}
        </div>

        <div className="flex justify-between gap-3 mt-6 pt-4 border-t border-[#2A2A2A]">
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-[#A0A0A0] hover:text-[#F0F0F0]"
          >
            Cancel
          </Button>
          <div className="flex gap-2">
            {step > 1 && (
              <Button
                variant="ghost"
                onClick={() => setStep(step - 1)}
                className="text-[#A0A0A0] hover:text-[#F0F0F0]"
              >
                Back
              </Button>
            )}
            {step < 4 ? (
              <Button
                onClick={() => setStep(step + 1)}
                className="bg-[#00AEEF] hover:bg-[#009BD6] text-white"
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                className="bg-[#00AEEF] hover:bg-[#009BD6] text-white"
              >
                {isEdit ? 'Save Changes' : 'Create Client'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ── Main Page ──────────────────────────────────────────
export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>(DEMO_CLIENTS)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [showForm, setShowForm] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)

  const filtered = useMemo(() => {
    let result = clients
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.clientId.toLowerCase().includes(q) ||
        c.goal.toLowerCase().includes(q)
      )
    }
    if (statusFilter) {
      result = result.filter(c => c.status === statusFilter)
    }
    return result
  }, [clients, searchQuery, statusFilter])

  const stats = useMemo(() => {
    const total = clients.length
    const active = clients.filter(c => c.status === 'Active').length
    const onHold = clients.filter(c => c.status === 'On Hold').length
    const inactive = clients.filter(c => c.status === 'Inactive').length
    const totalSessions = clients.reduce((sum, c) => sum + c.sessionsCompleted, 0)
    return { total, active, onHold, inactive, totalSessions }
  }, [clients])

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this client?')) {
      setClients(prev => prev.filter(c => c.id !== id))
    }
  }

  const handleEdit = (client: Client) => {
    setEditingClient(client)
    setShowForm(true)
  }

  const handleAdd = () => {
    setEditingClient(null)
    setShowForm(true)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-[1440px] mx-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[#F0F0F0] text-2xl font-semibold tracking-tight">Clients</h1>
          <p className="text-[#A0A0A0] text-sm mt-0.5">{filtered.length} client{filtered.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={handleAdd}
          className="bg-[#00AEEF] hover:bg-[#009BD6] text-white font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 hover:scale-[1.02] text-sm flex items-center gap-2"
        >
          <Plus size={16} />
          New Client
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {[
          { icon: Users, label: 'Total', value: stats.total, color: '#F0F0F0' },
          { icon: Activity, label: 'Active', value: stats.active, color: '#22C55E' },
          { icon: Clock, label: 'On Hold', value: stats.onHold, color: '#EAB308' },
          { icon: X, label: 'Inactive', value: stats.inactive, color: '#6B6B6B' },
          { icon: TrendingUp, label: 'Total Sessions', value: stats.totalSessions, color: '#00AEEF' },
        ].map((stat) => (
          <div key={stat.label} className="bg-[#141414] border border-[#2A2A2A] rounded-xl px-4 py-3">
            <div className="flex items-center gap-2 mb-1">
              <stat.icon size={14} style={{ color: stat.color }} />
              <span className="text-[#6B6B6B] text-xs">{stat.label}</span>
            </div>
            <p className="text-[#F0F0F0] font-semibold text-lg" style={{ fontFamily: 'Space Mono, monospace' }}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-[#141414] border border-[#2A2A2A] rounded-xl px-5 py-4 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-[#1A1A1A] rounded-full border border-[#2A2A2A] focus-within:border-[#00AEEF] transition-colors w-full sm:w-80">
            <Search size={16} className="text-[#6B6B6B] ml-3 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-[#F0F0F0] text-sm placeholder-[#6B6B6B] px-3 py-2 w-full outline-none"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-[#6B6B6B] hover:text-[#F0F0F0] mr-3">
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {['Active', 'On Hold', 'Inactive'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(statusFilter === status ? '' : status)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all duration-200 ${
                  statusFilter === status
                    ? 'border-[#00AEEF] bg-[rgba(0,174,239,0.15)] text-[#00AEEF]'
                    : 'border-[#2A2A2A] bg-[#1A1A1A] text-[#6B6B6B] hover:text-[#A0A0A0] hover:border-[#3A3A3A]'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {statusFilter && (
            <button
              onClick={() => setStatusFilter('')}
              className="text-[#EF4444] hover:text-[#DC2626] text-sm font-medium flex items-center gap-1 transition-colors"
            >
              <X size={14} /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Client Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24">
          <User size={48} className="text-[#6B6B6B] mb-4 opacity-50" />
          <h3 className="text-[#F0F0F0] font-semibold text-base mb-1">No clients found</h3>
          <p className="text-[#A0A0A0] text-sm mb-4">Try adjusting your search or add a new client</p>
          <button
            onClick={handleAdd}
            className="bg-[#00AEEF] hover:bg-[#009BD6] text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all"
          >
            Add Client
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((client, i) => (
              <ClientCard
                key={client.id}
                client={client}
                index={i}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Form Modal */}
      <ClientFormModal
        open={showForm}
        onClose={() => setShowForm(false)}
        initialClient={editingClient}
      />
    </motion.div>
  )
}
