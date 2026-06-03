import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft, Save, UserPlus, Check, Flame, Dumbbell, Trophy,
  HeartPulse, Shield, Activity, BarChart3, Info,
} from 'lucide-react'
import { getCurrentCoach, addClient, calculateAge } from '@/lib/auth'
import { toast } from 'sonner'

const easeOut = [0.16, 1, 0.3, 1] as [number, number, number, number]

/* ═══════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════ */

const GOAL_OPTIONS = [
  { key: 'Lose Weight', icon: Flame },
  { key: 'Build Muscle', icon: Dumbbell },
  { key: 'Strength', icon: BarChart3 },
  { key: 'Endurance', icon: HeartPulse },
  { key: 'Athletic Performance', icon: Trophy },
  { key: 'Rehab & Mobility', icon: Shield },
  { key: 'General Fitness', icon: Activity },
]

const ACTIVITY_LEVELS = [
  { key: 'sedentary', label: 'Sedentary', sub: 'Office job', mult: 1.2 },
  { key: 'light', label: 'Lightly Active', sub: '1-2 days/week', mult: 1.375 },
  { key: 'moderate', label: 'Moderately Active', sub: '3-5 days/week', mult: 1.55 },
  { key: 'very', label: 'Very Active', sub: '6-7 days/week', mult: 1.725 },
  { key: 'athlete', label: 'Athlete', sub: '2x per day', mult: 1.9 },
]

const EQUIPMENT_OPTIONS = ['Full Gym', 'Dumbbells Only', 'Bodyweight', 'Home Gym', 'Commercial Gym']

const SESSIONS_PER_WEEK = ['2', '3', '4', '5', '6']
const SESSION_DURATIONS = ['30', '45', '60', '90']

const SKINFOLD_SITES = [
  { key: 'tricep', label: 'Tricep' },
  { key: 'subscap', label: 'Sub-Scapular' },
  { key: 'supra', label: 'Suprailiac' },
  { key: 'umbil', label: 'Umbilical' },
  { key: 'thigh', label: 'Thigh' },
  { key: 'pec', label: 'Pectoral' },
  { key: 'midax', label: 'Mid-Axillary' },
]

const OPTIONAL_SKINFOLDS = [
  { key: 'chin', label: 'Chin' },
  { key: 'cheek', label: 'Cheek' },
  { key: 'knee', label: 'Knee' },
  { key: 'calf', label: 'Calf' },
  { key: 'ham', label: 'Hamstring' },
]

const CIRCUMFERENCES = [
  { key: 'leftArm', label: 'Left Arm' },
  { key: 'rightArm', label: 'Right Arm' },
  { key: 'leftThigh', label: 'Left Thigh' },
  { key: 'rightThigh', label: 'Right Thigh' },
  { key: 'hips', label: 'Hips' },
  { key: 'waist', label: 'Waist' },
  { key: 'shoulder', label: 'Shoulder' },
  { key: 'neck', label: 'Neck' },
  { key: 'chest', label: 'Chest' },
]

const SAFETY_CHECKS = [
  { key: 'noCardio', label: 'No cardiovascular conditions' },
  { key: 'noBP', label: 'No uncontrolled blood pressure' },
  { key: 'noDizziness', label: 'No dizziness or fainting history' },
  { key: 'noJointPain', label: 'No joint pain during movement' },
  { key: 'clearedRT', label: 'Cleared for resistance training' },
  { key: 'clearedHIIT', label: 'Cleared for high-intensity exercise' },
]

/* ═══════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════ */

function bmiCategory(bmi: number): { label: string; color: string } {
  if (bmi <= 0) return { label: '', color: '' }
  if (bmi < 18.5) return { label: 'Underweight', color: '#F59E0B' }
  if (bmi < 25) return { label: 'Normal', color: '#22C55E' }
  if (bmi < 30) return { label: 'Overweight', color: '#F97316' }
  return { label: 'Obese', color: '#EF4444' }
}

function calculateTDEE(weightKg: number, heightCm: number, age: number, gender: string, activityKey: string) {
  if (!weightKg || !heightCm || !age || !gender || !activityKey) return { bmr: 0, tdee: 0 }
  let bmr = 0
  if (gender === 'male') {
    bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age) + 5
  } else {
    bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age) - 161
  }
  const mult = ACTIVITY_LEVELS.find(a => a.key === activityKey)?.mult || 1.2
  return { bmr: Math.round(bmr), tdee: Math.round(bmr * mult) }
}

function calculateBodyFatJP7(sum7: number, age: number, gender: string): number {
  if (!sum7 || sum7 <= 0) return 0
  let density = 0
  if (gender === 'male') {
    density = 1.112 - (0.00043499 * sum7) + (0.00000055 * sum7 * sum7) - (0.00028826 * age)
  } else {
    density = 1.097 - (0.00046971 * sum7) + (0.00000056 * sum7 * sum7) - (0.00012828 * age)
  }
  if (density <= 0) return 0
  return +(((4.95 / density) - 4.5) * 100).toFixed(1)
}

function calculateMacros(calories: number, weightKg: number, dietType: string) {
  const ratios: Record<string, { p: number; c: number; f: number }> = {
    balanced: { p: 30, c: 35, f: 35 },
    lowCarb: { p: 35, c: 15, f: 50 },
    highCarb: { p: 25, c: 55, f: 20 },
    highProtein: { p: 40, c: 30, f: 30 },
  }
  const r = ratios[dietType] || ratios.balanced
  const proteinFromPct = (calories * r.p / 100) / 4
  const minProtein = weightKg * 1.6
  const protein = Math.round(Math.max(proteinFromPct, minProtein))
  const pCal = protein * 4
  const rem = calories - pCal
  const carbs = Math.round((rem * (r.c / (r.c + r.f))) / 4)
  const fat = Math.round((rem * (r.f / (r.c + r.f))) / 9)
  return { protein, carbs, fat, calories }
}

