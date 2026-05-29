/* ═══════════════════════════════════════════
   PLANNED FEATURES — Option B Roadmap
   Shows Phase 9-14 features as coming soon
   ═══════════════════════════════════════════ */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText, QrCode, MessageCircle, CreditCard, Video, Watch,
  Lock, Clock, Star,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

/* ── PHASE DATA ── */
const phases = [
  {
    phase: 'Phase 9',
    title: 'PDF Export for Programs',
    description: 'Generate professional PDFs of training programs and nutrition plans for client sharing.',
    icon: FileText,
    status: 'planned' as const,
    features: ['Program PDF export', 'Nutrition plan PDF', 'Branded templates', 'Email sharing'],
  },
  {
    phase: 'Phase 10',
    title: 'QR Code Generation',
    description: 'Create QR codes for quick client check-in, program sharing, and trainer profiles.',
    icon: QrCode,
    status: 'planned' as const,
    features: ['Client check-in QR', 'Program share QR', 'Trainer profile QR', 'Scan history'],
  },
  {
    phase: 'Phase 11',
    title: 'WhatsApp Integration',
    description: 'Send program updates, reminders, and check-ins via WhatsApp Business API.',
    icon: MessageCircle,
    status: 'planned' as const,
    features: ['wa.me message links', 'Automated reminders', 'Program delivery', 'Client support'],
  },
  {
    phase: 'Phase 12',
    title: 'Payment / Invoicing (HKD)',
    description: 'Track revenue, generate invoices, and manage payments in Hong Kong Dollars.',
    icon: CreditCard,
    status: 'planned' as const,
    features: ['Invoice generation', 'Payment tracking', 'Revenue reports', 'Package management'],
  },
  {
    phase: 'Phase 13',
    title: 'Progress Videos',
    description: 'Record and analyze exercise form videos for remote coaching and form checks.',
    icon: Video,
    status: 'planned' as const,
    features: ['Video upload', 'Form analysis', 'Side-by-side comparison', 'Trainer annotations'],
  },
  {
    phase: 'Phase 14',
    title: 'Wearable Integration',
    description: 'Sync data from Apple Health, Google Fit, Garmin, and other fitness wearables.',
    icon: Watch,
    status: 'planned' as const,
    features: ['Apple Health sync', 'Google Fit sync', 'Garmin Connect', 'Heart rate data'],
  },
];

/* ── NUTRITION ENHANCED PLANNED FEATURES ── */
const nutritionPlanned = [
  {
    title: 'Macro Chess',
    description: 'Strategic meal timing game — drag-and-drop macros across a 24-hour timeline, AI evaluates strategy.',
    icon: Star,
  },
  {
    title: 'Pantry Oracle',
    description: 'Scan pantry/fridge/freezer, AI builds meal plans from existing inventory, reduces food waste.',
    icon: Star,
  },
  {
    title: 'Social Accountability Circles',
    description: 'Auto-group 4-6 clients with similar goals, shared leaderboards, squad challenges.',
    icon: Star,
  },
  {
    title: 'Depletion Gauge',
    description: 'Visual fuel tank showing glycogen stores, predicts workout performance, recovery scoring.',
    icon: Star,
  },
  {
    title: 'Compliance Casino',
    description: 'Gamified adherence — earn AzFIT Coins for logging meals, hitting macros, spin the wheel.',
    icon: Star,
  },
];

