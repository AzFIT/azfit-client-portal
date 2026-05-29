import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Scan, Scale, FileText, StickyNote, Calendar, CalendarDays,
  ClipboardList, Apple, Heart, Database, Target, Camera, Edit3, CalendarPlus,
  MessageSquare, MoreVertical, ChevronLeft, ChevronRight, TrendingDown,
  TrendingUp, Search, Plus, X, Trophy, Clock, Dumbbell,
  Moon, Activity, CheckCircle2, XCircle, Upload,
  Eye, Flame, Award, Save,
  Filter, GlassWater,
} from 'lucide-react';
import {
  Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, ReferenceLine, ComposedChart,
} from 'recharts';
import type { PhotoCategory, ProgressPhoto } from '@/types';

/* ═══════════════════════════════════════════
   DEMO DATA — Sarah Johnson
   ═══════════════════════════════════════════ */

const client = {
  id: '1', name: 'Sarah Johnson', avatar: '/avatar-placeholder.jpg',
  status: 'Active' as const, clientId: '#CLT-0042', age: 28, sex: 'F',
  weight: 58.5, bodyFat: 18.2, sessions: 47,
  goalWeight: 55.0, startWeight: 68.0, startDate: '2024-06-15',
  program: 'Strength & Conditioning', programPhase: 'Phase 3 — Power',
};

const weightData30d = Array.from({ length: 30 }, (_, i) => ({
  day: `Day ${i + 1}`,
  weight: +(68 - (i * 0.32) + Math.sin(i * 0.5) * 0.4).toFixed(1),
  bodyFat: +(24 - (i * 0.2) + Math.cos(i * 0.3) * 0.3).toFixed(1),
}));

const weightData90d = Array.from({ length: 90 }, (_, i) => ({
  day: `D${i + 1}`,
  weight: +(68 - (i * 0.105) + Math.sin(i * 0.2) * 0.5).toFixed(1),
  bodyFat: +(24 - (i * 0.065) + Math.cos(i * 0.15) * 0.4).toFixed(1),
}));

const bodyFatData6m = [
  { month: 'Jun', bf: 24.0 }, { month: 'Jul', bf: 22.8 },
  { month: 'Aug', bf: 21.5 }, { month: 'Sep', bf: 20.4 },
  { month: 'Oct', bf: 19.5 }, { month: 'Nov', bf: 18.2 },
];

const skinfoldData = [
  { site: 'Tricep', current: 12.5, previous: 14.2, change: -1.7, goal: 10.0 },
  { site: 'Subscapular', current: 14.8, previous: 16.5, change: -1.7, goal: 12.0 },
  { site: 'Bicep', current: 6.2, previous: 7.1, change: -0.9, goal: 5.5 },
  { site: 'Iliac Crest', current: 18.5, previous: 22.3, change: -3.8, goal: 14.0 },
  { site: 'Supraspinale', current: 10.4, previous: 12.8, change: -2.4, goal: 8.0 },
  { site: 'Abdominal', current: 20.1, previous: 25.6, change: -5.5, goal: 15.0 },
  { site: 'Front Thigh', current: 16.7, previous: 19.2, change: -2.5, goal: 14.0 },
  { site: 'Medial Calf', current: 9.3, previous: 10.8, change: -1.5, goal: 7.5 },
];

const measurements = [
  { name: 'Neck', current: 33.2, prev30d: 33.5, prev90d: 34.0, change: -0.3 },
  { name: 'Shoulders', current: 98.5, prev30d: 97.8, prev90d: 95.0, change: 0.7 },
  { name: 'Chest', current: 86.2, prev30d: 85.5, prev90d: 83.0, change: 0.7 },
  { name: 'Waist', current: 68.5, prev30d: 70.2, prev90d: 75.0, change: -1.7 },
  { name: 'Hips', current: 94.3, prev30d: 95.5, prev90d: 98.0, change: -1.2 },
  { name: 'Bicep (L)', current: 28.4, prev30d: 28.0, prev90d: 26.5, change: 0.4 },
  { name: 'Bicep (R)', current: 28.6, prev30d: 28.2, prev90d: 26.8, change: 0.4 },
  { name: 'Thigh (L)', current: 52.8, prev30d: 52.0, prev90d: 50.5, change: 0.8 },
  { name: 'Thigh (R)', current: 53.1, prev30d: 52.3, prev90d: 50.8, change: 0.8 },
  { name: 'Calf (L)', current: 35.2, prev30d: 34.8, prev90d: 34.0, change: 0.4 },
  { name: 'Calf (R)', current: 35.4, prev30d: 35.0, prev90d: 34.2, change: 0.4 },
];

const prData = [
  { exercise: 'Back Squat', weight: 85, reps: 5, date: '18/11/2025', held: 12, previous: 80 },
  { exercise: 'Deadlift', weight: 110, reps: 3, date: '15/11/2025', held: 15, previous: 105 },
  { exercise: 'Bench Press', weight: 55, reps: 6, date: '20/11/2025', held: 10, previous: 50 },
  { exercise: 'Overhead Press', weight: 35, reps: 8, date: '10/11/2025', held: 20, previous: 32.5 },
  { exercise: 'Barbell Row', weight: 50, reps: 8, date: '12/11/2025', held: 18, previous: 45 },
  { exercise: 'Hip Thrust', weight: 100, reps: 10, date: '08/11/2025', held: 22, previous: 90 },
];

const rmEstimates = [
  { exercise: 'Back Squat', weight1RM: 98, repsAt85: 5 },
  { exercise: 'Deadlift', weight1RM: 120, repsAt110: 3 },
  { exercise: 'Bench Press', weight1RM: 64, repsAt55: 6 },
  { exercise: 'Overhead Press', weight1RM: 43, repsAt35: 8 },
];

const notesData = [
  { id: '1', title: 'Form Check — Deadlift', content: 'Sarah\'s hip hinge pattern has improved significantly. Still need to cue shoulder blade retraction at the top. Consider adding paused deadlifts next phase.', author: 'Trainer', date: '22/11/2025', category: 'Form Check', important: true },
  { id: '2', title: 'Weekly Check-in', content: 'Weight down 0.5kg this week. Sleep has been consistent 7+ hours. Stress levels moderate due to work project. Macro adherence at 88%.', author: 'Trainer', date: '20/11/2025', category: 'General', important: false },
  { id: '3', title: 'Nutrition Adjustment', content: 'Dropped carbs by 20g to 220g, increased protein to 145g. Sarah reports feeling good, no energy crashes during workouts.', author: 'Trainer', date: '15/11/2025', category: 'Nutrition', important: true },
  { id: '4', title: 'Client Update', content: 'Feeling stronger on squats! Hip mobility drills are helping. Requested more core work in warm-ups.', author: 'Sarah', date: '18/11/2025', category: 'Goals', important: false },
  { id: '5', title: 'Phase 2 Review', content: 'Completed Phase 2 with 94% session adherence. All strength metrics improved. Ready to progress to power-focused Phase 3.', author: 'Trainer', date: '01/11/2025', category: 'General', important: true },
];

const sessionsData = [
  { id: '1', date: '25/11/2025', time: '09:00', type: 'Lower Body Power', duration: 65, exercises: 6, status: 'Completed' as const, notes: true },
  { id: '2', date: '23/11/2025', time: '09:00', type: 'Upper Body Strength', duration: 70, exercises: 7, status: 'Completed' as const, notes: true },
  { id: '3', date: '21/11/2025', time: '09:00', type: 'Full Body', duration: 60, exercises: 8, status: 'Completed' as const, notes: false },
  { id: '4', date: '19/11/2025', time: '09:00', type: 'Lower Body Strength', duration: 75, exercises: 6, status: 'Completed' as const, notes: true },
  { id: '5', date: '18/11/2025', time: '09:00', type: 'Upper Body Hypertrophy', duration: 68, exercises: 7, status: 'Completed' as const, notes: false },
  { id: '6', date: '16/11/2025', time: '09:00', type: 'Active Recovery', duration: 45, exercises: 4, status: 'Completed' as const, notes: false },
  { id: '7', date: '14/11/2025', time: '09:00', type: 'Lower Body Strength', duration: 72, exercises: 6, status: 'Completed' as const, notes: true },
  { id: '8', date: '12/11/2025', time: '09:00', type: 'Upper Body Strength', duration: 70, exercises: 7, status: 'No-show' as const, notes: false },
];

const calendarSessions = [
  { date: '2025-11-25', time: '09:00', type: 'Lower Body Power', duration: 65 },
  { date: '2025-11-27', time: '09:00', type: 'Upper Body Strength', duration: 70 },
  { date: '2025-11-29', time: '09:00', type: 'Full Body', duration: 60 },
  { date: '2025-12-02', time: '09:00', type: 'Lower Body Strength', duration: 75 },
  { date: '2025-12-04', time: '09:00', type: 'Upper Body Hypertrophy', duration: 68 },
];

const programData = {
  current: { name: 'Strength & Conditioning', method: 'Upper/Lower Split', progress: 75, week: 'Week 12 of 16', phase: 'Phase 3 — Power', compliance: 94, avgRPE: 7.8, sessionsThisPhase: 22 },
  history: [
    { name: 'Hypertrophy Foundation', method: 'Full Body 3x/wk', duration: '12 weeks', dates: 'Jun — Sep 2024', status: 'Completed' as const, weightChange: '-4.2 kg', bfChange: '-3.1%' },
    { name: 'Strength Base', method: 'Upper/Lower 4x/wk', duration: '8 weeks', dates: 'Sep — Nov 2024', status: 'Completed' as const, weightChange: '-2.1 kg', bfChange: '-1.8%' },
    { name: 'Body Recomposition', method: 'PPL Split', duration: '4 weeks', dates: 'Nov — Dec 2024', status: 'Cancelled' as const, weightChange: '-0.5 kg', bfChange: '-0.4%' },
  ],
};

const macroData = {
  calories: { target: 2100, current: 1950 },
  protein: { target: 145, current: 138 },
  carbs: { target: 220, current: 205 },
  fats: { target: 60, current: 58 },
};