/* ═══════════════════════════════════════════
   UI COMPONENTS
   ═══════════════════════════════════════════ */

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-sm font-semibold text-gray-900 dark:text-[#F0F0F0] mb-3">{children}</h3>
}

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="text-xs text-gray-500 dark:text-[#A0A0A0] mb-1.5 block">
      {children} {required && <span className="text-[#EF4444]">*</span>}
    </label>
  )
}

function Input({ value, onChange, type = 'text', placeholder = '' }: {
  value: string | number; onChange: (v: string) => void; type?: string; placeholder?: string
}) {
  return (
    <input
      type={type}
      value={value || ''}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full h-10 bg-gray-100 dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2A2A2A] rounded-lg px-3 text-gray-900 dark:text-[#F0F0F0] text-sm placeholder:text-[#3A3A3A] focus:outline-none focus:border-[#00AEEF] transition-colors"
    />
  )
}

function NumberInput({ value, onChange, placeholder = '', step = '0.1' }: {
  value: number; onChange: (v: number) => void; placeholder?: string; step?: string
}) {
  return (
    <input
      type="number"
      step={step}
      value={value || ''}
      onChange={e => onChange(parseFloat(e.target.value) || 0)}
      placeholder={placeholder}
      className="w-full h-10 bg-gray-100 dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2A2A2A] rounded-lg px-3 text-gray-900 dark:text-[#F0F0F0] text-sm placeholder:text-[#3A3A3A] focus:outline-none focus:border-[#00AEEF] transition-colors"
    />
  )
}

function TextArea({ value, onChange, placeholder = '', rows = 3 }: {
  value: string; onChange: (v: string) => void; placeholder?: string; rows?: number
}) {
  return (
    <textarea
      rows={rows}
      value={value || ''}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-gray-100 dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2A2A2A] rounded-lg px-3 py-2 text-gray-900 dark:text-[#F0F0F0] text-sm placeholder:text-[#3A3A3A] resize-none focus:outline-none focus:border-[#00AEEF] transition-colors"
    />
  )
}

function ReviewRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between text-sm border-b border-gray-200 dark:border-[#1F1F1F] py-2">
      <span className="text-gray-400 dark:text-[#6B6B6B]">{label}</span>
      <span className="text-gray-900 dark:text-[#F0F0F0]">{value || '—'}</span>
    </div>
  )
}

/* ═══════════════════════════════════════════
   MAIN WIZARD
   ═══════════════════════════════════════════ */

