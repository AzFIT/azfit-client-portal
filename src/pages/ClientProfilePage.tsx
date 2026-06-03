import { useState, useMemo, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft, Activity, Target, Flame, Apple, Scale,
  ChevronDown, ChevronUp, X, Dumbbell,
  TrendingUp, FileText, Clock,
} from 'lucide-react'
import { getCurrentCoach, getInitials, updateClient, loadClientsForCoach } from '@/lib/auth'
import { getProgramsForClient, getNotesForClient, addClientNote } from '@/lib/db'
import { toast } from 'sonner'
import type { Client } from '@/types/auth'
import SessionsTab from '@/components/SessionsTab'

const easeOut = [0.16, 1, 0.3, 1] as [number, number, number, number]

/* ═══════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════ */

function calculateTDEE(weightKg: number, heightCm: number, age: number, gender: string, activityKey: string) {
  if (!weightKg || !heightCm || !age || !gender || !activityKey) return { bmr: 0, tdee: 0 }
  let bmr = 0
  if (gender === 'male') {
    bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age) + 5
  } else {
    bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age) - 161
  }
  const multipliers: Record<string, number> = { sedentary: 1.2, light: 1.375, moderate: 1.55, very: 1.725, athlete: 1.9 }
  return { bmr: Math.round(bmr), tdee: Math.round(bmr * (multipliers[activityKey] || 1.2)) }
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
   REFERENCE DATA
   ═══════════════════════════════════════════ */

const MALE_RANGES: Record<string, [number, number]> = {
  chin: [3, 6], cheek: [3, 5], pec: [4, 8], tricep: [4, 8],
  subscap: [8, 12], midax: [4, 8], supra: [6, 10], umbil: [8, 15],
  knee: [4, 8], calf: [4, 8], thigh: [6, 10], ham: [6, 10],
}

function getIdealRange(site: string, gender: string): [number, number] {
  const base = MALE_RANGES[site] || [0, 0]
  if (gender === 'female') {
    return [+(base[0] * 1.25).toFixed(1), +(base[1] * 1.3).toFixed(1)]
  }
  return base
}

function getSiteStatus(value: number, range: [number, number]): 'normal' | 'elevated' | 'high' {
  if (value <= range[1]) return 'normal'
  if (value <= range[1] * 1.5) return 'elevated'
  return 'high'
}

const DIET_OPTIONS = [
  { key: 'balanced', label: 'Balanced', desc: '30P / 35C / 35F' },
  { key: 'lowCarb', label: 'Low Carb', desc: '35P / 15C / 50F' },
  { key: 'highCarb', label: 'High Carb', desc: '25P / 55C / 20F' },
  { key: 'highProtein', label: 'High Protein', desc: '40P / 30C / 30F' },
]

const ALL_SKINFOLD_SITES = [
  { key: 'tricep', label: 'Tricep' },
  { key: 'subscap', label: 'Sub-Scapular' },
  { key: 'supra', label: 'Suprailiac' },
  { key: 'umbil', label: 'Umbilical' },
  { key: 'thigh', label: 'Thigh' },
  { key: 'pec', label: 'Pectoral' },
  { key: 'midax', label: 'Mid-Axillary' },
  { key: 'chin', label: 'Chin' },
  { key: 'cheek', label: 'Cheek' },
  { key: 'knee', label: 'Knee' },
  { key: 'calf', label: 'Calf' },
  { key: 'ham', label: 'Hamstring' },
]

/* ═══════════════════════════════════════════
   MACRO BAR
   ═══════════════════════════════════════════ */