/* ── COMPONENT ── */
function PhaseCard({ phase, index }: { phase: typeof phases[0]; index: number }) {
  const Icon = phase.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
    >
      <Card className="bg-[#141414] border-[#2A2A2A] hover:border-[#00AEEF]/40 transition-all duration-300 h-full group">
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center group-hover:border-[#00AEEF]/40 transition-colors">
                <Icon size={20} className="text-[#00AEEF]" />
              </div>
              <div>
                <span className="text-xs text-[#6B6B6B] font-medium uppercase tracking-wider">{phase.phase}</span>
                <h3 className="text-[#F0F0F0] font-semibold text-sm">{phase.title}</h3>
              </div>
            </div>
            <span className="text-xs bg-[#1A1A1A] text-[#6B6B6B] px-2 py-0.5 rounded-full border border-[#2A2A2A]">
              Planned
            </span>
          </div>
          <p className="text-[#A0A0A0] text-sm mb-3 leading-relaxed">{phase.description}</p>
          <div className="space-y-1.5">
            {phase.features.map((f) => (
              <div key={f} className="flex items-center gap-2 text-xs text-[#6B6B6B]">
                <Lock size={10} />
                <span>{f}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function PlannedFeaturesPage() {
  const [activeTab, setActiveTab] = useState<'roadmap' | 'nutrition'>('roadmap');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#F0F0F0] font-[Playfair_Display]">Planned Features</h1>
        <p className="text-[#6B6B6B] text-sm mt-1">Option B Balanced roadmap — features coming in future releases</p>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-1 bg-[#141414] p-1 rounded-lg border border-[#2A2A2A] w-fit">
        {[
          { key: 'roadmap' as const, label: 'Phase Roadmap (9-14)' },
          { key: 'nutrition' as const, label: 'Nutrition Enhanced' },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === t.key
                ? 'bg-[#1A1A1A] text-[#F0F0F0] border border-[#2A2A2A]'
                : 'text-[#6B6B6B] hover:text-[#A0A0A0]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Roadmap Grid */}
      {activeTab === 'roadmap' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
        >
          {phases.map((p, i) => (
            <PhaseCard key={p.phase} phase={p} index={i} />
          ))}
        </motion.div>
      )}

      {/* Nutrition Enhanced */}
      {activeTab === 'nutrition' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          <div className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-5">
            <h2 className="text-lg font-semibold text-[#F0F0F0] mb-2">TDEE Calculator Enhancement</h2>
            <p className="text-[#A0A0A0] text-sm mb-4">
              Enhanced TDEE engine with Mifflin-St Jeor + Katch-McArdle formulas, 
              macro split algorithm with safety guardrails, carb cycling, and refeed day options.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                'Mifflin-St Jeor (default)',
                'Katch-McArdle (with BF%)',
                'Carb Cycling',
                'Refeed Day Protocol',
              ].map((f) => (
                <div key={f} className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-3 text-center">
                  <Star size={16} className="text-[#00AEEF] mx-auto mb-1" />
                  <span className="text-xs text-[#A0A0A0]">{f}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {nutritionPlanned.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="bg-[#141414] border-[#2A2A2A] h-full">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center">
                        <Star size={16} className="text-[#EAB308]" />
                      </div>
                      <h3 className="text-[#F0F0F0] font-semibold text-sm">{f.title}</h3>
                    </div>
                    <p className="text-[#A0A0A0] text-sm">{f.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Timeline */}
      <div className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-5">
        <h2 className="text-lg font-semibold text-[#F0F0F0] mb-4 flex items-center gap-2">
          <Clock size={18} className="text-[#00AEEF]" />
          Implementation Timeline
        </h2>
        <div className="relative pl-6 space-y-4">
          <div className="absolute left-[11px] top-2 bottom-2 w-px bg-[#2A2A2A]" />
          {[
            { phase: 'Phase 8', label: 'Progress Photos Upload', status: 'completed', color: '#22C55E' },
            { phase: 'Phase 9', label: 'PDF Export for Programs', status: 'planned', color: '#00AEEF' },
            { phase: 'Phase 10', label: 'QR Code Generation', status: 'planned', color: '#00AEEF' },
            { phase: 'Phase 11', label: 'WhatsApp Integration', status: 'planned', color: '#00AEEF' },
            { phase: 'Phase 12', label: 'Payment / Invoicing (HKD)', status: 'planned', color: '#00AEEF' },
            { phase: 'Phase 13', label: 'Progress Videos', status: 'planned', color: '#00AEEF' },
            { phase: 'Phase 14', label: 'Wearable Integration', status: 'planned', color: '#00AEEF' },
          ].map((item) => (
            <div key={item.phase} className="flex items-center gap-3 relative">
              <div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xs text-[#6B6B6B] w-16">{item.phase}</span>
              <span className="text-sm text-[#F0F0F0]">{item.label}</span>
              <span
                className="text-xs px-2 py-0.5 rounded-full ml-auto"
                style={{
                  backgroundColor: item.status === 'completed' ? 'rgba(34,197,94,0.15)' : 'rgba(0,174,239,0.15)',
                  color: item.color,
                }}
              >
                {item.status === 'completed' ? 'Completed' : 'Planned'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