const mealsToday = [
  { name: 'Breakfast', time: '07:30', items: [{ name: 'Oatmeal with berries', cal: 320, p: 12, c: 58, f: 6 }, { name: 'Protein shake', cal: 150, p: 25, c: 8, f: 2 }], total: { cal: 470, p: 37, c: 66, f: 8 } },
  { name: 'Lunch', time: '12:30', items: [{ name: 'Grilled chicken salad', cal: 420, p: 42, c: 22, f: 18 }, { name: 'Brown rice', cal: 180, p: 4, c: 38, f: 2 }], total: { cal: 600, p: 46, c: 60, f: 20 } },
  { name: 'Snack', time: '15:30', items: [{ name: 'Greek yogurt', cal: 120, p: 15, c: 8, f: 0 }], total: { cal: 120, p: 15, c: 8, f: 0 } },
  { name: 'Dinner', time: '19:30', items: [{ name: 'Salmon fillet', cal: 350, p: 35, c: 0, f: 22 }, { name: 'Roasted vegetables', cal: 180, p: 4, c: 28, f: 6 }, { name: 'Sweet potato', cal: 130, p: 2, c: 28, f: 0 }], total: { cal: 660, p: 41, c: 56, f: 28 } },
];

const waterIntake = 5;

const weeklyAdherence = [
  { day: 'Mon', pct: 98 }, { day: 'Tue', pct: 102 }, { day: 'Wed', pct: 95 },
  { day: 'Thu', pct: 88 }, { day: 'Fri', pct: 105 }, { day: 'Sat', pct: 92 }, { day: 'Sun', pct: 97 },
];

const lifestyleData = {
  sleep: { avg: 7.2, quality: 'Good', trend: 'Improving' },
  stress: { level: 'Moderate', score: 5, trend: 'Stable' },
  activity: 'Moderately Active',
  occupation: 'Marketing Manager, 8hrs/day desk',
  injuries: 'None current',
};

const sleep7Day = [
  { day: 'Mon', hours: 7.5, quality: 8 }, { day: 'Tue', hours: 6.8, quality: 7 },
  { day: 'Wed', hours: 7.2, quality: 8 }, { day: 'Thu', hours: 7.0, quality: 6 },
  { day: 'Fri', hours: 6.5, quality: 7 }, { day: 'Sat', hours: 8.0, quality: 9 },
  { day: 'Sun', hours: 7.8, quality: 9 },
];

const habits = [
  { name: 'Sleep 8h', week: [true, false, true, true, false, true, true] },
  { name: 'Protein Target', week: [true, true, true, false, true, true, false] },
  { name: 'Water 2.5L', week: [true, true, false, true, true, false, true] },
  { name: 'Steps 10k', week: [false, true, true, true, false, true, true] },
  { name: 'Stretch/Mobility', week: [true, true, true, true, true, false, false] },
];

const exerciseDb = [
  { name: 'Back Squat', muscle: 'Quadriceps', equipment: 'Barbell', timesDone: 42, maxWeight: 85, lastDate: '25/11/2025' },
  { name: 'Deadlift', muscle: 'Posterior Chain', equipment: 'Barbell', timesDone: 38, maxWeight: 110, lastDate: '23/11/2025' },
  { name: 'Bench Press', muscle: 'Chest', equipment: 'Barbell', timesDone: 40, maxWeight: 55, lastDate: '25/11/2025' },
  { name: 'Overhead Press', muscle: 'Shoulders', equipment: 'Barbell', timesDone: 35, maxWeight: 35, lastDate: '23/11/2025' },
  { name: 'Barbell Row', muscle: 'Back', equipment: 'Barbell', timesDone: 36, maxWeight: 50, lastDate: '21/11/2025' },
  { name: 'Hip Thrust', muscle: 'Glutes', equipment: 'Barbell', timesDone: 30, maxWeight: 100, lastDate: '19/11/2025' },
  { name: 'Romanian Deadlift', muscle: 'Hamstrings', equipment: 'Barbell', timesDone: 28, maxWeight: 70, lastDate: '25/11/2025' },
  { name: 'Lat Pulldown', muscle: 'Back', equipment: 'Cable', timesDone: 32, maxWeight: 55, lastDate: '23/11/2025' },
  { name: 'Leg Press', muscle: 'Quadriceps', equipment: 'Machine', timesDone: 25, maxWeight: 140, lastDate: '21/11/2025' },
  { name: 'Dumbbell Lunges', muscle: 'Quadriceps', equipment: 'Dumbbell', timesDone: 22, maxWeight: 20, lastDate: '19/11/2025' },
];

const muscleDistribution = [
  { name: 'Quadriceps', value: 22 }, { name: 'Back', value: 18 },
  { name: 'Chest', value: 15 }, { name: 'Shoulders', value: 12 },
  { name: 'Glutes', value: 10 }, { name: 'Hamstrings', value: 8 },
  { name: 'Arms', value: 8 }, { name: 'Core', value: 7 },
];

const goalsData = [
  { id: '1', title: 'Reach 16% body fat', category: 'Body Composition', target: '16%', current: '18.2%', start: '24%', deadline: '31/01/2026', daysLeft: 67, status: 'On Track' as const, progress: 72 },
  { id: '2', title: 'Back Squat 100kg x1', category: 'Strength', target: '100 kg', current: '85 kg', start: '60 kg', deadline: '28/02/2026', daysLeft: 95, status: 'On Track' as const, progress: 62 },
  { id: '3', title: 'Deadlift 130kg x1', category: 'Strength', target: '130 kg', current: '110 kg', start: '80 kg', deadline: '28/02/2026', daysLeft: 95, status: 'On Track' as const, progress: 60 },
  { id: '4', title: '4 sessions per week', category: 'Habit', target: '4/week', current: '3.8/week', start: '2/week', deadline: 'Ongoing', daysLeft: null, status: 'On Track' as const, progress: 95 },
  { id: '5', title: 'Sleep 7.5+ hrs avg', category: 'Lifestyle', target: '7.5h', current: '7.2h', start: '6.0h', deadline: '31/12/2025', daysLeft: 36, status: 'At Risk' as const, progress: 80 },
];

const completedGoals = [
  { title: 'Lose 5kg bodyweight', achieved: '15/10/2025', duration: '4 months', result: '-5.2 kg' },
  { title: 'First pull-up unassisted', achieved: '01/09/2025', duration: '3 months', result: '3 reps' },
  { title: 'Bench Press 50kg', achieved: '20/08/2025', duration: '2 months', result: '55 kg current' },
];

const milestones = [
  { date: '15/06/2024', title: 'Joined AzFIT', type: 'start' },
  { date: '15/10/2025', title: 'Lost 5kg', type: 'weight' },
  { date: '01/09/2025', title: 'First pull-up', type: 'strength' },
  { date: '20/08/2025', title: 'BP 50kg milestone', type: 'strength' },
  { date: '01/11/2025', title: 'Phase 2 complete', type: 'program' },
];

const progressPhotos: ProgressPhoto[] = [
  { id: '1', clientId: '1', url: '/avatar-placeholder.jpg', thumbnailUrl: '/avatar-placeholder.jpg', date: '15/06/2024', category: 'Front', notes: 'Starting point', weight: 68.0, bodyFatPercentage: 24.0, trainerNotes: 'Baseline photo. Good posture.', isMilestone: true, isGoalAchieved: false, createdAt: '2024-06-15', updatedAt: '2024-06-15' },
  { id: '2', clientId: '1', url: '/avatar-placeholder.jpg', thumbnailUrl: '/avatar-placeholder.jpg', date: '15/07/2024', category: 'Front', notes: '1 month progress', weight: 65.8, bodyFatPercentage: 22.5, trainerNotes: 'Visible waist reduction.', isMilestone: false, isGoalAchieved: false, createdAt: '2024-07-15', updatedAt: '2024-07-15' },
  { id: '3', clientId: '1', url: '/avatar-placeholder.jpg', thumbnailUrl: '/avatar-placeholder.jpg', date: '15/08/2024', category: 'Side', notes: '2 month check-in', weight: 64.2, bodyFatPercentage: 21.2, trainerNotes: 'Core engagement improved.', isMilestone: false, isGoalAchieved: false, createdAt: '2024-08-15', updatedAt: '2024-08-15' },
  { id: '4', clientId: '1', url: '/avatar-placeholder.jpg', thumbnailUrl: '/avatar-placeholder.jpg', date: '15/09/2024', category: 'Back', notes: 'Back progress', weight: 62.8, bodyFatPercentage: 20.1, trainerNotes: 'Back definition showing.', isMilestone: false, isGoalAchieved: false, createdAt: '2024-09-15', updatedAt: '2024-09-15' },
  { id: '5', clientId: '1', url: '/avatar-placeholder.jpg', thumbnailUrl: '/avatar-placeholder.jpg', date: '15/10/2024', category: 'Front', notes: '5kg down milestone!', weight: 62.8, bodyFatPercentage: 19.5, trainerNotes: 'Excellent progress. Keep calories consistent.', isMilestone: true, isGoalAchieved: true, createdAt: '2024-10-15', updatedAt: '2024-10-15' },
  { id: '6', clientId: '1', url: '/avatar-placeholder.jpg', thumbnailUrl: '/avatar-placeholder.jpg', date: '15/11/2024', category: 'Side', notes: 'Latest check-in', weight: 58.5, bodyFatPercentage: 18.2, trainerNotes: 'Approaching goal body fat. Maintain strength.', isMilestone: false, isGoalAchieved: false, createdAt: '2024-11-15', updatedAt: '2024-11-15' },
];

const activityFeed = [
  { icon: CheckCircle2, text: 'Completed Lower Body Power session', time: '2 hours ago', color: '#22C55E' },
  { icon: Scale, text: 'Logged weight: 58.5 kg', time: 'Yesterday', color: '#00AEEF' },
  { icon: Camera, text: 'Uploaded progress photo (Side)', time: '2 days ago', color: '#8B5CF6' },
  { icon: StickyNote, text: 'Trainer added note: Form Check — Deadlift', time: '3 days ago', color: '#EAB308' },
  { icon: Trophy, text: 'Achieved new PR: Back Squat 85kg x5', time: '1 week ago', color: '#F97316' },
];

const COLORS = ['#00AEEF', '#8B5CF6', '#22C55E', '#F97316', '#EC4899', '#EAB308', '#EF4444', '#C0C0C0'];

/* ═══════════════════════════════════════════
   TABS CONFIG
   ═══════════════════════════════════════════ */

const tabsConfig = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'bioprint', label: 'BioPrint', icon: Scan },
  { key: 'bodystats', label: 'BodyStats', icon: Scale },
  { key: 'records', label: 'Records', icon: FileText },
  { key: 'notes', label: 'Notes', icon: StickyNote },
  { key: 'sessions', label: 'Sessions', icon: Calendar },
  { key: 'calendar', label: 'Calendar', icon: CalendarDays },
  { key: 'programs', label: 'Programs', icon: ClipboardList },
  { key: 'diet', label: 'Diet/Nutrition', icon: Apple },
  { key: 'lifestyle', label: 'Lifestyle', icon: Heart },
  { key: 'database', label: 'Database', icon: Database },
  { key: 'goals', label: 'Goals', icon: Target },
  { key: 'photos', label: 'Progress Photos', icon: Camera },
] as const;