export default function AddClientPage() {
  const navigate = useNavigate()
  const coach = getCurrentCoach()

  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showProgramPrompt, setShowProgramPrompt] = useState(false)
  const [savedClientName, setSavedClientName] = useState('')

  const emptyForm = {
    // Step 1
    fullName: '', email: '', phone: '', dateOfBirth: '',
    gender: '' as 'male' | 'female' | 'other' | '',
    emergencyName: '', emergencyPhone: '',
    // Step 2
    primaryGoal: '', secondaryGoal: '', experienceLevel: '',
    equipment: [] as string[], sessionsPerWeek: '', sessionDuration: '',
    // Step 3
    weightKg: 0, heightCm: 0,
    weightUnit: 'kg' as 'kg' | 'lb',
    heightUnit: 'cm' as 'cm' | 'ft',
    weightLb: 0, heightFt: 0, heightIn: 0,
    activityLevel: '', bodyFatManual: 0,
    skinfolds: {} as Record<string, number>,
    circumferences: {} as Record<string, number>,
    // Step 4
    injuries: '', medications: '', allergies: '',
    clearedToExercise: '', restrictions: '',
    safetyCheckboxes: {} as Record<string, boolean>,
  }

  const [form, setForm] = useState(emptyForm)

  const age = useMemo(() => calculateAge(form.dateOfBirth), [form.dateOfBirth])

  // BMI
  const bmi = useMemo(() => {
    if (!form.weightKg || !form.heightCm) return 0
    return +(form.weightKg / Math.pow(form.heightCm / 100, 2)).toFixed(1)
  }, [form.weightKg, form.heightCm])
  const bmiCat = useMemo(() => bmiCategory(bmi), [bmi])

  // TDEE
  const { bmr, tdee } = useMemo(
    () => calculateTDEE(form.weightKg, form.heightCm, age, form.gender, form.activityLevel),
    [form.weightKg, form.heightCm, age, form.gender, form.activityLevel]
  )

  // Body fat
  const sum7 = useMemo(() =>
    SKINFOLD_SITES.reduce((sum, s) => sum + (form.skinfolds[s.key] || 0), 0)
  , [form.skinfolds])

  const bodyFatCalc = useMemo(() => {
    if (sum7 <= 0) return 0
    return calculateBodyFatJP7(sum7, age, form.gender)
  }, [sum7, age, form.gender])

  const bodyFat = useMemo(() =>
    form.bodyFatManual > 0 ? form.bodyFatManual : bodyFatCalc
  , [form.bodyFatManual, bodyFatCalc])

  const leanMass = useMemo(() => {
    if (!form.weightKg || !bodyFat) return 0
    return +(form.weightKg * (1 - bodyFat / 100)).toFixed(1)
  }, [form.weightKg, bodyFat])

  const fatMass = useMemo(() => {
    if (!form.weightKg || !bodyFat) return 0
    return +(form.weightKg * (bodyFat / 100)).toFixed(1)
  }, [form.weightKg, bodyFat])

  // Calorie targets
  const calorieTargets = useMemo(() => {
    if (!tdee) return null
    return {
      maintenance: tdee,
      fatLoss: tdee - 500,
      aggressive: tdee - 750,
      muscleGain: tdee + 250,
    }
  }, [tdee])

  // Macros
  const macros = useMemo(() => {
    if (!calorieTargets || !form.weightKg) return null
    return {
      balanced: calculateMacros(calorieTargets.maintenance, form.weightKg, 'balanced'),
      lowCarb: calculateMacros(calorieTargets.maintenance, form.weightKg, 'lowCarb'),
      highCarb: calculateMacros(calorieTargets.maintenance, form.weightKg, 'highCarb'),
      highProtein: calculateMacros(calorieTargets.maintenance, form.weightKg, 'highProtein'),
    }
  }, [calorieTargets, form.weightKg])

  // Auto-fill body fat from calc
  useEffect(() => {
    if (bodyFatCalc > 0 && form.bodyFatManual === 0) {
      setForm(prev => ({ ...prev, bodyFatManual: bodyFatCalc }))
    }
  }, [bodyFatCalc])

  const update = <K extends keyof typeof form>(field: K, value: typeof form[K]) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const updateSkinfold = (key: string, value: number) => {
    setForm(prev => ({ ...prev, skinfolds: { ...prev.skinfolds, [key]: value } }))
  }

  const updateCirc = (key: string, value: number) => {
    setForm(prev => ({ ...prev, circumferences: { ...prev.circumferences, [key]: value } }))
  }

  const toggleEquipment = (item: string) => {
    setForm(prev => ({
      ...prev,
      equipment: prev.equipment.includes(item)
        ? prev.equipment.filter(e => e !== item)
        : [...prev.equipment, item],
    }))
  }

  const toggleSafety = (key: string) => {
    setForm(prev => ({
      ...prev,
      safetyCheckboxes: { ...prev.safetyCheckboxes, [key]: !prev.safetyCheckboxes[key] },
    }))
  }

  // Unit conversions
  const handleWeightUnitChange = (unit: 'kg' | 'lb') => {
    if (unit === form.weightUnit) return
    if (unit === 'lb') {
      const lb = form.weightKg > 0 ? +(form.weightKg * 2.20462).toFixed(1) : 0
      setForm(prev => ({ ...prev, weightUnit: 'lb', weightLb: lb }))
    } else {
      const kg = form.weightLb > 0 ? +(form.weightLb / 2.20462).toFixed(1) : 0
      setForm(prev => ({ ...prev, weightUnit: 'kg', weightKg: kg }))
    }
  }

  const handleHeightUnitChange = (unit: 'cm' | 'ft') => {
    if (unit === form.heightUnit) return
    if (unit === 'ft') {
      const totalInches = form.heightCm > 0 ? form.heightCm / 2.54 : 0
      const ft = Math.floor(totalInches / 12)
      const inc = Math.round(totalInches % 12)
      setForm(prev => ({ ...prev, heightUnit: 'ft', heightFt: ft, heightIn: inc }))
    } else {
      const cm = (form.heightFt * 30.48) + (form.heightIn * 2.54)
      setForm(prev => ({ ...prev, heightUnit: 'cm', heightCm: +cm.toFixed(1) }))
    }
  }

  const handleWeightChange = (val: number) => {
    if (form.weightUnit === 'kg') {
      setForm(prev => ({ ...prev, weightKg: val, weightLb: val > 0 ? +(val * 2.20462).toFixed(1) : 0 }))
    } else {
      setForm(prev => ({ ...prev, weightLb: val, weightKg: val > 0 ? +(val / 2.20462).toFixed(1) : 0 }))
    }
  }

  const handleHeightChangeCm = (val: number) => {
    const totalInches = val > 0 ? val / 2.54 : 0
    setForm(prev => ({
      ...prev, heightCm: val,
      heightFt: Math.floor(totalInches / 12),
      heightIn: Math.round(totalInches % 12),
    }))
  }

  const handleHeightChangeFt = (ft: number, inc: number) => {
    const cm = (ft * 30.48) + (inc * 2.54)
    setForm(prev => ({ ...prev, heightFt: ft, heightIn: inc, heightCm: +cm.toFixed(1) }))
  }

  const steps = [
    { num: 1, label: 'Personal' },
    { num: 2, label: 'Goals' },
    { num: 3, label: 'Body' },
    { num: 4, label: 'Medical' },
    { num: 5, label: 'Review' },
  ]

  const canProceed = () => {
    if (step === 1) return form.fullName && form.dateOfBirth && form.gender
    if (step === 2) return form.primaryGoal && form.experienceLevel && form.sessionsPerWeek && form.sessionDuration
    if (step === 3) return form.weightKg > 0 && form.heightCm > 0 && form.activityLevel
    if (step === 4) return form.clearedToExercise
    return true
  }

  const handleSubmit = () => {
    if (!coach) { navigate('/login'); return }
    setIsSubmitting(true)

    setTimeout(async () => {
      const now = new Date().toISOString()
      const client = {
        id: 'client_' + Date.now(),
        coachId: coach.id,
        personal: {
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          dateOfBirth: form.dateOfBirth,
          gender: form.gender as 'male' | 'female' | 'other',
          age,
          emergencyContact: { name: form.emergencyName.trim(), phone: form.emergencyPhone.trim() },
        },
        goals: {
          primary: form.primaryGoal,
          secondary: form.secondaryGoal,
          experienceLevel: form.experienceLevel,
          equipment: form.equipment,
          sessionsPerWeek: parseInt(form.sessionsPerWeek, 10),
          sessionDuration: parseInt(form.sessionDuration, 10),
        },
        bodyAssessment: {
          weight: form.weightKg,
          height: form.heightCm,
          bmi,
          skinfolds: form.skinfolds,
          sumOfSkinfolds: sum7,
          bodyFatPercent: bodyFat,
          leanMass,
          fatMass,
          circumferences: form.circumferences,
        },
        tdee: { bmr, tdee, activityLevel: form.activityLevel, bodyFatPercent: bodyFat },
        medical: {
          injuries: form.injuries,
          medications: form.medications,
          allergies: form.allergies,
          clearedToExercise: form.clearedToExercise,
          restrictions: form.restrictions,
          safetyCheckboxes: form.safetyCheckboxes,
        },
        nutrition: {
          maintenanceCalories: calorieTargets?.maintenance || 0,
          fatLossCalories: calorieTargets?.fatLoss || 0,
          aggressiveFatLoss: calorieTargets?.aggressive || 0,
          muscleGainCalories: calorieTargets?.muscleGain || 0,
          dietPreference: 'balanced' as const,
          macros: macros || {},
        },
        status: 'active' as const,
        createdAt: now,
        updatedAt: now,
        assessmentHistory: [{
          date: now,
          weight: form.weightKg,
          bodyFatPercent: bodyFat,
          skinfolds: form.skinfolds,
          circumferences: form.circumferences,
          tdee,
          bmr,
        }],
      }

      await addClient(client)
      setSavedClientName(client.personal.fullName)
      setIsSubmitting(false)
      setShowProgramPrompt(true)
    }, 400)
  }

  const goToStep = (s: number) => {
    if (s < step) setStep(s)
  }

  /* ── RENDER ─────────────────────────────────────────── */

  const inputClasses = 'w-full h-10 bg-gray-100 dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2A2A2A] rounded-lg px-3 text-gray-900 dark:text-[#F0F0F0] text-sm placeholder:text-[#3A3A3A] focus:outline-none focus:border-[#00AEEF] transition-colors'
  const selectClasses = 'w-full h-10 bg-gray-100 dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2A2A2A] rounded-lg px-3 text-gray-900 dark:text-[#F0F0F0] text-sm focus:outline-none focus:border-[#00AEEF] transition-colors appearance-none'

  const step1Content = (
    <div className="space-y-4">
      <SectionTitle>Personal Information</SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <Label required>Full Name</Label>
          <Input value={form.fullName} onChange={v => update('fullName', v)} placeholder="John Doe" />
        </div>
        <div>
          <Label>Email</Label>
          <Input value={form.email} onChange={v => update('email', v)} type="email" placeholder="john@email.com" />
        </div>
        <div>
          <Label>Phone</Label>
          <Input value={form.phone} onChange={v => update('phone', v)} placeholder="+852 9123 4567" />
        </div>
        <div>
          <Label required>Date of Birth</Label>
          <input
            type="date"
            value={form.dateOfBirth}
            onChange={e => update('dateOfBirth', e.target.value)}
            className={inputClasses}
          />
        </div>
        <div>
          <Label required>Gender</Label>
          <div className="grid grid-cols-3 gap-2">
            {(['male', 'female', 'other'] as const).map(g => (
              <button
                key={g}
                type="button"
                onClick={() => update('gender', g)}
                className={`py-2 rounded-lg border text-sm font-medium capitalize transition-all ${
                  form.gender === g
                    ? 'border-[#00AEEF] bg-[rgba(0,174,239,0.15)] text-[#00AEEF]'
                    : 'border-gray-200 dark:border-[#2A2A2A] text-gray-500 dark:text-[#A0A0A0] hover:bg-gray-100 dark:bg-[#1A1A1A] dark:hover:bg-[#242424] hover:text-gray-900 dark:hover:text-[#F0F0F0]'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      </div>
      {age > 0 && (
        <div className="bg-gray-100 dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2A2A2A] rounded-lg p-3 flex items-center gap-2">
          <Info size={14} className="text-[#00AEEF]" />
          <span className="text-xs text-gray-500 dark:text-[#A0A0A0]">Age: <span className="text-gray-900 dark:text-[#F0F0F0] font-semibold">{age} years</span></span>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Label>Emergency Contact Name</Label>
          <Input value={form.emergencyName} onChange={v => update('emergencyName', v)} />
        </div>
        <div>
          <Label>Emergency Contact Phone</Label>
          <Input value={form.emergencyPhone} onChange={v => update('emergencyPhone', v)} />
        </div>
      </div>
    </div>
  )

  const step2Content = (
    <div className="space-y-5">
      <SectionTitle>Primary Goal</SectionTitle>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {GOAL_OPTIONS.map(g => {
          const Icon = g.icon
          const isSelected = form.primaryGoal === g.key
          return (
            <button
              key={g.key}
              onClick={() => update('primaryGoal', g.key)}
              className={`p-3 rounded-xl border text-left transition-all duration-200 ${
                isSelected
                  ? 'border-[#00AEEF] bg-cyan-50 dark:bg-[rgba(0,174,239,0.12)]'
                  : 'border-gray-200 dark:border-[#2A2A2A] bg-gray-100 dark:bg-[#1A1A1A] hover:border-[#3A3A3A]'
              }`}
            >
              <div className="flex items-center gap-2">
                <Icon size={16} className={isSelected ? 'text-[#00AEEF]' : 'text-gray-400 dark:text-[#6B6B6B]'} />
                <span className={`text-xs font-medium ${isSelected ? 'text-[#00AEEF]' : 'text-gray-900 dark:text-[#F0F0F0]'}`}>{g.key}</span>
              </div>
            </button>
          )
        })}
      </div>

      <div>
        <Label>Secondary Goal</Label>
        <select
          value={form.secondaryGoal}
          onChange={e => update('secondaryGoal', e.target.value)}
          className={selectClasses}
        >
          <option value="" className="bg-gray-100 dark:bg-[#1A1A1A]">None</option>
          {GOAL_OPTIONS.map(g => <option key={g.key} value={g.key} className="bg-gray-100 dark:bg-[#1A1A1A]">{g.key}</option>)}
        </select>
      </div>

      <SectionTitle>Experience Level</SectionTitle>
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Beginner', color: '#22C55E', bg: 'rgba(34,197,94,0.15)', border: 'rgba(34,197,94,0.3)' },
          { label: 'Intermediate', color: '#F59E0B', bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.3)' },
          { label: 'Advanced', color: '#EF4444', bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.3)' },
        ].map(opt => {
          const isSelected = form.experienceLevel === opt.label
          return (
            <button
              key={opt.label}
              onClick={() => update('experienceLevel', opt.label)}
              className="py-2.5 px-3 rounded-xl border text-sm font-medium transition-all duration-200 text-center"
              style={{
                borderColor: isSelected ? opt.border : '#2A2A2A',
                backgroundColor: isSelected ? opt.bg : '#1A1A1A',
                color: isSelected ? opt.color : '#A0A0A0',
              }}
            >
              {opt.label}
            </button>
          )
        })}
      </div>

      <SectionTitle>Available Equipment</SectionTitle>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {EQUIPMENT_OPTIONS.map(item => {
          const isSelected = form.equipment.includes(item)
          return (
            <button
              key={item}
              onClick={() => toggleEquipment(item)}
              className={`p-3 rounded-xl border text-sm font-medium text-left transition-all ${
                isSelected ? 'border-[#00AEEF] bg-cyan-50 dark:bg-[rgba(0,174,239,0.12)] text-[#00AEEF]' : 'border-gray-200 dark:border-[#2A2A2A] bg-gray-100 dark:bg-[#1A1A1A] text-gray-900 dark:text-[#F0F0F0]'
              }`}
            >
              {item}
            </button>
          )
        })}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label required>Sessions Per Week</Label>
          <select value={form.sessionsPerWeek} onChange={e => update('sessionsPerWeek', e.target.value)} className={selectClasses}>
            <option value="" className="bg-gray-100 dark:bg-[#1A1A1A]">Select...</option>
            {SESSIONS_PER_WEEK.map(n => <option key={n} value={n} className="bg-gray-100 dark:bg-[#1A1A1A]">{n} per week</option>)}
          </select>
        </div>
        <div>
          <Label required>Session Duration</Label>
          <select value={form.sessionDuration} onChange={e => update('sessionDuration', e.target.value)} className={selectClasses}>
            <option value="" className="bg-gray-100 dark:bg-[#1A1A1A]">Select...</option>
            {SESSION_DURATIONS.map(m => <option key={m} value={m} className="bg-gray-100 dark:bg-[#1A1A1A]">{m} minutes</option>)}
          </select>
        </div>
      </div>
    </div>
  )

  const step3Content = (
    <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-1">
      {/* Panel A: Body Measurements */}
      <div>
        <SectionTitle>Body Measurements</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Weight */}
          <div>
            <Label required>Weight</Label>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                {form.weightUnit === 'kg' ? (
                  <NumberInput value={form.weightKg} onChange={v => handleWeightChange(v)} placeholder="e.g. 75" />
                ) : (
                  <NumberInput value={form.weightLb} onChange={v => handleWeightChange(v)} placeholder="e.g. 165" />
                )}
              </div>
              <div className="flex bg-gray-100 dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2A2A2A] rounded-lg overflow-hidden">
                {(['kg', 'lb'] as const).map(u => (
                  <button
                    key={u}
                    onClick={() => handleWeightUnitChange(u)}
                    className={`px-3 py-2 text-xs font-medium transition-colors ${
                      form.weightUnit === u ? 'bg-[#00AEEF] text-white' : 'text-gray-400 dark:text-[#6B6B6B] hover:text-gray-900 dark:hover:text-[#F0F0F0]'
                    }`}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>
            {form.weightUnit === 'lb' && form.weightKg > 0 && (
              <p className="text-[10px] text-gray-400 dark:text-[#6B6B6B] mt-1">{form.weightKg} kg</p>
            )}
          </div>

          {/* Height */}
          <div>
            <Label required>Height</Label>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                {form.heightUnit === 'cm' ? (
                  <NumberInput value={form.heightCm} onChange={v => handleHeightChangeCm(v)} placeholder="e.g. 175" />
                ) : (
                  <div className="flex gap-2">
                    <NumberInput value={form.heightFt} onChange={v => handleHeightChangeFt(v, form.heightIn)} placeholder="ft" />
                    <NumberInput value={form.heightIn} onChange={v => handleHeightChangeFt(form.heightFt, v)} placeholder="in" />
                  </div>
                )}
              </div>
              <div className="flex bg-gray-100 dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2A2A2A] rounded-lg overflow-hidden">
                {(['cm', 'ft'] as const).map(u => (
                  <button
                    key={u}
                    onClick={() => handleHeightUnitChange(u)}
                    className={`px-3 py-2 text-xs font-medium transition-colors ${
                      form.heightUnit === u ? 'bg-[#00AEEF] text-white' : 'text-gray-400 dark:text-[#6B6B6B] hover:text-gray-900 dark:hover:text-[#F0F0F0]'
                    }`}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>
            {form.heightUnit === 'ft' && form.heightCm > 0 && (
              <p className="text-[10px] text-gray-400 dark:text-[#6B6B6B] mt-1">{form.heightCm} cm</p>
            )}
          </div>
        </div>

        {bmi > 0 && (
          <div className="mt-3 bg-gray-100 dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2A2A2A] rounded-lg p-3 flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-[#A0A0A0]">BMI</span>
            <span className="text-sm font-bold" style={{ color: bmiCat.color }}>
              {bmi} — {bmiCat.label}
            </span>
          </div>
        )}
      </div>

      {/* Panel B: TDEE */}
      <div className="pt-4 border-t border-gray-200 dark:border-[#2A2A2A]">
        <SectionTitle>Activity Level</SectionTitle>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {ACTIVITY_LEVELS.map(a => {
            const isSelected = form.activityLevel === a.key
            return (
              <button
                key={a.key}
                onClick={() => update('activityLevel', a.key)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isSelected ? 'border-[#00AEEF] bg-cyan-50 dark:bg-[rgba(0,174,239,0.12)]' : 'border-gray-200 dark:border-[#2A2A2A] bg-gray-100 dark:bg-[#1A1A1A] hover:border-[#3A3A3A]'
                }`}
              >
                <p className={`text-xs font-medium ${isSelected ? 'text-[#00AEEF]' : 'text-gray-900 dark:text-[#F0F0F0]'}`}>{a.label}</p>
                <p className="text-[10px] text-gray-400 dark:text-[#6B6B6B] mt-0.5">{a.sub}</p>
              </button>
            )
          })}
        </div>

        {tdee > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-3 bg-gray-100 dark:bg-[#1A1A1A] border border-[#00AEEF]/30 rounded-lg p-4 space-y-2"
          >
            <div className="flex items-center gap-2 text-[#00AEEF]">
              <Info size={14} />
              <span className="text-xs font-semibold uppercase tracking-wider">TDEE Calculation</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900 dark:text-[#F0F0F0]">{bmr}</div>
                <div className="text-[10px] text-gray-500 dark:text-[#A0A0A0]">BMR kcal/day</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-[#00AEEF]">{tdee}</div>
                <div className="text-[10px] text-gray-500 dark:text-[#A0A0A0]">TDEE kcal/day</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900 dark:text-[#F0F0F0]">{bmi}</div>
                <div className="text-[10px] text-gray-500 dark:text-[#A0A0A0]">BMI</div>
              </div>
            </div>
          </motion.div>
        )}

        <div className="mt-4">
          <Label>Body Fat % (manual override — leave 0 to use BioPrint calc)</Label>
          <NumberInput value={form.bodyFatManual} onChange={v => update('bodyFatManual', v)} placeholder="0" />
        </div>
      </div>

      {/* Panel C: BioPrint */}
      <div className="pt-4 border-t border-gray-200 dark:border-[#2A2A2A]">
        <SectionTitle>7-Site Skinfold Assessment (Poliquin Method)</SectionTitle>
        <p className="text-[10px] text-gray-400 dark:text-[#6B6B6B] mb-2">All values in millimeters</p>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {SKINFOLD_SITES.map(site => (
            <div key={site.key}>
              <Label>{site.label}</Label>
              <NumberInput value={form.skinfolds[site.key] || 0} onChange={v => updateSkinfold(site.key, v)} placeholder="0" />
            </div>
          ))}
        </div>

        <SectionTitle>Optional Additional Sites</SectionTitle>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {OPTIONAL_SKINFOLDS.map(site => (
            <div key={site.key}>
              <Label>{site.label}</Label>
              <NumberInput value={form.skinfolds[site.key] || 0} onChange={v => updateSkinfold(site.key, v)} placeholder="0" />
            </div>
          ))}
        </div>

        {(bodyFat > 0 || leanMass > 0) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-3 bg-gray-100 dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2A2A2A] rounded-lg p-4 space-y-2"
          >
            <div className="flex items-center gap-2 text-[#00AEEF]">
              <Activity size={14} />
              <span className="text-xs font-semibold uppercase tracking-wider">Body Composition (7-Site)</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div><div className="text-[10px] text-gray-500 dark:text-[#A0A0A0]">Sum of Skinfolds</div><div className="text-sm font-bold text-gray-900 dark:text-[#F0F0F0]">{sum7.toFixed(1)} mm</div></div>
              <div><div className="text-[10px] text-gray-500 dark:text-[#A0A0A0]">Body Fat</div><div className="text-sm font-bold text-gray-900 dark:text-[#F0F0F0]">{bodyFat.toFixed(1)}%</div></div>
              <div><div className="text-[10px] text-gray-500 dark:text-[#A0A0A0]">Lean Mass</div><div className="text-sm font-bold text-gray-900 dark:text-[#F0F0F0]">{leanMass} kg</div></div>
              <div><div className="text-[10px] text-gray-500 dark:text-[#A0A0A0]">Fat Mass</div><div className="text-sm font-bold text-gray-900 dark:text-[#F0F0F0]">{fatMass} kg</div></div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Panel D: Circumferences */}
      <div className="pt-4 border-t border-gray-200 dark:border-[#2A2A2A]">
        <SectionTitle>Circumference Measurements (cm)</SectionTitle>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {CIRCUMFERENCES.map(c => (
            <div key={c.key}>
              <Label>{c.label}</Label>
              <NumberInput value={form.circumferences[c.key] || 0} onChange={v => updateCirc(c.key, v)} placeholder="0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const step4Content = (
    <div className="space-y-4">
      <SectionTitle>Medical History</SectionTitle>
      <div>
        <Label>Injuries or Conditions</Label>
        <TextArea value={form.injuries} onChange={v => update('injuries', v)} placeholder="List any injuries or medical conditions..." />
      </div>
      <div>
        <Label>Medications</Label>
        <TextArea value={form.medications} onChange={v => update('medications', v)} placeholder="Current medications..." />
      </div>
      <div>
        <Label>Allergies</Label>
        <TextArea value={form.allergies} onChange={v => update('allergies', v)} placeholder="Known allergies..." />
      </div>

      <SectionTitle>Cleared to Exercise *</SectionTitle>
      <div className="grid grid-cols-3 gap-2">
        {['Yes', 'No', 'With Restrictions'].map(opt => (
          <button
            key={opt}
            onClick={() => update('clearedToExercise', opt)}
            className={`py-2 rounded-lg border text-sm font-medium transition-all ${
              form.clearedToExercise === opt
                ? 'border-[#00AEEF] bg-[rgba(0,174,239,0.15)] text-[#00AEEF]'
                : 'border-gray-200 dark:border-[#2A2A2A] text-gray-500 dark:text-[#A0A0A0] hover:bg-gray-100 dark:bg-[#1A1A1A] dark:hover:bg-[#242424] hover:text-gray-900 dark:hover:text-[#F0F0F0]'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>

      {form.clearedToExercise === 'With Restrictions' && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
          <Label>Restriction Details</Label>
          <TextArea value={form.restrictions} onChange={v => update('restrictions', v)} placeholder="Describe restrictions..." />
        </motion.div>
      )}

      <SectionTitle>Safety Checklist</SectionTitle>
      <div className="space-y-2">
        {SAFETY_CHECKS.map(check => (
          <label key={check.key} className="flex items-center gap-2 cursor-pointer">
            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
              form.safetyCheckboxes[check.key] ? 'bg-[#00AEEF] border-[#00AEEF]' : 'border-gray-200 dark:border-[#2A2A2A] bg-gray-100 dark:bg-[#1A1A1A]'
            }`}>
              {form.safetyCheckboxes[check.key] && <Check size={10} className="text-white" />}
            </div>
            <input type="checkbox" className="hidden" checked={!!form.safetyCheckboxes[check.key]} onChange={() => toggleSafety(check.key)} />
            <span className="text-xs text-gray-900 dark:text-[#F0F0F0]">{check.label}</span>
          </label>
        ))}
      </div>
    </div>
  )

  const step5Content = (
    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
      <div className="bg-gray-100 dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2A2A2A] rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-semibold text-[#00AEEF] uppercase tracking-wider">Personal Info</h4>
          <button onClick={() => goToStep(1)} className="text-[10px] text-[#00AEEF] hover:underline">Edit</button>
        </div>
        <ReviewRow label="Name" value={form.fullName} />
        <ReviewRow label="Email" value={form.email} />
        <ReviewRow label="Phone" value={form.phone} />
        <ReviewRow label="DOB" value={form.dateOfBirth} />
        <ReviewRow label="Age" value={`${age} years`} />
        <ReviewRow label="Gender" value={form.gender} />
      </div>

      <div className="bg-gray-100 dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2A2A2A] rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-semibold text-[#00AEEF] uppercase tracking-wider">Goals & Preferences</h4>
          <button onClick={() => goToStep(2)} className="text-[10px] text-[#00AEEF] hover:underline">Edit</button>
        </div>
        <ReviewRow label="Primary Goal" value={form.primaryGoal} />
        <ReviewRow label="Secondary Goal" value={form.secondaryGoal || 'None'} />
        <ReviewRow label="Experience" value={form.experienceLevel} />
        <ReviewRow label="Equipment" value={form.equipment.join(', ')} />
        <ReviewRow label="Sessions/Week" value={form.sessionsPerWeek} />
        <ReviewRow label="Duration" value={`${form.sessionDuration} min`} />
      </div>

      <div className="bg-gray-100 dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2A2A2A] rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-semibold text-[#00AEEF] uppercase tracking-wider">Body Assessment</h4>
          <button onClick={() => goToStep(3)} className="text-[10px] text-[#00AEEF] hover:underline">Edit</button>
        </div>
        <ReviewRow label="Weight" value={`${form.weightKg} kg`} />
        <ReviewRow label="Height" value={`${form.heightCm} cm`} />
        <ReviewRow label="BMI" value={`${bmi} (${bmiCat.label})`} />
        <ReviewRow label="BMR" value={`${bmr} kcal/day`} />
        <ReviewRow label="TDEE" value={`${tdee} kcal/day`} />
        <ReviewRow label="Body Fat" value={`${bodyFat.toFixed(1)}%`} />
        <ReviewRow label="Lean Mass" value={`${leanMass} kg`} />
        <ReviewRow label="Sum of Skinfolds" value={`${sum7.toFixed(1)} mm`} />
      </div>

      <div className="bg-gray-100 dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2A2A2A] rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-semibold text-[#00AEEF] uppercase tracking-wider">Medical</h4>
          <button onClick={() => goToStep(4)} className="text-[10px] text-[#00AEEF] hover:underline">Edit</button>
        </div>
        <ReviewRow label="Injuries" value={form.injuries} />
        <ReviewRow label="Medications" value={form.medications} />
        <ReviewRow label="Allergies" value={form.allergies} />
        <ReviewRow label="Cleared" value={form.clearedToExercise} />
        {form.restrictions && <ReviewRow label="Restrictions" value={form.restrictions} />}
      </div>
    </div>
  )

  if (!coach) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: easeOut }}
      className="max-w-[720px] mx-auto"
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg bg-gray-100 dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2A2A2A] text-gray-500 dark:text-[#A0A0A0] hover:text-gray-900 dark:hover:text-[#F0F0F0] hover:border-[#3A3A3A] transition-colors"
        >
          <ChevronLeft size={18} />
        </button>
        <div>
          <h1 className="text-gray-900 dark:text-[#F0F0F0] text-2xl font-semibold tracking-tight flex items-center gap-2">
            <UserPlus size={22} className="text-[#00AEEF]" />
            New Client Intake
          </h1>
          <p className="text-gray-500 dark:text-[#A0A0A0] text-sm mt-0.5">Step {step} of 5 — {steps[step - 1].label}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white dark:bg-[#151D2E] border border-gray-200 dark:border-[#2A3A50] rounded-xl p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          {steps.map((s) => (
            <button
              key={s.num}
              onClick={() => goToStep(s.num)}
              className="flex flex-col items-center gap-1.5 group"
              disabled={s.num > step}
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${
                step > s.num ? 'bg-[#00AEEF] text-white' :
                step === s.num ? 'bg-[#00AEEF] text-white' :
                'bg-[#2A2A2A] text-gray-400 dark:text-[#6B6B6B]'
              }`}>
                {step > s.num ? <Check size={12} /> : s.num}
              </div>
              <span className={`text-[10px] font-medium ${step >= s.num ? 'text-gray-900 dark:text-[#F0F0F0]' : 'text-gray-400 dark:text-[#6B6B6B]'}`}>{s.label}</span>
            </button>
          ))}
        </div>
        <div className="h-1 bg-[#2A2A2A] rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-[#00AEEF] to-[#22D3EE]"
            initial={{ width: 0 }}
            animate={{ width: `${(step / steps.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white dark:bg-[#151D2E] border border-gray-200 dark:border-[#2A3A50] rounded-2xl p-6 sm:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            {step === 1 && step1Content}
            {step === 2 && step2Content}
            {step === 3 && step3Content}
            {step === 4 && step4Content}
            {step === 5 && step5Content}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-[#2A3A50]">
          <button
            onClick={step > 1 ? () => setStep(step - 1) : () => navigate(-1)}
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-500 dark:text-[#A0A0A0] hover:text-gray-900 dark:hover:text-[#F0F0F0] transition-colors"
          >
            {step > 1 ? 'Back' : 'Cancel'}
          </button>

          {step < 5 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className="bg-[#00AEEF] hover:bg-[#009BD6] disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold px-6 py-2.5 rounded-xl transition-all text-sm"
            >
              Next: {steps[step].label}
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-[#00AEEF] hover:bg-[#009BD6] disabled:opacity-60 text-white font-semibold px-6 py-2.5 rounded-xl transition-all text-sm"
            >
              {isSubmitting ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={16} />}
              Confirm & Save
            </button>
          )}
        </div>
      </div>

      {/* Program Prompt Modal */}
      <AnimatePresence>
        {showProgramPrompt && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-[300]" onClick={() => setShowProgramPrompt(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 flex items-center justify-center z-[310] p-4 pointer-events-none"
            >
              <div className="bg-white dark:bg-[#151D2E] border border-gray-200 dark:border-[#2A3A50] rounded-2xl p-6 w-full max-w-sm pointer-events-auto text-center">
                <div className="w-12 h-12 rounded-full bg-cyan-50 dark:bg-[rgba(0,174,239,0.12)] flex items-center justify-center mx-auto mb-4">
                  <Check size={24} className="text-[#00AEEF]" />
                </div>
                <h3 className="text-gray-900 dark:text-[#F1F5F9] text-lg font-semibold mb-1">{savedClientName} added successfully!</h3>
                <p className="text-gray-500 dark:text-[#94A3B8] text-sm mb-6">Would you like to create a program for them?</p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => { setShowProgramPrompt(false); toast.info('Program wizard coming in Phase 3!'); navigate('/clients') }}
                    className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-500 dark:text-[#A0A0A0] hover:text-gray-900 dark:hover:text-[#F0F0F0] border border-gray-200 dark:border-[#2A3A50] hover:border-[#3A3A3A] transition-colors"
                  >
                    Later
                  </button>
                  <button
                    onClick={() => { setShowProgramPrompt(false); toast.info('Program wizard coming in Phase 3!'); navigate('/programs/create') }}
                    className="flex-1 bg-[#00AEEF] hover:bg-[#009BD6] text-white font-semibold py-2.5 rounded-xl transition-all text-sm"
                  >
                    Yes, Create Program
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