function MacroBar({ protein, carbs, fat, total }: { protein: number; carbs: number; fat: number; total: number }) {
  const pPct = total > 0 ? (protein * 4 / total) * 100 : 0
  const cPct = total > 0 ? (carbs * 4 / total) * 100 : 0
  const fPct = total > 0 ? (fat * 9 / total) * 100 : 0
  return (
    <div className="space-y-2">
      <div className="h-3 rounded-full bg-gray-100 dark:bg-[#1A1A1A] overflow-hidden flex">
        <div className="h-full bg-[#00AEEF]" style={{ width: `${pPct}%` }} />
        <div className="h-full bg-[#8B5CF6]" style={{ width: `${cPct}%` }} />
        <div className="h-full bg-[#F59E0B]" style={{ width: `${fPct}%` }} />
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-[#00AEEF]">Protein {protein}g</span>
        <span className="text-[#8B5CF6]">Carbs {carbs}g</span>
        <span className="text-[#F59E0B]">Fat {fat}g</span>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   RE-ASSESSMENT MODAL
   ═══════════════════════════════════════════ */

function ReassessModal({ client, open, onClose, onSave }: {
  client: Client
  open: boolean
  onClose: () => void
  onSave: (updated: Client) => void
}) {
  const [weight, setWeight] = useState(client.bodyAssessment?.weight || 0)
  const [activity, setActivity] = useState(client.tdee?.activityLevel || 'moderate')
  const [skinfolds, setSkinfolds] = useState<Record<string, number>>(
    Object.fromEntries(Object.entries(client.bodyAssessment?.skinfolds || {}).filter(([, v]) => v !== undefined)) as Record<string, number>
  )

  const age = client.personal.age
  const gender = client.personal.gender

  const sum7 = useMemo(() =>
    ALL_SKINFOLD_SITES.slice(0, 7).reduce((sum, s) => sum + (skinfolds[s.key] || 0), 0)
  , [skinfolds])

  const bodyFat = useMemo(() => {
    if (sum7 <= 0) return 0
    return calculateBodyFatJP7(sum7, age, gender)
  }, [sum7, age, gender])

  const { bmr, tdee } = useMemo(() =>
    calculateTDEE(weight, client.bodyAssessment.height, age, gender, activity)
  , [weight, client.bodyAssessment.height, age, gender, activity])

  const handleSave = () => {
    const updated: Client = {
      ...client,
      bodyAssessment: {
        ...client.bodyAssessment,
        weight,
        skinfolds: { ...skinfolds },
        sumOfSkinfolds: sum7,
        bodyFatPercent: bodyFat,
        leanMass: weight > 0 && bodyFat > 0 ? +(weight * (1 - bodyFat / 100)).toFixed(1) : 0,
        fatMass: weight > 0 && bodyFat > 0 ? +(weight * (bodyFat / 100)).toFixed(1) : 0,
      },
      tdee: { ...client.tdee, bmr, tdee, activityLevel: activity, bodyFatPercent: bodyFat },
      nutrition: {
        ...client.nutrition,
        maintenanceCalories: tdee,
        fatLossCalories: tdee - 500,
        aggressiveFatLoss: tdee - 750,
        muscleGainCalories: tdee + 250,
      },
      updatedAt: new Date().toISOString(),
      assessmentHistory: [
        ...(client.assessmentHistory || []),
        { date: new Date().toISOString(), weight, bodyFatPercent: bodyFat, skinfolds: { ...skinfolds }, circumferences: client.bodyAssessment?.circumferences || {}, tdee, bmr },
      ],
    }
    onSave(updated)
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-[300]" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 flex items-center justify-center z-[310] p-4 pointer-events-none"
          >
            <div className="bg-white dark:bg-[#151D2E] border border-gray-200 dark:border-[#2A3A50] rounded-2xl p-6 w-full max-w-lg pointer-events-auto max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-900 dark:text-[#F1F5F9] font-semibold">Re-Assess Client</h3>
                <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 dark:text-[#6B6B6B] hover:text-gray-900 dark:hover:text-[#F0F0F0] hover:bg-gray-100 dark:bg-[#1A1A1A] dark:hover:bg-[#242424]"><X size={18} /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <Label required>Weight (kg)</Label>
                  <input type="number" value={weight || ''} onChange={e => setWeight(parseFloat(e.target.value) || 0)}
                    className="w-full h-10 bg-gray-100 dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2A2A2A] rounded-lg px-3 text-gray-900 dark:text-[#F0F0F0] text-sm focus:outline-none focus:border-[#00AEEF]" />
                </div>
                <div>
                  <Label required>Activity Level</Label>
                  <select value={activity} onChange={e => setActivity(e.target.value)}
                    className="w-full h-10 bg-gray-100 dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2A2A2A] rounded-lg px-3 text-gray-900 dark:text-[#F0F0F0] text-sm focus:outline-none focus:border-[#00AEEF]">
                    <option value="sedentary">Sedentary</option>
                    <option value="light">Lightly Active</option>
                    <option value="moderate">Moderately Active</option>
                    <option value="very">Very Active</option>
                    <option value="athlete">Athlete</option>
                  </select>
                </div>
                <div>
                  <Label>7-Site Skinfolds (mm)</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {ALL_SKINFOLD_SITES.slice(0, 7).map(s => (
                      <div key={s.key}>
                        <span className="text-[10px] text-gray-400 dark:text-[#6B6B6B]">{s.label}</span>
                        <input type="number" value={skinfolds[s.key] || ''} onChange={e => setSkinfolds(p => ({ ...p, [s.key]: parseFloat(e.target.value) || 0 }))}
                          className="w-full h-8 bg-gray-100 dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2A2A2A] rounded-lg px-2 text-gray-900 dark:text-[#F0F0F0] text-xs focus:outline-none focus:border-[#00AEEF]" />
                      </div>
                    ))}
                  </div>
                </div>
                {bodyFat > 0 && (
                  <div className="bg-gray-100 dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2A2A2A] rounded-lg p-3">
                    <p className="text-xs text-gray-500 dark:text-[#A0A0A0]">New Body Fat: <span className="text-gray-900 dark:text-[#F0F0F0] font-bold">{bodyFat.toFixed(1)}%</span></p>
                    <p className="text-xs text-gray-500 dark:text-[#A0A0A0]">New TDEE: <span className="text-[#00AEEF] font-bold">{tdee} kcal</span></p>
                  </div>
                )}
              </div>
              <button onClick={handleSave} className="w-full mt-4 bg-[#00AEEF] hover:bg-[#009BD6] text-white font-semibold py-2.5 rounded-xl text-sm transition-all">
                Save Re-Assessment
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

/* ═══════════════════════════════════════════
   NUTRITION TAB
   ═══════════════════════════════════════════ */

function NutritionTab({ client, onUpdate }: { client: Client; onUpdate: (c: Client) => void }) {
  const [selectedCalories, setSelectedCalories] = useState<'maintenance' | 'fatLoss' | 'aggressive' | 'muscleGain'>('maintenance')
  const [dietType, setDietType] = useState<string>(client.nutrition?.dietPreference || 'balanced')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [showReassess, setShowReassess] = useState(false)

  const n = client.nutrition || {}
  const targets = {
    maintenance: n.maintenanceCalories || 0,
    fatLoss: n.fatLossCalories || 0,
    aggressive: n.aggressiveFatLoss || 0,
    muscleGain: n.muscleGainCalories || 0,
  }

  const weightKg = client.bodyAssessment?.weight || 0
  const macroResult = useMemo(() => {
    const cals = targets[selectedCalories]
    if (!cals || !weightKg) return null
    return calculateMacros(cals, weightKg, dietType)
  }, [targets, selectedCalories, weightKg, dietType])

  const perMeal = (meals: number) => {
    if (!macroResult) return null
    return {
      protein: Math.round(macroResult.protein / meals),
      carbs: Math.round(macroResult.carbs / meals),
      fat: Math.round(macroResult.fat / meals),
    }
  }

  // BioPrint ratios
  const skinfolds = client.bodyAssessment?.skinfolds || {}
  const gender = client.personal.gender

  const upperBodySum = ['chin', 'cheek', 'pec', 'tricep', 'subscap', 'midax', 'supra', 'umbil']
    .reduce((s, k) => s + (skinfolds[k] || 0), 0)
  const lowerBodySum = ['knee', 'calf', 'thigh', 'ham']
    .reduce((s, k) => s + (skinfolds[k] || 0), 0)

  const ratios = [
    {
      name: 'Upper-to-Lower',
      value: lowerBodySum > 0 ? (upperBodySum / lowerBodySum).toFixed(2) : '—',
      ideal: '~1.0',
      interp: upperBodySum / lowerBodySum > 1.2 ? 'Upper dominant — may indicate cortisol/stress' :
        upperBodySum / lowerBodySum < 0.8 ? 'Lower dominant — may indicate estrogen influence' :
        'Balanced',
    },
    {
      name: 'Subscap-to-Tricep',
      value: (skinfolds['tricep'] || 0) > 0 ? ((skinfolds['subscap'] || 0) / (skinfolds['tricep'] || 1)).toFixed(2) : '—',
      ideal: '~1.5',
      interp: (skinfolds['subscap'] || 0) / ((skinfolds['tricep'] || 1)) > 2.0 ? 'May indicate insulin resistance' : 'Normal range',
    },
    {
      name: 'Supra-to-Subscap',
      value: (skinfolds['subscap'] || 0) > 0 ? ((skinfolds['supra'] || 0) / (skinfolds['subscap'] || 1)).toFixed(2) : '—',
      ideal: '~0.8',
      interp: (skinfolds['supra'] || 0) / ((skinfolds['subscap'] || 1)) > 1.0 ? 'May indicate carb tolerance issues' : 'Normal range',
    },
    {
      name: 'Quad-to-Hamstring',
      value: (skinfolds['ham'] || 0) > 0 ? ((skinfolds['thigh'] || 0) / (skinfolds['ham'] || 1)).toFixed(2) : '—',
      ideal: '~1.0',
      interp: Math.abs(((skinfolds['thigh'] || 0) / ((skinfolds['ham'] || 1))) - 1) > 0.3 ? 'Imbalance — check training/recovery' : 'Balanced',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Calorie Targets */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-[#F0F0F0] mb-3">Calorie Targets</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { key: 'maintenance' as const, label: 'Maintenance', val: targets.maintenance, sub: 'TDEE', color: '#00AEEF' },
            { key: 'fatLoss' as const, label: 'Fat Loss', val: targets.fatLoss, sub: '-500/day', color: '#22C55E' },
            { key: 'aggressive' as const, label: 'Aggressive', val: targets.aggressive, sub: '-750/day', color: '#F59E0B' },
            { key: 'muscleGain' as const, label: 'Muscle Gain', val: targets.muscleGain, sub: '+250/day', color: '#8B5CF6' },
          ].map(c => (
            <button
              key={c.key}
              onClick={() => setSelectedCalories(c.key)}
              className={`rounded-xl border p-4 text-center transition-all ${
                selectedCalories === c.key
                  ? 'border-[#00AEEF] bg-cyan-50 dark:bg-[rgba(0,174,239,0.08)]'
                  : 'border-gray-200 dark:border-[#2A3A50] bg-white dark:bg-[#151D2E] hover:border-[#3A3A3A]'
              }`}
            >
              <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-[#94A3B8] mb-1">{c.label}</p>
              <p className="text-xl font-bold font-mono" style={{ color: c.color }}>{c.val.toLocaleString()}</p>
              <p className="text-[10px] text-gray-400 dark:text-[#6B6B6B] mt-1">{c.sub}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Diet Preference */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-[#F0F0F0] mb-3">Diet Preference</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {DIET_OPTIONS.map(d => {
            const isSelected = dietType === d.key
            return (
              <button
                key={d.key}
                onClick={() => setDietType(d.key)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isSelected ? 'border-[#00AEEF] bg-cyan-50 dark:bg-[rgba(0,174,239,0.12)]' : 'border-gray-200 dark:border-[#2A3A50] bg-white dark:bg-[#151D2E] hover:border-[#3A3A3A]'
                }`}
              >
                <p className={`text-xs font-medium ${isSelected ? 'text-[#00AEEF]' : 'text-gray-900 dark:text-[#F0F0F0]'}`}>{d.label}</p>
                <p className="text-[10px] text-gray-400 dark:text-[#6B6B6B] mt-0.5">{d.desc}</p>
              </button>
            )
          })}
        </div>
      </div>

      {/* Macro Breakdown */}
      {macroResult && (
        <div className="bg-white dark:bg-[#151D2E] border border-gray-200 dark:border-[#2A3A50] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-[#F0F0F0] mb-3">Macro Breakdown</h3>
          <MacroBar protein={macroResult.protein} carbs={macroResult.carbs} fat={macroResult.fat} total={macroResult.calories} />
          <div className="grid grid-cols-3 gap-4 mt-4 text-center">
            <div>
              <p className="text-lg font-bold text-[#00AEEF]">{macroResult.protein}g</p>
              <p className="text-[10px] text-gray-400 dark:text-[#6B6B6B]">Protein</p>
              <p className="text-[10px] text-gray-500 dark:text-[#94A3B8]">{macroResult.protein * 4} cal</p>
            </div>
            <div>
              <p className="text-lg font-bold text-[#8B5CF6]">{macroResult.carbs}g</p>
              <p className="text-[10px] text-gray-400 dark:text-[#6B6B6B]">Carbs</p>
              <p className="text-[10px] text-gray-500 dark:text-[#94A3B8]">{macroResult.carbs * 4} cal</p>
            </div>
            <div>
              <p className="text-lg font-bold text-[#F59E0B]">{macroResult.fat}g</p>
              <p className="text-[10px] text-gray-400 dark:text-[#6B6B6B]">Fat</p>
              <p className="text-[10px] text-gray-500 dark:text-[#94A3B8]">{macroResult.fat * 9} cal</p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-[#2A3A50] text-center">
            <p className="text-xs text-gray-500 dark:text-[#94A3B8]">Total: <span className="text-gray-900 dark:text-[#F1F5F9] font-bold">{macroResult.calories.toLocaleString()} kcal</span></p>
          </div>
        </div>
      )}

      {/* Per Meal */}
      {macroResult && (
        <div className="bg-white dark:bg-[#151D2E] border border-gray-200 dark:border-[#2A3A50] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-[#F0F0F0] mb-3">Per Meal Breakdown</h3>
          <div className="space-y-2">
            {[3, 4, 5].map(meals => {
              const m = perMeal(meals)
              if (!m) return null
              return (
                <div key={meals} className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-[#94A3B8]">{meals} meals/day</span>
                  <span className="text-gray-900 dark:text-[#F0F0F0]">P: {m.protein}g | C: {m.carbs}g | F: {m.fat}g</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Re-Assess */}
      <button
        onClick={() => setShowReassess(true)}
        className="w-full py-2.5 rounded-xl border border-gray-200 dark:border-[#2A3A50] text-gray-500 dark:text-[#94A3B8] hover:text-gray-900 dark:hover:text-[#F0F0F0] hover:border-[#00AEEF]/50 text-sm font-medium transition-all flex items-center justify-center gap-2"
      >
        <Scale size={14} />
        Re-Assess Client
      </button>

      <ReassessModal client={client} open={showReassess} onClose={() => setShowReassess(false)} onSave={onUpdate} />

      {/* Advanced BioPrint */}
      <div className="bg-white dark:bg-[#151D2E] border border-gray-200 dark:border-[#2A3A50] rounded-xl overflow-hidden">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full flex items-center justify-between p-5 text-left"
        >
          <span className="text-sm font-semibold text-gray-900 dark:text-[#F0F0F0]">Advanced BioPrint Analysis</span>
          {showAdvanced ? <ChevronUp size={16} className="text-gray-400 dark:text-[#6B6B6B]" /> : <ChevronDown size={16} className="text-gray-400 dark:text-[#6B6B6B]" />}
        </button>
        <AnimatePresence>
          {showAdvanced && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="px-5 pb-5 space-y-5">
                {/* Site-by-Site Table */}
                <div>
                  <h4 className="text-xs font-semibold text-[#00AEEF] uppercase tracking-wider mb-2">Site-by-Site Analysis</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-gray-400 dark:text-[#6B6B6B] border-b border-gray-200 dark:border-[#2A3A50]">
                          <th className="text-left py-2 pr-4">Site</th>
                          <th className="text-right py-2 pr-4">Value</th>
                          <th className="text-right py-2 pr-4">Ideal Range</th>
                          <th className="text-right py-2">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ALL_SKINFOLD_SITES.map(site => {
                          const val = skinfolds[site.key] || 0
                          const range = getIdealRange(site.key, gender)
                          const status = val > 0 ? getSiteStatus(val, range) : 'normal'
                          const statusColors = { normal: '#22C55E', elevated: '#F59E0B', high: '#EF4444' }
                          return (
                            <tr key={site.key} className="border-b border-gray-200 dark:border-[#1F1F1F]">
                              <td className="py-2 pr-4 text-gray-900 dark:text-[#F0F0F0]">{site.label}</td>
                              <td className="py-2 pr-4 text-right text-gray-900 dark:text-[#F0F0F0]">{val > 0 ? `${val} mm` : '—'}</td>
                              <td className="py-2 pr-4 text-right text-gray-500 dark:text-[#94A3B8]">{range[0]}-{range[1]} mm</td>
                              <td className="py-2 text-right">
                                {val > 0 && (
                                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full" style={{ color: statusColors[status], backgroundColor: statusColors[status] + '20' }}>
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                  </span>
                                )}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Poliquin Ratios */}
                <div>
                  <h4 className="text-xs font-semibold text-[#00AEEF] uppercase tracking-wider mb-2">Poliquin Key Ratios</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {ratios.map(r => (
                      <div key={r.name} className="bg-gray-100 dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2A2A2A] rounded-lg p-3">
                        <p className="text-[10px] text-gray-400 dark:text-[#6B6B6B] uppercase tracking-wider">{r.name}</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-[#F0F0F0] font-mono mt-0.5">{r.value}</p>
                        <p className="text-[10px] text-gray-500 dark:text-[#94A3B8] mt-0.5">Ideal: {r.ideal}</p>
                        <p className="text-[10px] text-[#00AEEF] mt-1">{r.interp}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   OVERVIEW TAB
   ═══════════════════════════════════════════ */

function InfoRow({ label, value, icon: Icon }: { label: string; value: React.ReactNode; icon?: React.ElementType }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-[#2A3A50]/50 last:border-0">
      <div className="flex items-center gap-2 text-gray-500 dark:text-[#94A3B8] text-sm">
        {Icon && <Icon size={14} />}
        {label}
      </div>
      <span className="text-gray-900 dark:text-[#F1F5F9] text-sm font-medium">{value || '—'}</span>
    </div>
  )
}

function OverviewTab({ client }: { client: Client }) {
  const p = client.personal
  const g = client.goals
  const b = client.bodyAssessment
  const t = client.tdee

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-[#151D2E] border border-gray-200 dark:border-[#2A3A50] rounded-xl p-5">
          <h2 className="text-gray-900 dark:text-[#F0F0F0] font-semibold text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
            <Activity size={14} className="text-[#00AEEF]" />
            Personal Information
          </h2>
          <InfoRow label="Full Name" value={p.fullName} />
          <InfoRow label="Email" value={p.email} />
          <InfoRow label="Phone" value={p.phone} />
          <InfoRow label="Date of Birth" value={p.dateOfBirth} />
          <InfoRow label="Age" value={`${p.age} years`} />
          <InfoRow label="Gender" value={p.gender.charAt(0).toUpperCase() + p.gender.slice(1)} />
        </div>

        <div className="bg-white dark:bg-[#151D2E] border border-gray-200 dark:border-[#2A3A50] rounded-xl p-5">
          <h2 className="text-gray-900 dark:text-[#F0F0F0] font-semibold text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
            <Target size={14} className="text-[#00AEEF]" />
            Goals & Training
          </h2>
          <InfoRow label="Primary Goal" value={g.primary} />
          <InfoRow label="Secondary Goal" value={g.secondary || 'None'} />
          <InfoRow label="Experience" value={g.experienceLevel} />
          <InfoRow label="Sessions/Week" value={g.sessionsPerWeek} />
          <InfoRow label="Session Duration" value={`${g.sessionDuration} min`} />
          <InfoRow label="Equipment" value={g.equipment.length > 0 ? g.equipment.join(', ') : 'None'} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-[#151D2E] border border-gray-200 dark:border-[#2A3A50] rounded-xl p-5">
          <h2 className="text-gray-900 dark:text-[#F0F0F0] font-semibold text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
            <Scale size={14} className="text-[#00AEEF]" />
            Body Assessment
          </h2>
          <InfoRow label="Weight" value={`${b?.weight} kg`} />
          <InfoRow label="Height" value={`${b?.height} cm`} />
          <InfoRow label="BMI" value={b?.bmi} />
          <InfoRow label="Body Fat" value={`${b?.bodyFatPercent?.toFixed(1)}%`} />
          <InfoRow label="Lean Mass" value={`${b?.leanMass} kg`} />
          <InfoRow label="Fat Mass" value={`${b?.fatMass} kg`} />
        </div>

        <div className="bg-white dark:bg-[#151D2E] border border-gray-200 dark:border-[#2A3A50] rounded-xl p-5">
          <h2 className="text-gray-900 dark:text-[#F0F0F0] font-semibold text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
            <Flame size={14} className="text-[#00AEEF]" />
            Metabolic Data
          </h2>
          <InfoRow label="BMR" value={`${t?.bmr} kcal/day`} />
          <InfoRow label="TDEE" value={`${t?.tdee} kcal/day`} />
          <InfoRow label="Activity" value={t?.activityLevel} />
          <InfoRow label="Maintenance" value={`${client.nutrition?.maintenanceCalories} kcal`} />
          <InfoRow label="Fat Loss" value={`${client.nutrition?.fatLossCalories} kcal`} />
          <InfoRow label="Muscle Gain" value={`${client.nutrition?.muscleGainCalories} kcal`} />
        </div>
      </div>

      {(p.emergencyContact?.name || p.emergencyContact?.phone) && (
        <div className="bg-white dark:bg-[#151D2E] border border-gray-200 dark:border-[#2A3A50] rounded-xl p-5">
          <h2 className="text-gray-900 dark:text-[#F0F0F0] font-semibold text-sm uppercase tracking-wider mb-3">Emergency Contact</h2>
          <InfoRow label="Name" value={p.emergencyContact?.name} />
          <InfoRow label="Phone" value={p.emergencyContact?.phone} />
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════
   BODY TAB
   ═══════════════════════════════════════════ */

function BodyTab({ client }: { client: Client }) {
  const history = client.assessmentHistory || []
  if (history.length === 0) {
    return (
      <div className="bg-white dark:bg-[#151D2E] border border-gray-200 dark:border-[#2A3A50] rounded-xl p-8 text-center">
        <Scale size={40} className="mx-auto text-[#2A3A50] mb-3" />
        <h3 className="text-gray-900 dark:text-[#F1F5F9] font-semibold mb-1">No Body Assessments</h3>
        <p className="text-gray-500 dark:text-[#94A3B8] text-sm">Complete the intake wizard or re-assess to see history here.</p>
      </div>
    )
  }

  const sorted = [...history].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <div className="space-y-4">
      {sorted.map((record, i) => (
        <motion.div
          key={record.date}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="bg-white dark:bg-[#151D2E] border border-gray-200 dark:border-[#2A3A50] rounded-xl overflow-hidden"
        >
          <div className="p-4 flex items-center justify-between">
            <div>
              <p className="text-gray-900 dark:text-[#F1F5F9] font-semibold text-sm">
                {new Date(record.date).toLocaleDateString()}
              </p>
              <p className="text-gray-500 dark:text-[#94A3B8] text-xs mt-0.5">
                Weight: {record.weight} kg · Body Fat: {record.bodyFatPercent?.toFixed(1)}% · TDEE: {record.tdee} kcal
              </p>
            </div>
          </div>
          <div className="px-4 pb-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-gray-100 dark:bg-[#1A1A1A] rounded-lg p-3">
              <p className="text-[10px] text-gray-400 dark:text-[#6B6B6B] uppercase">Weight</p>
              <p className="text-gray-900 dark:text-[#F1F5F9] font-bold">{record.weight} kg</p>
            </div>
            <div className="bg-gray-100 dark:bg-[#1A1A1A] rounded-lg p-3">
              <p className="text-[10px] text-gray-400 dark:text-[#6B6B6B] uppercase">Body Fat</p>
              <p className="text-gray-900 dark:text-[#F1F5F9] font-bold">{record.bodyFatPercent?.toFixed(1)}%</p>
            </div>
            <div className="bg-gray-100 dark:bg-[#1A1A1A] rounded-lg p-3">
              <p className="text-[10px] text-gray-400 dark:text-[#6B6B6B] uppercase">TDEE</p>
              <p className="text-gray-900 dark:text-[#F1F5F9] font-bold">{record.tdee} kcal</p>
            </div>
            <div className="bg-gray-100 dark:bg-[#1A1A1A] rounded-lg p-3">
              <p className="text-[10px] text-gray-400 dark:text-[#6B6B6B] uppercase">BMR</p>
              <p className="text-gray-900 dark:text-[#F1F5F9] font-bold">{record.bmr} kcal</p>
            </div>
          </div>
          {record.skinfolds && Object.keys(record.skinfolds).length > 0 && (
            <div className="px-4 pb-4">
              <p className="text-[10px] text-gray-400 dark:text-[#6B6B6B] uppercase mb-2">Skinfolds</p>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                {Object.entries(record.skinfolds).map(([site, val]) => (
                  <div key={site} className="bg-gray-100 dark:bg-[#1A1A1A] rounded-lg p-2 text-center">
                    <p className="text-[10px] text-gray-400 dark:text-[#6B6B6B] capitalize">{site}</p>
                    <p className="text-gray-900 dark:text-[#F1F5F9] font-semibold text-xs">{val}mm</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  )
}

/* ═══════════════════════════════════════════
   PROGRAMS TAB
   ═══════════════════════════════════════════ */

function ProgramsTab({ clientId }: { clientId: string }) {
  const [programs, setPrograms] = useState<any[]>([])

  useEffect(() => {
    getProgramsForClient(clientId).then(setPrograms)
  }, [clientId])

  if (programs.length === 0) {
    return (
      <div className="bg-white dark:bg-[#151D2E] border border-gray-200 dark:border-[#2A3A50] rounded-xl p-8 text-center">
        <Dumbbell size={40} className="mx-auto text-[#2A3A50] mb-3" />
        <h3 className="text-gray-900 dark:text-[#F1F5F9] font-semibold mb-1">No Programs Yet</h3>
        <p className="text-gray-500 dark:text-[#94A3B8] text-sm mb-4">Create your first program for this client.</p>
        <button
          onClick={() => window.location.href = `#/programs/create?clientId=${clientId}`}
          className="bg-[#00AEEF] hover:bg-[#009BD6] text-white font-semibold px-4 py-2 rounded-xl text-sm"
        >
          Create Program
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {programs.map((p: any, i: number) => (
        <motion.div
          key={p.id || i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="bg-white dark:bg-[#151D2E] border border-gray-200 dark:border-[#2A3A50] rounded-xl p-5"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-gray-900 dark:text-[#F1F5F9] font-semibold">{p.name || 'Untitled Program'}</h3>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-cyan-50 dark:bg-[rgba(0,174,239,0.12)] text-[#00AEEF]">
              {p.status || 'Active'}
            </span>
          </div>
          <p className="text-gray-500 dark:text-[#94A3B8] text-xs mb-3">
            Created {new Date(p.createdAt).toLocaleDateString()} · {p.phases?.length || 0} phases · {p.split?.days?.filter((d: any) => d.isTrainingDay).length || 0} training days
          </p>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 rounded-lg bg-[#00AEEF]/10 text-[#00AEEF] text-xs font-medium hover:bg-[#00AEEF]/20 transition-colors">
              View
            </button>
            <button className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-[#2A3A50] text-gray-500 dark:text-[#94A3B8] text-xs font-medium hover:border-[#3A3A3A] transition-colors">
              Edit
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

/* ═══════════════════════════════════════════
   SESSIONS TAB (imported from components)
   ═══════════════════════════════════════════ */

/* ═══════════════════════════════════════════
   PROGRESS TAB
   ═══════════════════════════════════════════ */

function ProgressTab({ client }: { client: Client }) {
  const history = client.assessmentHistory || []
  if (history.length < 2) {
    return (
      <div className="bg-white dark:bg-[#151D2E] border border-gray-200 dark:border-[#2A3A50] rounded-xl p-8 text-center">
        <TrendingUp size={40} className="mx-auto text-[#2A3A50] mb-3" />
        <h3 className="text-gray-900 dark:text-[#F1F5F9] font-semibold mb-1">Not Enough Data</h3>
        <p className="text-gray-500 dark:text-[#94A3B8] text-sm">Complete at least 2 assessments to see progress charts.</p>
      </div>
    )
  }

  const sorted = [...history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  const first = sorted[0]
  const latest = sorted[sorted.length - 1]
  const weightChange = latest.weight - first.weight
  const bfChange = (latest.bodyFatPercent || 0) - (first.bodyFatPercent || 0)
  const weeks = Math.max(1, Math.round((new Date(latest.date).getTime() - new Date(first.date).getTime()) / (7 * 24 * 60 * 60 * 1000)))

  const maxWeight = Math.max(...sorted.map(s => s.weight)) * 1.05
  const maxBf = Math.max(...sorted.map(s => s.bodyFatPercent || 0), 1) * 1.2

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="bg-white dark:bg-[#151D2E] border border-gray-200 dark:border-[#2A3A50] rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-[#F0F0F0] mb-3">{weeks} Weeks of Progress</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-100 dark:bg-[#1A1A1A] rounded-lg p-4">
            <p className="text-[10px] text-gray-400 dark:text-[#6B6B6B] uppercase">Weight Change</p>
            <p className={`text-xl font-bold ${weightChange <= 0 ? 'text-[#22C55E]' : 'text-[#F59E0B]'}`}>
              {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)} kg
            </p>
            <p className="text-[10px] text-gray-500 dark:text-[#94A3B8] mt-0.5">
              {first.weight} → {latest.weight} kg
            </p>
          </div>
          <div className="bg-gray-100 dark:bg-[#1A1A1A] rounded-lg p-4">
            <p className="text-[10px] text-gray-400 dark:text-[#6B6B6B] uppercase">Body Fat Change</p>
            <p className={`text-xl font-bold ${bfChange <= 0 ? 'text-[#22C55E]' : 'text-[#F59E0B]'}`}>
              {bfChange > 0 ? '+' : ''}{bfChange.toFixed(1)}%
            </p>
            <p className="text-[10px] text-gray-500 dark:text-[#94A3B8] mt-0.5">
              {first.bodyFatPercent?.toFixed(1)}% → {latest.bodyFatPercent?.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      {/* Weight Timeline */}
      <div className="bg-white dark:bg-[#151D2E] border border-gray-200 dark:border-[#2A3A50] rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-[#F0F0F0] mb-3">Weight Over Time</h3>
        <div className="space-y-3">
          {sorted.map(r => (
            <div key={r.date} className="flex items-center gap-3">
              <span className="text-xs text-gray-500 dark:text-[#94A3B8] w-20 flex-shrink-0">
                {new Date(r.date).toLocaleDateString()}
              </span>
              <div className="flex-1 h-2 bg-gray-100 dark:bg-[#1A1A1A] rounded-full overflow-hidden">
                <div className="h-full bg-[#00AEEF] rounded-full" style={{ width: `${Math.min(100, (r.weight / maxWeight) * 100)}%` }} />
              </div>
              <span className="text-xs text-gray-900 dark:text-[#F1F5F9] font-medium w-14 text-right">{r.weight} kg</span>
            </div>
          ))}
        </div>
      </div>

      {/* Body Fat Timeline */}
      <div className="bg-white dark:bg-[#151D2E] border border-gray-200 dark:border-[#2A3A50] rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-[#F0F0F0] mb-3">Body Fat % Over Time</h3>
        <div className="space-y-3">
          {sorted.map(r => (
            <div key={r.date} className="flex items-center gap-3">
              <span className="text-xs text-gray-500 dark:text-[#94A3B8] w-20 flex-shrink-0">
                {new Date(r.date).toLocaleDateString()}
              </span>
              <div className="flex-1 h-2 bg-gray-100 dark:bg-[#1A1A1A] rounded-full overflow-hidden">
                <div className="h-full bg-[#8B5CF6] rounded-full" style={{ width: `${Math.min(100, ((r.bodyFatPercent || 0) / maxBf) * 100)}%` }} />
              </div>
              <span className="text-xs text-gray-900 dark:text-[#F1F5F9] font-medium w-14 text-right">{r.bodyFatPercent?.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   NOTES TAB
   ═══════════════════════════════════════════ */

function NotesTab({ clientId }: { clientId: string }) {
  const [noteText, setNoteText] = useState('')
  const [history, setHistory] = useState<{ date: string; text: string }[]>([])

  useEffect(() => {
    getNotesForClient(clientId).then(notes => {
      if (notes && notes.length > 0) {
        setNoteText(notes[0]?.note_text || '')
        setHistory(notes.map((n: any) => ({ date: n.created_at, text: n.note_text })))
      }
    })
  }, [clientId])

  const handleSave = async () => {
    if (!noteText.trim()) return
    const coach = getCurrentCoach()
    if (!coach) return
    await addClientNote(clientId, coach.id, noteText.trim())
    const notes = await getNotesForClient(clientId)
    setHistory(notes.map((n: any) => ({ date: n.created_at, text: n.note_text })))
    toast.success('Note saved')
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-[#151D2E] border border-gray-200 dark:border-[#2A3A50] rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-[#F0F0F0] mb-3">Coach Notes</h3>
        <textarea
          value={noteText}
          onChange={e => setNoteText(e.target.value)}
          onBlur={handleSave}
          placeholder="Add notes about this client's progress, behavior, goals, etc..."
          className="w-full h-32 bg-gray-100 dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2A2A2A] rounded-lg p-3 text-sm text-gray-900 dark:text-[#F0F0F0] placeholder:text-gray-400 dark:placeholder:text-[#6B6B6B] focus:outline-none focus:border-[#00AEEF] resize-none"
        />
        <p className="text-[10px] text-gray-400 dark:text-[#6B6B6B] mt-2">Auto-saves on blur</p>
      </div>

      {history.length > 0 && (
        <div className="bg-white dark:bg-[#151D2E] border border-gray-200 dark:border-[#2A3A50] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-[#F0F0F0] mb-3">Note History</h3>
          <div className="space-y-3">
            {[...history].reverse().map((entry, i) => (
              <div key={i} className="border-l-2 border-gray-200 dark:border-[#2A3A50] pl-3">
                <p className="text-[10px] text-gray-400 dark:text-[#6B6B6B] mb-1">
                  {new Date(entry.date).toLocaleString()}
                </p>
                <p className="text-sm text-gray-900 dark:text-[#F1F5F9]">{entry.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════
   LABEL COMPONENT
   ═══════════════════════════════════════════ */

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="text-xs text-gray-500 dark:text-[#A0A0A0] mb-1.5 block">
      {children} {required && <span className="text-[#EF4444]">*</span>}
    </label>
  )
}

/* ═══════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════ */

export default function ClientProfilePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const coach = getCurrentCoach()
  const [activeTab, setActiveTab] = useState<'overview' | 'body' | 'nutrition' | 'programs' | 'sessions' | 'progress' | 'notes'>('overview')

  useEffect(() => {
    if (!coach) navigate('/login')
  }, [coach, navigate])

  const [client, setClient] = useState<Client | undefined>(undefined)

  useEffect(() => {
    if (!coach || !id) return
    loadClientsForCoach(coach.id).then(clients => {
      const found = clients.find(c => c.id === id)
      setClient(found)
    })
  }, [coach, id])

  useEffect(() => {
    if (!client) {
      toast.error('Client not found')
      navigate('/clients')
    }
  }, [client, navigate])

  const handleUpdate = async (updated: Client) => {
    await updateClient(updated)
    toast.success('Client assessment updated')
    // Refresh client data
    if (coach) {
      const clients = await loadClientsForCoach(coach.id)
      setClient(clients.find(c => c.id === updated.id))
    }
  }

  if (!client) return null

  const p = client.personal

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: easeOut }}
      className="max-w-[900px] mx-auto"
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg bg-gray-100 dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2A2A2A] text-gray-500 dark:text-[#A0A0A0] hover:text-gray-900 dark:hover:text-[#F0F0F0] hover:border-[#3A3A3A] transition-colors"
        >
          <ChevronLeft size={18} />
        </button>
        <div className="flex-1">
          <h1 className="text-gray-900 dark:text-[#F0F0F0] text-2xl font-semibold tracking-tight">{p.fullName}</h1>
          <p className="text-gray-500 dark:text-[#A0A0A0] text-sm mt-0.5">
            {p.age} years · {p.gender.charAt(0).toUpperCase() + p.gender.slice(1)} · {client.goals?.primary}
          </p>
        </div>
        <button
          onClick={() => navigate(`/programs/create?clientId=${client.id}`)}
          className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg bg-[#00AEEF]/10 border border-[#00AEEF]/30 text-[#00AEEF] text-sm font-medium hover:bg-[#00AEEF]/20 transition-colors"
        >
          <Dumbbell size={16} />
          Create Program
        </button>
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #00AEEF, #8B5CF6)', color: '#fff' }}
        >
          {getInitials(p.fullName)}
        </div>
      </div>

      {/* Status Banner */}
      <div
        className="rounded-xl p-4 mb-6 flex items-center justify-between"
        style={{
          background: client.status === 'active' ? 'rgba(34,197,94,0.08)' :
            client.status === 'paused' ? 'rgba(234,179,8,0.08)' : 'rgba(107,114,128,0.08)',
          border: `1px solid ${client.status === 'active' ? 'rgba(34,197,94,0.2)' :
            client.status === 'paused' ? 'rgba(234,179,8,0.2)' : 'rgba(107,114,128,0.2)'}`,
        }}
      >
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{
            backgroundColor: client.status === 'active' ? '#22C55E' : client.status === 'paused' ? '#EAB308' : '#9CA3AF',
          }} />
          <span className="text-sm font-medium capitalize" style={{
            color: client.status === 'active' ? '#22C55E' : client.status === 'paused' ? '#EAB308' : '#9CA3AF',
          }}>
            {client.status}
          </span>
        </div>
        <span className="text-gray-400 dark:text-[#6B6B6B] text-xs">Client since {new Date(client.createdAt).toLocaleDateString()}</span>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 bg-white dark:bg-[#151D2E] border border-gray-200 dark:border-[#2A3A50] rounded-xl p-1 overflow-x-auto">
        {[
          { key: 'overview' as const, label: 'Overview', icon: Activity },
          { key: 'body' as const, label: 'Body', icon: Scale },
          { key: 'nutrition' as const, label: 'Nutrition', icon: Apple },
          { key: 'programs' as const, label: 'Programs', icon: Dumbbell },
          { key: 'sessions' as const, label: 'Sessions', icon: Clock },
          { key: 'progress' as const, label: 'Progress', icon: TrendingUp },
          { key: 'notes' as const, label: 'Notes', icon: FileText },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-shrink-0 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-cyan-50 dark:bg-[rgba(0,174,239,0.12)] text-[#00AEEF]'
                : 'text-gray-500 dark:text-[#94A3B8] hover:text-gray-900 dark:hover:text-[#F0F0F0]'
            }`}
          >
            <tab.icon size={14} />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'overview' && <OverviewTab client={client} />}
          {activeTab === 'body' && <BodyTab client={client} />}
          {activeTab === 'nutrition' && <NutritionTab client={client} onUpdate={handleUpdate} />}
          {activeTab === 'programs' && <ProgramsTab clientId={client.id} />}
          {activeTab === 'sessions' && <SessionsTab clientId={client.id} />}
          {activeTab === 'progress' && <ProgressTab client={client} />}
          {activeTab === 'notes' && <NotesTab clientId={client.id} />}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}