type TabKey = (typeof tabsConfig)[number]['key'];

/* ═══════════════════════════════════════════
   SHARED COMPONENTS
   ═══════════════════════════════════════════ */

function ChangePill({ value, inverse = false, unit }: { value: number; inverse?: boolean; unit?: string }) {
  const isPositive = value > 0;
  const isGood = inverse ? !isPositive : isPositive;
  const label = value > 0 ? `+${value}${unit || ''}` : `${value}${unit || ''}`;
  if (value === 0) return <span className="text-xs font-semibold text-[#6B6B6B] bg-[rgba(107,107,107,0.1)] px-2 py-0.5 rounded-full">0</span>;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full ${isGood ? 'text-[#22C55E] bg-[rgba(34,197,94,0.1)]' : 'text-[#EF4444] bg-[rgba(239,68,68,0.1)]'}`}>
      {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
      {label}
    </span>
  );
}

function KpiCard({ label, value, unit, change, icon: Icon, inverse }: {
  label: string; value: string | number; unit?: string; change?: number; icon: React.ComponentType<{ size?: number; className?: string }>; inverse?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-[rgba(0,174,239,0.08)] to-[rgba(139,92,246,0.04)] bg-[#141414] border border-[#2A2A2A] rounded-xl p-5 hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(0,174,239,0.1)] transition-all duration-200"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-lg bg-[rgba(0,174,239,0.15)] flex items-center justify-center">
          <Icon size={18} className="text-[#00AEEF]" />
        </div>
        <span className="text-xs text-[#A0A0A0] font-medium">{label}</span>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold text-[#F0F0F0] font-[family-name:var(--font-space-mono)]">{value}</span>
        {unit && <span className="text-sm text-[#A0A0A0] mb-1">{unit}</span>}
      </div>
      {change !== undefined && <div className="mt-2"><ChangePill value={change} inverse={inverse} /></div>}
    </motion.div>
  );
}

function SectionCard({ title, children, className = '' }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-[#141414] border border-[#2A2A2A] rounded-xl p-5 ${className}`}>
      <h3 className="text-base font-semibold text-[#F0F0F0] mb-4">{title}</h3>
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════
   TAB 1 — DASHBOARD
   ═══════════════════════════════════════════ */

function DashboardTab() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
      {/* Left Column */}
      <div className="lg:col-span-3 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <KpiCard label="Current Weight" value={client.weight} unit="kg" change={-0.5} icon={Scale} inverse />
          <KpiCard label="Body Fat %" value={client.bodyFat} unit="%" change={-1.2} icon={Activity} inverse />
          <KpiCard label="Sessions" value={client.sessions} unit="total" change={3} icon={Dumbbell} />
        </div>

        <SectionCard title="Weight Trend (30 Days)">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weightData30d}>
                <defs>
                  <linearGradient id="wtGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00AEEF" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#00AEEF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="day" tick={{ fill: '#6B6B6B', fontSize: 11 }} interval={4} />
                <YAxis domain={['dataMin - 1', 'dataMax + 1']} tick={{ fill: '#6B6B6B', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#141414', border: '1px solid #2A2A2A', borderRadius: 8, color: '#F0F0F0' }} />
                <Area type="monotone" dataKey="weight" stroke="#00AEEF" strokeWidth={2} fill="url(#wtGrad)" />
                <ReferenceLine y={client.goalWeight} stroke="#22C55E" strokeDasharray="4 4" label={{ value: 'Goal', fill: '#22C55E', fontSize: 11 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Recent Activity">
          <div className="space-y-3">
            {activityFeed.map((item, i) => (
              <motion.div
                key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#242424] transition-colors"
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${item.color}15` }}>
                  <item.icon size={16} style={{ color: item.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#F0F0F0] truncate">{item.text}</p>
                  <p className="text-xs text-[#6B6B6B]">{item.time}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Right Column */}
      <div className="lg:col-span-2 space-y-5">
        <SectionCard title="Weight Journey">
          <div className="flex items-center justify-between text-center">
            <div>
              <p className="text-xs text-[#6B6B6B] mb-1">Start</p>
              <p className="text-lg font-bold text-[#F0F0F0] font-mono">{client.startWeight}</p>
              <p className="text-xs text-[#A0A0A0]">kg</p>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <div className="h-0.5 bg-gradient-to-r from-[#EF4444] via-[#EAB308] to-[#22C55E] flex-1 mx-3 rounded-full" />
              <TrendingDown size={16} className="text-[#22C55E] flex-shrink-0" />
            </div>
            <div>
              <p className="text-xs text-[#6B6B6B] mb-1">Current</p>
              <p className="text-lg font-bold text-[#00AEEF] font-mono">{client.weight}</p>
              <p className="text-xs text-[#A0A0A0]">kg</p>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <div className="h-0.5 bg-gradient-to-r from-[#22C55E] to-[#00AEEF] flex-1 mx-3 rounded-full" />
              <Target size={16} className="text-[#00AEEF] flex-shrink-0" />
            </div>
            <div>
              <p className="text-xs text-[#6B6B6B] mb-1">Goal</p>
              <p className="text-lg font-bold text-[#22C55E] font-mono">{client.goalWeight}</p>
              <p className="text-xs text-[#A0A0A0]">kg</p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-[#2A2A2A]">
            <p className="text-xs text-[#6B6B6B]">Total lost: <span className="text-[#22C55E] font-semibold">{(client.startWeight - client.weight).toFixed(1)} kg</span></p>
          </div>
        </SectionCard>

        <SectionCard title="Quick Stats">
          <div className="space-y-3">
            {[
              { label: 'Days as Client', value: '164 days' },
              { label: 'Current Program', value: client.program },
              { label: 'Program Phase', value: client.programPhase },
              { label: 'Next Session', value: '27/11/2025 09:00' },
            ].map((s) => (
              <div key={s.label} className="flex items-center justify-between py-2 border-b border-[#1F1F1F] last:border-0">
                <span className="text-sm text-[#A0A0A0]">{s.label}</span>
                <span className="text-sm text-[#F0F0F0] font-medium text-right">{s.value}</span>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Upcoming Sessions">
          <div className="space-y-2">
            {calendarSessions.slice(0, 3).map((s, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-[#1A1A1A]">
                <div className="w-10 h-10 rounded-lg bg-[rgba(0,174,239,0.15)] flex items-center justify-center flex-shrink-0">
                  <Calendar size={18} className="text-[#00AEEF]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#F0F0F0] font-medium truncate">{s.type}</p>
                  <p className="text-xs text-[#6B6B6B]">{s.date} · {s.time}</p>
                </div>
                <span className="text-xs text-[#A0A0A0] font-mono">{s.duration}m</span>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Latest Notes">
          <div className="space-y-2">
            {notesData.slice(0, 2).map((n) => (
              <div key={n.id} className="p-3 rounded-lg bg-[#1A1A1A] border border-[#2A2A2A]">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-[#00AEEF]">{n.category}</span>
                  <span className="text-xs text-[#6B6B6B]">{n.date}</span>
                </div>
                <p className="text-sm text-[#F0F0F0] font-medium">{n.title}</p>
                <p className="text-xs text-[#A0A0A0] line-clamp-2 mt-1">{n.content}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   TAB 2 — BIOPRINT
   ═══════════════════════════════════════════ */

function BioPrintTab() {
  const bodyFatPct = 18.2;
  const circumference = 2 * Math.PI * 50;
  const offset = circumference - (bodyFatPct / 40) * circumference;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[#F0F0F0]">BioPrint Assessment</h2>
          <p className="text-sm text-[#6B6B6B]">Last assessment: 15/11/2025 · Jackson-Pollock 7-site method</p>
        </div>
        <button className="flex items-center gap-2 bg-[#00AEEF] hover:bg-[#009BD6] text-white font-medium px-4 py-2 rounded-lg text-sm transition-all hover:scale-[1.02]">
          <Plus size={16} /> New Assessment
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <SectionCard title="Skinfold Measurements (mm)">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#2A2A2A]">
                  {['Site', 'Current', 'Previous', 'Change', 'Goal'].map((h) => (
                    <th key={h} className="text-left text-xs text-[#6B6B6B] font-semibold uppercase py-2 px-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {skinfoldData.map((row) => (
                  <tr key={row.site} className="border-b border-[#1F1F1F] hover:bg-[#1A1A1A] transition-colors">
                    <td className="py-2.5 px-3 text-sm text-[#F0F0F0]">{row.site}</td>
                    <td className="py-2.5 px-3 text-sm text-[#F0F0F0] font-mono">{row.current}</td>
                    <td className="py-2.5 px-3 text-sm text-[#A0A0A0] font-mono">{row.previous}</td>
                    <td className="py-2.5 px-3">
                      <ChangePill value={row.change} inverse />
                    </td>
                    <td className="py-2.5 px-3 text-sm text-[#22C55E] font-mono">{row.goal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <div className="space-y-5">
          <SectionCard title="Body Composition Summary">
            <div className="flex items-center gap-6">
              <div className="relative w-32 h-32 flex-shrink-0">
                <svg width="128" height="128" viewBox="0 0 128 128">
                  <circle cx="64" cy="64" r="50" fill="none" stroke="#2A2A2A" strokeWidth="8" />
                  <circle cx="64" cy="64" r="50" fill="none" stroke="#00AEEF" strokeWidth="8"
                    strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
                    transform="rotate(-90 64 64)"
                    style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                  />
                  <text x="64" y="60" textAnchor="middle" fill="#F0F0F0" fontSize="22" fontWeight="700">{bodyFatPct}%</text>
                  <text x="64" y="78" textAnchor="middle" fill="#A0A0A0" fontSize="11">Body Fat</text>
                </svg>
              </div>
              <div className="space-y-3 flex-1">
                <div>
                  <p className="text-xs text-[#6B6B6B]">Total Body Fat</p>
                  <p className="text-xl font-bold text-[#F0F0F0] font-mono">10.6 kg</p>
                </div>
                <div>
                  <p className="text-xs text-[#6B6B6B]">Lean Mass</p>
                  <p className="text-xl font-bold text-[#F0F0F0] font-mono">47.9 kg</p>
                </div>
                <div>
                  <p className="text-xs text-[#6B6B6B]">Method</p>
                  <p className="text-sm text-[#A0A0A0]">Jackson-Pollock 7-site</p>
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Body Fat % History">
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={bodyFatData6m}>
                  <defs>
                    <linearGradient id="bfGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00AEEF" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#00AEEF" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="month" tick={{ fill: '#6B6B6B', fontSize: 12 }} />
                  <YAxis domain={[12, 26]} tick={{ fill: '#6B6B6B', fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: '#141414', border: '1px solid #2A2A2A', borderRadius: 8, color: '#F0F0F0' }} />
                  <Area type="monotone" dataKey="bf" stroke="#00AEEF" strokeWidth={2} fill="url(#bfGrad)" />
                  <ReferenceLine y={16} stroke="#22C55E" strokeDasharray="4 4" label={{ value: 'Goal 16%', fill: '#22C55E', fontSize: 11 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   TAB 3 — BODYSTATS
   ═══════════════════════════════════════════ */

function BodyStatsTab() {
  const [range, setRange] = useState<'30d' | '90d'>('90d');
  const data = range === '30d' ? weightData30d : weightData90d;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-lg font-semibold text-[#F0F0F0]">Body Statistics</h2>
        <div className="flex gap-1 bg-[#1A1A1A] rounded-lg p-1">
          {(['30d', '90d'] as const).map((r) => (
            <button key={r} onClick={() => setRange(r)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${range === r ? 'bg-[#242424] text-[#00AEEF]' : 'text-[#A0A0A0] hover:text-[#F0F0F0]'}`}>
              {r === '30d' ? '30 Days' : '90 Days'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Current Weight" value={58.5} unit="kg" change={-2.3} icon={Scale} inverse />
        <KpiCard label="Body Fat %" value={18.2} unit="%" change={-1.5} icon={Activity} inverse />
        <KpiCard label="BMI" value={21.4} unit="" change={-0.8} icon={Heart} inverse />
        <KpiCard label="Lean Body Mass" value={47.9} unit="kg" change={0.8} icon={Dumbbell} />
      </div>

      <SectionCard title="Weight History">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="wsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00AEEF" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#00AEEF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="day" tick={{ fill: '#6B6B6B', fontSize: 10 }} interval={range === '90d' ? 9 : 4} />
              <YAxis domain={['dataMin - 1', 'dataMax + 1']} tick={{ fill: '#6B6B6B', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#141414', border: '1px solid #2A2A2A', borderRadius: 8, color: '#F0F0F0' }} />
              <Area type="monotone" dataKey="weight" stroke="#00AEEF" strokeWidth={2} fill="url(#wsGrad)" />
              <ReferenceLine y={client.goalWeight} stroke="#22C55E" strokeDasharray="4 4" label={{ value: 'Goal 55kg', fill: '#22C55E', fontSize: 11 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </SectionCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <SectionCard title="Body Fat % Trend">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="bfsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="day" tick={{ fill: '#6B6B6B', fontSize: 10 }} interval={range === '90d' ? 9 : 4} />
                <YAxis domain={['dataMin - 1', 'dataMax + 1']} tick={{ fill: '#6B6B6B', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#141414', border: '1px solid #2A2A2A', borderRadius: 8, color: '#F0F0F0' }} />
                <Area type="monotone" dataKey="bodyFat" stroke="#8B5CF6" strokeWidth={2} fill="url(#bfsGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Measurements (cm)">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#2A2A2A]">
                  {['Measurement', 'Current', '30d Ago', 'Change'].map((h) => (
                    <th key={h} className="text-left text-xs text-[#6B6B6B] font-semibold uppercase py-2 px-2">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {measurements.map((m) => (
                  <tr key={m.name} className="border-b border-[#1F1F1F] hover:bg-[#1A1A1A] transition-colors">
                    <td className="py-2 px-2 text-sm text-[#F0F0F0]">{m.name}</td>
                    <td className="py-2 px-2 text-sm text-[#F0F0F0] font-mono">{m.current}</td>
                    <td className="py-2 px-2 text-sm text-[#A0A0A0] font-mono">{m.prev30d}</td>
                    <td className="py-2 px-2"><ChangePill value={+m.change.toFixed(1)} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   TAB 4 — RECORDS
   ═══════════════════════════════════════════ */

function RecordsTab() {
  const [filter, setFilter] = useState<'all' | 'prs' | 'recent'>('all');

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-lg font-semibold text-[#F0F0F0]">Exercise Records</h2>
        <div className="flex gap-1 bg-[#1A1A1A] rounded-lg p-1">
          {([
            { key: 'all' as const, label: 'All Records' },
            { key: 'prs' as const, label: 'Personal Records' },
            { key: 'recent' as const, label: 'Recent' },
          ]).map((f) => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${filter === f.key ? 'bg-[#242424] text-[#00AEEF]' : 'text-[#A0A0A0] hover:text-[#F0F0F0]'}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {prData.map((pr, i) => (
          <motion.div
            key={pr.exercise} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-gradient-to-br from-[rgba(234,179,8,0.08)] to-[rgba(249,115,22,0.04)] bg-[#141414] border border-[#2A2A2A] rounded-xl p-5 relative overflow-hidden hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(234,179,8,0.1)] transition-all duration-200"
          >
            <div className="absolute top-3 right-3">
              <Trophy size={20} className="text-[#EAB308]" />
            </div>
            <p className="text-sm text-[#A0A0A0] mb-1">{pr.exercise}</p>
            <p className="text-2xl font-bold text-[#F0F0F0] font-mono">{pr.weight} <span className="text-sm text-[#A0A0A0]">kg</span></p>
            <p className="text-xs text-[#6B6B6B] mt-1">{pr.reps} reps · {pr.date}</p>
            <div className="mt-3 pt-3 border-t border-[#2A2A2A] flex items-center justify-between">
              <span className="text-xs text-[#6B6B6B]">Previous: {pr.previous}kg</span>
              <ChangePill value={+((pr.weight - pr.previous)).toFixed(1)} />
            </div>
          </motion.div>
        ))}
      </div>

      <SectionCard title="1RM Estimates (Epley Formula)">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2A2A2A]">
                {['Exercise', 'Estimated 1RM', 'Weight Used', 'Reps'].map((h) => (
                  <th key={h} className="text-left text-xs text-[#6B6B6B] font-semibold uppercase py-2 px-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rmEstimates.map((rm) => (
                <tr key={rm.exercise} className="border-b border-[#1F1F1F] hover:bg-[#1A1A1A] transition-colors">
                  <td className="py-2.5 px-3 text-sm text-[#F0F0F0] font-medium">{rm.exercise}</td>
                  <td className="py-2.5 px-3 text-sm text-[#F0F0F0] font-mono font-bold">{rm.weight1RM} kg</td>
                  <td className="py-2.5 px-3 text-sm text-[#A0A0A0] font-mono">
                    {rm.exercise === 'Back Squat' ? '85' : rm.exercise === 'Deadlift' ? '110' : rm.exercise === 'Bench Press' ? '55' : '35'} kg
                  </td>
                  <td className="py-2.5 px-3 text-sm text-[#A0A0A0] font-mono">
                    {rm.exercise === 'Back Squat' ? '5' : rm.exercise === 'Deadlift' ? '3' : rm.exercise === 'Bench Press' ? '6' : '8'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <SectionCard title="Recent Lifts">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2A2A2A]">
                {['Date', 'Exercise', 'Weight', 'Reps', 'Sets', 'RPE'].map((h) => (
                  <th key={h} className="text-left text-xs text-[#6B6B6B] font-semibold uppercase py-2 px-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { date: '25/11', exercise: 'Back Squat', weight: 85, reps: 5, sets: 3, rpe: 8 },
                { date: '25/11', exercise: 'Romanian Deadlift', weight: 70, reps: 8, sets: 3, rpe: 7 },
                { date: '23/11', exercise: 'Bench Press', weight: 55, reps: 6, sets: 4, rpe: 8 },
                { date: '23/11', exercise: 'Overhead Press', weight: 35, reps: 8, sets: 3, rpe: 7 },
                { date: '21/11', exercise: 'Barbell Row', weight: 50, reps: 8, sets: 4, rpe: 8 },
                { date: '21/11', exercise: 'Lat Pulldown', weight: 55, reps: 10, sets: 3, rpe: 7 },
              ].map((lift, i) => (
                <tr key={i} className="border-b border-[#1F1F1F] hover:bg-[#1A1A1A] transition-colors">
                  <td className="py-2.5 px-3 text-sm text-[#A0A0A0] font-mono">{lift.date}</td>
                  <td className="py-2.5 px-3 text-sm text-[#F0F0F0]">{lift.exercise}</td>
                  <td className="py-2.5 px-3 text-sm text-[#F0F0F0] font-mono font-semibold">{lift.weight}kg</td>
                  <td className="py-2.5 px-3 text-sm text-[#A0A0A0] font-mono">{lift.reps}</td>
                  <td className="py-2.5 px-3 text-sm text-[#A0A0A0] font-mono">{lift.sets}</td>
                  <td className="py-2.5 px-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${lift.rpe >= 9 ? 'text-[#EF4444] bg-[rgba(239,68,68,0.1)]' : lift.rpe >= 7 ? 'text-[#EAB308] bg-[rgba(234,179,8,0.1)]' : 'text-[#22C55E] bg-[rgba(34,197,94,0.1)]'}`}>
                      {lift.rpe}/10
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}


/* ═══════════════════════════════════════════
   TAB 5 — NOTES
   ═══════════════════════════════════════════ */

function NotesTab() {
  const [selected, setSelected] = useState(notesData[0]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'All' | 'Trainer' | 'Client' | 'Important'>('All');
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('General');

  const filtered = notesData.filter((n) => {
    const matchSearch = n.title.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'All' ? true : filter === 'Important' ? n.important : n.author === filter;
    return matchSearch && matchFilter;
  });

  const handleSave = () => {
    if (newTitle.trim() && newContent.trim()) {
      setIsAdding(false);
      setNewTitle('');
      setNewContent('');
      setNewCategory('General');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 h-[calc(100vh-280px)] min-h-[500px]">
      {/* Left — Note List */}
      <div className="bg-[#141414] border border-[#2A2A2A] rounded-xl flex flex-col overflow-hidden">
        <div className="p-4 border-b border-[#2A2A2A] space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center bg-[#1A1A1A] rounded-lg border border-[#2A2A2A] px-3">
              <Search size={14} className="text-[#6B6B6B] flex-shrink-0" />
              <input
                type="text" placeholder="Search notes..." value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 bg-transparent text-sm text-[#F0F0F0] placeholder-[#6B6B6B] py-2 px-2 outline-none"
              />
            </div>
            <button onClick={() => setIsAdding(true)} className="w-8 h-8 rounded-lg bg-[#00AEEF] hover:bg-[#009BD6] flex items-center justify-center text-white transition-colors flex-shrink-0">
              <Plus size={16} />
            </button>
          </div>
          <div className="flex gap-1">
            {(['All', 'Trainer', 'Client', 'Important'] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${filter === f ? 'bg-[#242424] text-[#00AEEF]' : 'text-[#6B6B6B] hover:text-[#A0A0A0]'}`}>
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filtered.map((note) => (
            <button
              key={note.id} onClick={() => { setSelected(note); setIsAdding(false); }}
              className={`w-full text-left p-3 rounded-lg transition-all ${selected.id === note.id && !isAdding ? 'bg-[rgba(0,174,239,0.15)] border border-[rgba(0,174,239,0.3)]' : 'bg-[#1A1A1A] border border-[#1F1F1F] hover:bg-[#242424]'}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-[#00AEEF]">{note.category}</span>
                {note.important && <span className="text-[#EAB308]">★</span>}
              </div>
              <p className="text-sm text-[#F0F0F0] font-medium truncate">{note.title}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs px-1.5 py-0.5 rounded ${note.author === 'Trainer' ? 'bg-[rgba(0,174,239,0.1)] text-[#00AEEF]' : 'bg-[rgba(139,92,246,0.1)] text-[#8B5CF6]'}`}>{note.author}</span>
                <span className="text-xs text-[#6B6B6B]">{note.date}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right — Note Viewer/Editor */}
      <div className="lg:col-span-2 bg-[#141414] border border-[#2A2A2A] rounded-xl p-5 overflow-y-auto">
        {isAdding ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-[#F0F0F0]">Add New Note</h3>
              <button onClick={() => setIsAdding(false)} className="text-[#6B6B6B] hover:text-[#F0F0F0]"><X size={18} /></button>
            </div>
            <div>
              <label className="text-xs text-[#A0A0A0] mb-1 block">Category</label>
              <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2 text-sm text-[#F0F0F0] outline-none focus:border-[#00AEEF]">
                {['General', 'Form Check', 'Nutrition', 'Goals', 'Progress'].map((c) => (<option key={c} value={c}>{c}</option>))}
              </select>
            </div>
            <div>
              <label className="text-xs text-[#A0A0A0] mb-1 block">Title</label>
              <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Note title..."
                className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2 text-sm text-[#F0F0F0] placeholder-[#6B6B6B] outline-none focus:border-[#00AEEF]" />
            </div>
            <div>
              <label className="text-xs text-[#A0A0A0] mb-1 block">Content</label>
              <textarea value={newContent} onChange={(e) => setNewContent(e.target.value)} placeholder="Write your note here..." rows={12}
                className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2 text-sm text-[#F0F0F0] placeholder-[#6B6B6B] outline-none focus:border-[#00AEEF] resize-none" />
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setIsAdding(false)} className="px-4 py-2 rounded-lg text-sm text-[#A0A0A0] hover:bg-[#242424] transition-colors">Cancel</button>
              <button onClick={handleSave} className="px-4 py-2 rounded-lg text-sm bg-[#00AEEF] hover:bg-[#009BD6] text-white font-medium transition-colors flex items-center gap-2">
                <Save size={14} /> Save Note
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-[#00AEEF] bg-[rgba(0,174,239,0.1)] px-2 py-0.5 rounded">{selected.category}</span>
                  {selected.important && <span className="text-xs text-[#EAB308] font-semibold">Important</span>}
                </div>
                <h3 className="text-lg font-semibold text-[#F0F0F0]">{selected.title}</h3>
              </div>
              <button className="text-[#6B6B6B] hover:text-[#00AEEF] transition-colors"><Edit3 size={16} /></button>
            </div>
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[#2A2A2A]">
              <span className={`text-xs px-2 py-0.5 rounded-full ${selected.author === 'Trainer' ? 'bg-[rgba(0,174,239,0.1)] text-[#00AEEF]' : 'bg-[rgba(139,92,246,0.1)] text-[#8B5CF6]'}`}>{selected.author}</span>
              <span className="text-xs text-[#6B6B6B]">{selected.date}</span>
            </div>
            <p className="text-sm text-[#F0F0F0] leading-relaxed whitespace-pre-line">{selected.content}</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   TAB 6 — SESSIONS
   ═══════════════════════════════════════════ */

function SessionsTab() {
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [monthFilter, setMonthFilter] = useState('All');

  const completed = sessionsData.filter((s) => s.status === 'Completed').length;
  const noShow = sessionsData.filter((s) => s.status === 'No-show').length;
  const avgDuration = Math.round(sessionsData.reduce((a, s) => a + s.duration, 0) / sessionsData.length);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-lg font-semibold text-[#F0F0F0]">Session History</h2>
        <div className="flex gap-1 bg-[#1A1A1A] rounded-lg p-1">
          {([
            { key: 'list' as const, label: 'List View' },
            { key: 'calendar' as const, label: 'Calendar View' },
          ]).map((v) => (
            <button key={v.key} onClick={() => setView(v.key)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${view === v.key ? 'bg-[#242424] text-[#00AEEF]' : 'text-[#A0A0A0] hover:text-[#F0F0F0]'}`}>
              {v.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total Sessions" value={sessionsData.length} icon={Calendar} />
        <KpiCard label="Completed" value={completed} icon={CheckCircle2} />
        <KpiCard label="No-shows" value={noShow} icon={XCircle} inverse />
        <KpiCard label="Avg Duration" value={`${avgDuration}m`} icon={Clock} />
      </div>

      {view === 'list' ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-[#6B6B6B]" />
            <span className="text-xs text-[#6B6B6B]">Filter:</span>
            {['All', 'November', 'October'].map((m) => (
              <button key={m} onClick={() => setMonthFilter(m)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${monthFilter === m ? 'bg-[#242424] text-[#00AEEF]' : 'text-[#6B6B6B] hover:text-[#A0A0A0]'}`}>
                {m}
              </button>
            ))}
          </div>
          <div className="space-y-2">
            {sessionsData.map((s, i) => (
              <motion.div
                key={s.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-4 flex items-center gap-4 hover:bg-[#1A1A1A] transition-colors"
              >
                <div className="flex-shrink-0 w-14 text-center">
                  <p className="text-xs text-[#6B6B6B] font-mono">{s.date.split('/')[0]}/{s.date.split('/')[1]}</p>
                  <p className="text-xs text-[#A0A0A0] font-mono">{s.time}</p>
                </div>
                <div className="w-px h-10 bg-[#2A2A2A] flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-[#F0F0F0] font-medium truncate">{s.type}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${s.status === 'Completed' ? 'text-[#22C55E] bg-[rgba(34,197,94,0.1)]' : s.status === 'No-show' ? 'text-[#EF4444] bg-[rgba(239,68,68,0.1)]' : 'text-[#EAB308] bg-[rgba(234,179,8,0.1)]'}`}>
                      {s.status}
                    </span>
                  </div>
                  <p className="text-xs text-[#6B6B6B]">{s.exercises} exercises · {s.duration} min{s.notes && ' · Has notes'}</p>
                </div>
                <ChevronRight size={16} className="text-[#6B6B6B] flex-shrink-0" />
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        <CalendarView />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   TAB 7 — CALENDAR (Mini)
   ═══════════════════════════════════════════ */

function CalendarView() {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const sessionDates = new Set(calendarSessions.map((s) => s.date));
  const isToday = (d: number) => d === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
  const hasSession = (d: number) => sessionDates.has(`${String(d).padStart(2, '0')}/${String(currentMonth + 1).padStart(2, '0')}/${currentYear}`);

  return (
    <div className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => { if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1); } else setCurrentMonth(currentMonth - 1); }}
          className="w-8 h-8 rounded-lg bg-[#1A1A1A] hover:bg-[#242424] flex items-center justify-center text-[#A0A0A0] transition-colors">
          <ChevronLeft size={16} />
        </button>
        <h3 className="text-base font-semibold text-[#F0F0F0]">{monthNames[currentMonth]} {currentYear}</h3>
        <button onClick={() => { if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1); } else setCurrentMonth(currentMonth + 1); }}
          className="w-8 h-8 rounded-lg bg-[#1A1A1A] hover:bg-[#242424] flex items-center justify-center text-[#A0A0A0] transition-colors">
          <ChevronRight size={16} />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {dayNames.map((d) => (<div key={d} className="text-center text-xs text-[#6B6B6B] font-semibold py-2">{d}</div>))}
        {Array.from({ length: adjustedFirstDay }, (_, i) => (<div key={`empty-${i}`} />))}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const d = i + 1;
          const t = isToday(d);
          const s = hasSession(d);
          const cls = t
            ? 'bg-[rgba(0,174,239,0.15)] text-[#00AEEF] border border-[#00AEEF]'
            : s
              ? 'bg-[#1A1A1A] text-[#F0F0F0] hover:bg-[#242424]'
              : 'text-[#A0A0A0] hover:bg-[#1A1A1A]';
          return (
            <div key={d} className={'aspect-square rounded-lg flex flex-col items-center justify-center relative text-sm font-medium transition-colors cursor-pointer ' + cls}>
              {d}
              {s && <div className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-[#00AEEF]" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   TAB 8 — PROGRAMS
   ═══════════════════════════════════════════ */

function ProgramsTab() {
  const p = programData.current;
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[#F0F0F0]">Programs</h2>
        <button className="flex items-center gap-2 bg-[#00AEEF] hover:bg-[#009BD6] text-white font-medium px-4 py-2 rounded-lg text-sm transition-all hover:scale-[1.02]">
          <Plus size={16} /> Assign New
        </button>
      </div>

      {/* Active Program */}
      <div className="bg-gradient-to-br from-[rgba(0,174,239,0.08)] to-[rgba(139,92,246,0.04)] bg-[#141414] border border-[#2A2A2A] rounded-xl p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-[#22C55E] font-semibold bg-[rgba(34,197,94,0.1)] px-2 py-0.5 rounded-full">Active</span>
              <span className="text-xs text-[#A0A0A0]">{p.phase}</span>
            </div>
            <h3 className="text-xl font-semibold text-[#F0F0F0]">{p.name}</h3>
            <p className="text-sm text-[#A0A0A0]">{p.method}</p>
            <p className="text-sm text-[#6B6B6B] mt-1">{p.week}</p>
          </div>
          <ClipboardList size={32} className="text-[#00AEEF] opacity-50" />
        </div>
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#A0A0A0]">Progress</span>
            <span className="text-[#F0F0F0] font-semibold">{p.progress}%</span>
          </div>
          <div className="h-2 bg-[#1A1A1A] rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${p.progress}%` }} transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-[#00AEEF] to-[#8B5CF6] rounded-full" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#2A2A2A]">
          <div className="text-center">
            <p className="text-xl font-bold text-[#F0F0F0] font-mono">{p.compliance}%</p>
            <p className="text-xs text-[#6B6B6B]">Compliance</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-[#F0F0F0] font-mono">{p.avgRPE}</p>
            <p className="text-xs text-[#6B6B6B]">Avg RPE</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-[#F0F0F0] font-mono">{p.sessionsThisPhase}</p>
            <p className="text-xs text-[#6B6B6B]">Sessions</p>
          </div>
        </div>
      </div>

      {/* Program History */}
      <SectionCard title="Program History">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2A2A2A]">
                {['Program', 'Method', 'Duration', 'Dates', 'Status', 'Results'].map((h) => (
                  <th key={h} className="text-left text-xs text-[#6B6B6B] font-semibold uppercase py-2 px-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {programData.history.map((prog, i) => (
                <tr key={i} className="border-b border-[#1F1F1F] hover:bg-[#1A1A1A] transition-colors">
                  <td className="py-2.5 px-3 text-sm text-[#F0F0F0] font-medium">{prog.name}</td>
                  <td className="py-2.5 px-3 text-sm text-[#A0A0A0]">{prog.method}</td>
                  <td className="py-2.5 px-3 text-sm text-[#A0A0A0] font-mono">{prog.duration}</td>
                  <td className="py-2.5 px-3 text-sm text-[#6B6B6B] font-mono">{prog.dates}</td>
                  <td className="py-2.5 px-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${prog.status === 'Completed' ? 'text-[#22C55E] bg-[rgba(34,197,94,0.1)]' : 'text-[#EF4444] bg-[rgba(239,68,68,0.1)]'}`}>{prog.status}</span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="text-xs text-[#22C55E] font-medium">{prog.weightChange}</span>
                    <span className="text-xs text-[#6B6B6B] mx-1">·</span>
                    <span className="text-xs text-[#00AEEF] font-medium">{prog.bfChange}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}

/* ═══════════════════════════════════════════
   TAB 9 — DIET / NUTRITION
   ═══════════════════════════════════════════ */

function DietTab() {
  const m = macroData;
  const adherence = Math.round((m.calories.current / m.calories.target) * 100);
  const waterFilled = Array.from({ length: 8 }, (_, i) => i < waterIntake);

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold text-[#F0F0F0]">Diet & Nutrition</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Calorie Summary */}
        <div className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-5">
          <p className="text-xs text-[#A0A0A0] mb-1">Calorie Target</p>
          <p className="text-2xl font-bold text-[#F0F0F0] font-mono">{m.calories.target.toLocaleString()} <span className="text-sm text-[#A0A0A0]">kcal</span></p>
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#A0A0A0]">Consumed</span>
              <span className="text-[#F0F0F0] font-mono font-semibold">{m.calories.current.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#A0A0A0]">Remaining</span>
              <span className="text-[#22C55E] font-mono font-semibold">{(m.calories.target - m.calories.current).toLocaleString()}</span>
            </div>
            <div className="h-2 bg-[#1A1A1A] rounded-full overflow-hidden mt-2">
              <div className="h-full bg-[#00AEEF] rounded-full transition-all" style={{ width: `${Math.min(adherence, 100)}%` }} />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-[#2A2A2A]">
            <p className="text-xs text-[#6B6B6B]">Adherence</p>
            <p className={`text-lg font-bold font-mono ${adherence >= 90 && adherence <= 110 ? 'text-[#22C55E]' : adherence > 110 ? 'text-[#EAB308]' : 'text-[#EF4444]'}`}>{adherence}%</p>
          </div>
        </div>

        {/* Macro Rings */}
        <div className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold text-[#F0F0F0] mb-4">Macro Breakdown</h3>
          <div className="grid grid-cols-3 gap-4">
            {([
              { label: 'Protein', current: m.protein.current, target: m.protein.target, color: '#00AEEF', key: 'protein' },
              { label: 'Carbs', current: m.carbs.current, target: m.carbs.target, color: '#8B5CF6', key: 'carbs' },
              { label: 'Fats', current: m.fats.current, target: m.fats.target, color: '#F97316', key: 'fats' },
            ]).map((macro) => {
              const pct = Math.round((macro.current / macro.target) * 100);
              const circ = 2 * Math.PI * 42;
              const off = circ - (Math.min(pct, 100) / 100) * circ;
              return (
                <div key={macro.key} className="text-center">
                  <div className="relative w-24 h-24 mx-auto">
                    <svg width="96" height="96" viewBox="0 0 96 96">
                      <circle cx="48" cy="48" r="42" fill="none" stroke="#2A2A2A" strokeWidth="7" />
                      <circle cx="48" cy="48" r="42" fill="none" stroke={macro.color} strokeWidth="7"
                        strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={off}
                        transform="rotate(-90 48 48)" style={{ transition: 'stroke-dashoffset 1s ease-out' }} />
                      <text x="48" y="46" textAnchor="middle" fill="#F0F0F0" fontSize="16" fontWeight="700">{pct}%</text>
                      <text x="48" y="58" textAnchor="middle" fill="#A0A0A0" fontSize="9">{macro.label}</text>
                    </svg>
                  </div>
                  <p className="text-sm text-[#F0F0F0] font-mono font-semibold mt-2">{macro.current}g <span className="text-xs text-[#6B6B6B]">/ {macro.target}g</span></p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Weekly Adherence */}
      <SectionCard title="Weekly Calorie Adherence">
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyAdherence}>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="day" tick={{ fill: '#6B6B6B', fontSize: 12 }} />
              <YAxis domain={[70, 120]} tick={{ fill: '#6B6B6B', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#141414', border: '1px solid #2A2A2A', borderRadius: 8, color: '#F0F0F0' }} />
              <ReferenceLine y={100} stroke="#22C55E" strokeDasharray="4 4" />
              <Bar dataKey="pct" radius={[4, 4, 0, 0]}>
                {weeklyAdherence.map((entry, i) => (
                  <Cell key={i} fill={entry.pct >= 90 && entry.pct <= 110 ? '#22C55E' : entry.pct > 110 && entry.pct <= 120 ? '#EAB308' : '#EF4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </SectionCard>

      {/* Meal Log */}
      <SectionCard title="Today's Meals">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {mealsToday.map((meal) => (
            <div key={meal.name} className="bg-[#1A1A1A] rounded-lg p-4 border border-[#2A2A2A]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-[#F0F0F0]">{meal.name}</span>
                  <span className="text-xs text-[#6B6B6B] font-mono">{meal.time}</span>
                </div>
                <span className="text-sm text-[#F0F0F0] font-mono font-semibold">{meal.total.cal} kcal</span>
              </div>
              <div className="space-y-1 mb-3">
                {meal.items.map((item, i) => (
                  <p key={i} className="text-xs text-[#A0A0A0]">{item.name}</p>
                ))}
              </div>
              <div className="flex gap-3 pt-2 border-t border-[#2A2A2A] text-xs font-mono">
                <span className="text-[#00AEEF]">P: {meal.total.p}g</span>
                <span className="text-[#8B5CF6]">C: {meal.total.c}g</span>
                <span className="text-[#F97316]">F: {meal.total.f}g</span>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Water Tracker */}
      <SectionCard title="Water Intake (2,000ml target)">
        <div className="flex items-center gap-3 flex-wrap">
          {waterFilled.map((filled, i) => (
            <button key={i} className={`w-10 h-12 rounded-lg flex items-center justify-center transition-all hover:scale-110 ${filled ? 'bg-[rgba(0,174,239,0.2)] border border-[#00AEEF]' : 'bg-[#1A1A1A] border border-[#2A2A2A]'}`}>
              <GlassWater size={18} className={filled ? 'text-[#00AEEF]' : 'text-[#6B6B6B]'} />
            </button>
          ))}
          <div className="ml-4">
            <p className="text-sm text-[#F0F0F0] font-mono font-semibold">{waterIntake * 250}ml <span className="text-xs text-[#6B6B6B]">/ 2,000ml</span></p>
            <p className="text-xs text-[#A0A0A0]">{Math.round((waterIntake / 8) * 100)}% of target</p>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

/* ═══════════════════════════════════════════
   TAB 10 — LIFESTYLE
   ═══════════════════════════════════════════ */

function LifestyleTab() {
  const ls = lifestyleData;
  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold text-[#F0F0F0]">Lifestyle</h2>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard label="Sleep (avg)" value={`${ls.sleep.avg}h`} icon={Moon} />
        <KpiCard label="Sleep Quality" value={ls.sleep.quality} icon={Activity} />
        <KpiCard label="Stress Level" value={`${ls.stress.score}/10`} icon={Heart} inverse />
        <KpiCard label="Activity" value={ls.activity.split(' ')[0]} icon={Flame} />
        <KpiCard label="Occupation" value="Desk Job" icon={Target} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <SectionCard title="Sleep History (7 Days)">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={sleep7Day}>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="day" tick={{ fill: '#6B6B6B', fontSize: 12 }} />
                <YAxis yAxisId="left" domain={[0, 10]} tick={{ fill: '#6B6B6B', fontSize: 11 }} />
                <YAxis yAxisId="right" orientation="right" domain={[0, 10]} tick={{ fill: '#6B6B6B', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#141414', border: '1px solid #2A2A2A', borderRadius: 8, color: '#F0F0F0' }} />
                <ReferenceLine yAxisId="left" y={8} stroke="#22C55E" strokeDasharray="4 4" />
                <Bar yAxisId="left" dataKey="hours" fill="#00AEEF" radius={[4, 4, 0, 0]} name="Hours" />
                <Line yAxisId="right" type="monotone" dataKey="quality" stroke="#8B5CF6" strokeWidth={2} name="Quality" dot={{ r: 4, fill: '#8B5CF6' }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Summary Cards">
          <div className="space-y-3">
            {[
              { label: 'Occupation', value: ls.occupation, icon: Target },
              { label: 'Activity Level', value: ls.activity, icon: Flame },
              { label: 'Injuries / Limitations', value: ls.injuries, icon: Heart },
              { label: 'Stress Trend', value: `${ls.stress.level} (${ls.stress.trend})`, icon: Activity },
              { label: 'Sleep Trend', value: `${ls.sleep.quality} (${ls.sleep.trend})`, icon: Moon },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-[#1A1A1A] rounded-lg border border-[#2A2A2A]">
                <div className="w-8 h-8 rounded-lg bg-[rgba(0,174,239,0.15)] flex items-center justify-center flex-shrink-0">
                  <item.icon size={16} className="text-[#00AEEF]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[#6B6B6B]">{item.label}</p>
                  <p className="text-sm text-[#F0F0F0] font-medium">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Habit Tracker */}
      <SectionCard title="Weekly Habit Tracker">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2A2A2A]">
                <th className="text-left text-xs text-[#6B6B6B] font-semibold uppercase py-2 px-3">Habit</th>
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
                  <th key={d} className="text-center text-xs text-[#6B6B6B] font-semibold uppercase py-2 px-2">{d}</th>
                ))}
                <th className="text-center text-xs text-[#6B6B6B] font-semibold uppercase py-2 px-3">%</th>
              </tr>
            </thead>
            <tbody>
              {habits.map((h) => {
                const completed = h.week.filter(Boolean).length;
                const pct = Math.round((completed / 7) * 100);
                return (
                  <tr key={h.name} className="border-b border-[#1F1F1F] hover:bg-[#1A1A1A] transition-colors">
                    <td className="py-2.5 px-3 text-sm text-[#F0F0F0]">{h.name}</td>
                    {h.week.map((done, i) => (
                      <td key={i} className="py-2.5 px-2 text-center">
                        {done ? <CheckCircle2 size={18} className="text-[#22C55E] mx-auto" /> : <XCircle size={18} className="text-[#EF4444] mx-auto opacity-40" />}
                      </td>
                    ))}
                    <td className="py-2.5 px-3 text-center">
                      <span className={`text-sm font-mono font-semibold ${pct >= 80 ? 'text-[#22C55E]' : pct >= 50 ? 'text-[#EAB308]' : 'text-[#EF4444]'}`}>{pct}%</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <div className="flex justify-end">
        <button className="flex items-center gap-2 bg-[#00AEEF] hover:bg-[#009BD6] text-white font-medium px-4 py-2 rounded-lg text-sm transition-all hover:scale-[1.02]">
          <Edit3 size={16} /> Update Questionnaire
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   TAB 11 — DATABASE
   ═══════════════════════════════════════════ */

function DatabaseTab() {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'times' | 'weight'>('times');

  const filtered = exerciseDb
    .filter((e) => e.name.toLowerCase().includes(search.toLowerCase()) || e.muscle.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'times') return b.timesDone - a.timesDone;
      if (sortBy === 'weight') return b.maxWeight - a.maxWeight;
      return a.name.localeCompare(b.name);
    });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-lg font-semibold text-[#F0F0F0]">Exercise Database</h2>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[#1A1A1A] rounded-lg border border-[#2A2A2A] px-3">
            <Search size={14} className="text-[#6B6B6B] flex-shrink-0" />
            <input type="text" placeholder="Search exercises..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-sm text-[#F0F0F0] placeholder-[#6B6B6B] py-2 px-2 outline-none w-48" />
          </div>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2 text-sm text-[#F0F0F0] outline-none">
            <option value="times">Most Frequent</option>
            <option value="weight">Heaviest</option>
            <option value="name">Name</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <SectionCard title="Muscle Group Distribution">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={muscleDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                  {muscleDistribution.map((_, i) => (<Cell key={i} fill={COLORS[i % COLORS.length]} />))}
                </Pie>
                <Tooltip contentStyle={{ background: '#141414', border: '1px solid #2A2A2A', borderRadius: 8, color: '#F0F0F0' }} />
                <Legend wrapperStyle={{ fontSize: 11, color: '#A0A0A0' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Most Frequent Exercises">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={exerciseDb.slice(0, 6)} layout="vertical">
                <CartesianGrid stroke="rgba(255,255,255,0.04)" />
                <XAxis type="number" tick={{ fill: '#6B6B6B', fontSize: 11 }} />
                <YAxis dataKey="name" type="category" tick={{ fill: '#A0A0A0', fontSize: 10 }} width={100} />
                <Tooltip contentStyle={{ background: '#141414', border: '1px solid #2A2A2A', borderRadius: 8, color: '#F0F0F0' }} />
                <Bar dataKey="timesDone" fill="#00AEEF" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="All Exercises">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2A2A2A]">
                {['Exercise', 'Muscle Group', 'Equipment', 'Times Done', 'Max Weight', 'Last Date'].map((h) => (
                  <th key={h} className="text-left text-xs text-[#6B6B6B] font-semibold uppercase py-2 px-3 cursor-pointer hover:text-[#00AEEF] transition-colors">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((ex, i) => (
                <motion.tr key={ex.name} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                  className="border-b border-[#1F1F1F] hover:bg-[#1A1A1A] transition-colors">
                  <td className="py-2.5 px-3 text-sm text-[#F0F0F0] font-medium">{ex.name}</td>
                  <td className="py-2.5 px-3"><span className="text-xs px-2 py-0.5 rounded-full bg-[rgba(0,174,239,0.1)] text-[#00AEEF]">{ex.muscle}</span></td>
                  <td className="py-2.5 px-3"><span className="text-xs px-2 py-0.5 rounded-full bg-[rgba(139,92,246,0.1)] text-[#8B5CF6]">{ex.equipment}</span></td>
                  <td className="py-2.5 px-3 text-sm text-[#F0F0F0] font-mono">{ex.timesDone}</td>
                  <td className="py-2.5 px-3 text-sm text-[#F0F0F0] font-mono font-semibold">{ex.maxWeight}kg</td>
                  <td className="py-2.5 px-3 text-sm text-[#6B6B6B] font-mono">{ex.lastDate}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}

/* ═══════════════════════════════════════════
   TAB 12 — GOALS
   ═══════════════════════════════════════════ */

function GoalsTab() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[#F0F0F0]">Goals</h2>
        <button className="flex items-center gap-2 bg-[#00AEEF] hover:bg-[#009BD6] text-white font-medium px-4 py-2 rounded-lg text-sm transition-all hover:scale-[1.02]">
          <Plus size={16} /> New Goal
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goalsData.map((goal, i) => (
          <motion.div
            key={goal.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-5 hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(0,174,239,0.1)] transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs px-2 py-0.5 rounded-full bg-[rgba(0,174,239,0.1)] text-[#00AEEF]">{goal.category}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${goal.status === 'On Track' ? 'text-[#22C55E] bg-[rgba(34,197,94,0.1)]' : 'text-[#EAB308] bg-[rgba(234,179,8,0.1)]'}`}>{goal.status}</span>
            </div>
            <h3 className="text-base font-semibold text-[#F0F0F0] mb-2">{goal.title}</h3>
            <div className="grid grid-cols-3 gap-2 mb-3 text-center">
              <div><p className="text-xs text-[#6B6B6B]">Starting</p><p className="text-sm text-[#A0A0A0] font-mono">{goal.start}</p></div>
              <div><p className="text-xs text-[#6B6B6B]">Current</p><p className="text-sm text-[#00AEEF] font-mono font-semibold">{goal.current}</p></div>
              <div><p className="text-xs text-[#6B6B6B]">Target</p><p className="text-sm text-[#22C55E] font-mono">{goal.target}</p></div>
            </div>
            <div className="space-y-1 mb-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#A0A0A0]">Progress</span>
                <span className="text-[#F0F0F0] font-semibold">{goal.progress}%</span>
              </div>
              <div className="h-1.5 bg-[#1A1A1A] rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${goal.progress}%` }} transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-[#00AEEF] to-[#22C55E] rounded-full" />
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-[#6B6B6B]">
              <span>Deadline: {goal.deadline}</span>
              {goal.daysLeft !== null && <span>{goal.daysLeft} days left</span>}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Milestone Timeline */}
      <SectionCard title="Milestone Timeline">
        <div className="relative pl-6">
          <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#00AEEF] to-[#22C55E]" />
          {milestones.map((m, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
              className="relative mb-6 last:mb-0">
              <div className="absolute -left-4 top-1 w-3 h-3 rounded-full bg-[#00AEEF] border-2 border-[#0A0A0A]" />
              <div className="bg-[#1A1A1A] rounded-lg p-3 border border-[#2A2A2A] ml-2">
                <p className="text-xs text-[#6B6B6B] font-mono mb-1">{m.date}</p>
                <p className="text-sm text-[#F0F0F0] font-medium">{m.title}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </SectionCard>

      {/* Completed Goals */}
      <SectionCard title="Completed Goals">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2A2A2A]">
                {['Goal', 'Result', 'Achieved', 'Duration'].map((h) => (
                  <th key={h} className="text-left text-xs text-[#6B6B6B] font-semibold uppercase py-2 px-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {completedGoals.map((g, i) => (
                <tr key={i} className="border-b border-[#1F1F1F] hover:bg-[#1A1A1A] transition-colors">
                  <td className="py-2.5 px-3 text-sm text-[#F0F0F0] font-medium flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-[#22C55E]" /> {g.title}
                  </td>
                  <td className="py-2.5 px-3 text-sm text-[#22C55E] font-mono font-semibold">{g.result}</td>
                  <td className="py-2.5 px-3 text-sm text-[#6B6B6B] font-mono">{g.achieved}</td>
                  <td className="py-2.5 px-3 text-sm text-[#A0A0A0]">{g.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}

/* ═══════════════════════════════════════════
   TAB 13 — PROGRESS PHOTOS
   ═══════════════════════════════════════════ */

function PhotosTab() {
  const [categoryFilter, setCategoryFilter] = useState<PhotoCategory | 'All'>('All');
  const [compareMode, setCompareMode] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [viewingPhoto, setViewingPhoto] = useState<ProgressPhoto | null>(null);

  const filtered = progressPhotos.filter((p) => categoryFilter === 'All' || p.category === categoryFilter);

  const toggleCompare = (id: string) => {
    setSelectedForCompare((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  };

  const comparePhotos = progressPhotos.filter((p) => selectedForCompare.includes(p.id));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-lg font-semibold text-[#F0F0F0]">Progress Photos</h2>
        <div className="flex items-center gap-2">
          <button onClick={() => { setCompareMode(!compareMode); setSelectedForCompare([]); }}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${compareMode ? 'bg-[#00AEEF] text-white' : 'bg-[#1A1A1A] text-[#A0A0A0] hover:text-[#F0F0F0]'}`}>
            <Eye size={14} /> Compare Mode
          </button>
          <button className="flex items-center gap-2 bg-[#00AEEF] hover:bg-[#009BD6] text-white font-medium px-4 py-2 rounded-lg text-sm transition-all hover:scale-[1.02]">
            <Upload size={16} /> Upload
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter size={14} className="text-[#6B6B6B]" />
        <span className="text-xs text-[#6B6B6B]">Category:</span>
        {(['All', 'Front', 'Back', 'Side', 'Other'] as const).map((c) => (
          <button key={c} onClick={() => setCategoryFilter(c)}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${categoryFilter === c ? 'bg-[#242424] text-[#00AEEF]' : 'text-[#6B6B6B] hover:text-[#A0A0A0]'}`}>
            {c}
          </button>
        ))}
      </div>

      {/* Compare View */}
      {compareMode && selectedForCompare.length === 2 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-[#F0F0F0] mb-4">Side-by-Side Comparison</h3>
          <div className="grid grid-cols-2 gap-4">
            {comparePhotos.map((p) => (
              <div key={p.id} className="text-center">
                <div className="aspect-[3/4] bg-[#1A1A1A] rounded-lg overflow-hidden mb-3">
                  <img src={p.thumbnailUrl} alt={p.category} className="w-full h-full object-cover" />
                </div>
                <p className="text-sm text-[#F0F0F0] font-medium">{p.date}</p>
                <p className="text-xs text-[#A0A0A0]">{p.category} · {p.weight}kg · {p.bodyFatPercentage}% BF</p>
                {p.trainerNotes && <p className="text-xs text-[#00AEEF] mt-1">{p.trainerNotes}</p>}
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-[#1A1A1A] rounded-lg text-center">
            <p className="text-sm text-[#F0F0F0]">
              Weight change: <span className="text-[#22C55E] font-semibold">{(comparePhotos[1]?.weight ?? 0) - (comparePhotos[0]?.weight ?? 0)} kg</span>
              <span className="mx-3 text-[#2A2A2A]">|</span>
              Body Fat change: <span className="text-[#22C55E] font-semibold">{((comparePhotos[1]?.bodyFatPercentage ?? 0) - (comparePhotos[0]?.bodyFatPercentage ?? 0)).toFixed(1)}%</span>
            </p>
          </div>
        </motion.div>
      )}

      {/* Photo Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map((photo, i) => {
          const isSelected = selectedForCompare.includes(photo.id);
          return (
            <motion.div
              key={photo.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className={`group relative bg-[#141414] border rounded-xl overflow-hidden cursor-pointer transition-all ${isSelected ? 'border-[#00AEEF] ring-2 ring-[#00AEEF]/30' : 'border-[#2A2A2A] hover:border-[#3A3A3A]'}`}
              onClick={() => {
                if (compareMode) toggleCompare(photo.id);
                else setViewingPhoto(photo);
              }}
            >
              <div className="aspect-[3/4] bg-[#1A1A1A] relative">
                <img src={photo.thumbnailUrl} alt={photo.category} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                {compareMode && (
                  <div className={`absolute top-2 right-2 w-6 h-6 rounded-full border-2 flex items-center justify-center ${isSelected ? 'bg-[#00AEEF] border-[#00AEEF]' : 'bg-black/50 border-white/50'}`}>
                    {isSelected && <CheckCircle2 size={14} className="text-white" />}
                  </div>
                )}
                {photo.isMilestone && (
                  <div className="absolute top-2 left-2">
                    <Award size={18} className="text-[#EAB308]" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#A0A0A0] font-mono">{photo.date}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[rgba(0,174,239,0.1)] text-[#00AEEF]">{photo.category}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-[#6B6B6B] font-mono">{photo.weight}kg</span>
                  <span className="text-xs text-[#6B6B6B]">·</span>
                  <span className="text-xs text-[#6B6B6B] font-mono">{photo.bodyFatPercentage}% BF</span>
                </div>
                {photo.isGoalAchieved && (
                  <span className="inline-block mt-1 text-xs text-[#22C55E] font-medium">Goal Achieved!</span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Photo Viewer Modal */}
      {viewingPhoto && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
          onClick={() => setViewingPhoto(null)}>
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}
            className="bg-[#141414] border border-[#2A2A2A] rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-4 border-b border-[#2A2A2A]">
                <div>
                  <h3 className="text-base font-semibold text-[#F0F0F0]">{viewingPhoto.category} — {viewingPhoto.date}</h3>
                  <p className="text-xs text-[#6B6B6B] font-mono">{viewingPhoto.weight}kg · {viewingPhoto.bodyFatPercentage}% BF</p>
                </div>
                <button onClick={() => setViewingPhoto(null)} className="w-8 h-8 rounded-lg bg-[#1A1A1A] hover:bg-[#242424] flex items-center justify-center text-[#A0A0A0] transition-colors">
                  <X size={16} />
                </button>
              </div>
              <div className="p-4">
                <div className="aspect-[3/4] bg-[#1A1A1A] rounded-lg overflow-hidden mb-4">
                  <img src={viewingPhoto.url} alt={viewingPhoto.category} className="w-full h-full object-contain" />
                </div>
                {viewingPhoto.notes && (
                  <div className="mb-3">
                    <p className="text-xs text-[#6B6B6B] mb-1">Client Notes</p>
                    <p className="text-sm text-[#F0F0F0]">{viewingPhoto.notes}</p>
                  </div>
                )}
                {viewingPhoto.trainerNotes && (
                  <div className="p-3 bg-[rgba(0,174,239,0.08)] rounded-lg border border-[rgba(0,174,239,0.2)]">
                    <p className="text-xs text-[#00AEEF] mb-1">Trainer Notes</p>
                    <p className="text-sm text-[#F0F0F0]">{viewingPhoto.trainerNotes}</p>
                  </div>
                )}
              </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN CLIENT PROFILE PAGE
   ═══════════════════════════════════════════ */

export default function ClientProfilePage() {
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');
  const tabBarRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const checkOverflow = useCallback(() => {
    const el = tabBarRef.current;
    if (!el) return;
    setShowLeftArrow(el.scrollLeft > 10);
    setShowRightArrow(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }, []);

  useEffect(() => {
    const el = tabBarRef.current;
    if (!el) return;
    checkOverflow();
    el.addEventListener('scroll', checkOverflow);
    window.addEventListener('resize', checkOverflow);
    return () => {
      el.removeEventListener('scroll', checkOverflow);
      window.removeEventListener('resize', checkOverflow);
    };
  }, [checkOverflow]);

  const scrollTabs = (dir: 'left' | 'right') => {
    const el = tabBarRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === 'left' ? -200 : 200, behavior: 'smooth' });
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardTab />;
      case 'bioprint': return <BioPrintTab />;
      case 'bodystats': return <BodyStatsTab />;
      case 'records': return <RecordsTab />;
      case 'notes': return <NotesTab />;
      case 'sessions': return <SessionsTab />;
      case 'calendar': return <CalendarView />;
      case 'programs': return <ProgramsTab />;
      case 'diet': return <DietTab />;
      case 'lifestyle': return <LifestyleTab />;
      case 'database': return <DatabaseTab />;
      case 'goals': return <GoalsTab />;
      case 'photos': return <PhotosTab />;
      default: return <DashboardTab />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
      className="space-y-0"
    >
      {/* Client Header Bar */}
      <div className="bg-[#141414] border-b border-[#2A2A2A] px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Left: Avatar + Name */}
          <div className="flex items-center gap-4">
            <div className="relative flex-shrink-0">
              <img src={client.avatar} alt={client.name} className="w-14 h-14 rounded-full object-cover border-2 border-[#22C55E]" />
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#22C55E] border-2 border-[#141414]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold text-[#F0F0F0]">{client.name}</h1>
                <span className="text-xs px-2 py-0.5 rounded-full text-[#22C55E] bg-[rgba(34,197,94,0.1)] font-semibold">Active</span>
              </div>
              <p className="text-xs text-[#6B6B6B] font-mono">{client.clientId}</p>
            </div>
          </div>

          {/* Center: Quick Stats */}
          <div className="flex items-center gap-3 sm:gap-5 flex-wrap sm:flex-1 sm:justify-center">
            {[
              { label: `${client.age}${client.sex}`, value: 'Age/Sex' },
              { label: `${client.weight} kg`, value: 'Weight' },
              { label: `${client.bodyFat}%`, value: 'Body Fat' },
              { label: `${client.sessions} total`, value: 'Sessions' },
            ].map((stat, i) => (
              <div key={i} className="flex items-center gap-2 sm:gap-3">
                {i > 0 && <div className="hidden sm:block w-px h-6 bg-[#2A2A2A]" />}
                <div className="text-center sm:text-left">
                  <p className="text-sm text-[#F0F0F0] font-mono font-semibold">{stat.label}</p>
                  <p className="text-xs text-[#6B6B6B]">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button className="flex items-center gap-1.5 text-[#A0A0A0] hover:text-[#F0F0F0] hover:bg-[#242424] px-3 py-2 rounded-lg text-sm transition-colors">
              <Edit3 size={14} /> <span className="hidden sm:inline">Edit</span>
            </button>
            <button className="flex items-center gap-1.5 bg-[#00AEEF] hover:bg-[#009BD6] text-white px-3 py-2 rounded-lg text-sm font-medium transition-all hover:scale-[1.02]">
              <CalendarPlus size={14} /> <span className="hidden sm:inline">Book</span>
            </button>
            <button className="w-8 h-8 flex items-center justify-center text-[#A0A0A0] hover:text-[#F0F0F0] hover:bg-[#242424] rounded-lg transition-colors">
              <MessageSquare size={16} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center text-[#A0A0A0] hover:text-[#F0F0F0] hover:bg-[#242424] rounded-lg transition-colors">
              <MoreVertical size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="bg-[#0A0A0A] border-b border-[#1F1F1F] relative">
        {showLeftArrow && (
          <button onClick={() => scrollTabs('left')} className="absolute left-0 top-0 bottom-0 z-10 w-8 bg-gradient-to-r from-[#0A0A0A] to-transparent flex items-center justify-center text-[#A0A0A0] hover:text-[#F0F0F0]">
            <ChevronLeft size={16} />
          </button>
        )}
        {showRightArrow && (
          <button onClick={() => scrollTabs('right')} className="absolute right-0 top-0 bottom-0 z-10 w-8 bg-gradient-to-l from-[#0A0A0A] to-transparent flex items-center justify-center text-[#A0A0A0] hover:text-[#F0F0F0]">
            <ChevronRight size={16} />
          </button>
        )}
        <div
          ref={tabBarRef}
          className="flex gap-1 px-4 sm:px-6 lg:px-8 py-2 overflow-x-auto scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {tabsConfig.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 flex-shrink-0
                  ${isActive
                    ? 'bg-[#141414] text-[#F0F0F0] border border-[#2A2A2A]'
                    : 'text-[#6B6B6B] hover:text-[#A0A0A0] hover:bg-[#242424] border border-transparent'
                  }`}
                style={isActive ? { borderLeft: '3px solid #00AEEF' } : undefined}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {renderTab()}
        </motion.div>
      </div>
    </motion.div>
  );
}
