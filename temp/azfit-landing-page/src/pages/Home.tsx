import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import {
  Dumbbell, Activity, Brain, HeartPulse, TrendingUp,
  MessageCircle, Calendar, BarChart3, Play, Star,
  Check, Scan, Apple, Users,
} from 'lucide-react'
/* ──────────────────────────────────────────────
   Easing Tokens
   ────────────────────────────────────────────── */
const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as [number, number, number, number]
const EASE_SMOOTH = [0.25, 0.1, 0.25, 1] as [number, number, number, number]

/* ──────────────────────────────────────────────
   Section 1: Hero
   ────────────────────────────────────────────── */
function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const [counts, setCounts] = useState({ coaches: 0, workouts: 0, uptime: 0 })
  const statsRef = useRef<HTMLDivElement>(null)
  const statsInView = useInView(statsRef, { once: true, margin: '-100px' })

  useEffect(() => {
    if (!statsInView) return
    const duration = 1500
    const startTime = Date.now()
    const targets = { coaches: 500, workouts: 50000, uptime: 99.9 }

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration)
      const eased = 1 - Math.pow(1 - progress, 3)

      setCounts({
        coaches: Math.floor(targets.coaches * eased),
        workouts: Math.floor(targets.workouts * eased),
        uptime: Math.round(targets.uptime * eased * 10) / 10,
      })

      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [statsInView])

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[100dvh] flex items-center overflow-hidden"
      style={{ background: 'linear-gradient(to bottom, #030712, #111827)' }}
    >
      {/* Noise overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-[2]"
        style={{
          backgroundImage: 'url(/noise.png)',
          backgroundRepeat: 'repeat',
          opacity: 0.03,
          mixBlendMode: 'overlay',
        }}
      />

      {/* Background image subtle overlay */}
      <div
        className="absolute inset-0 z-0 opacity-20"
        style={{
          backgroundImage: 'url(/hero-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      <div className="relative z-10 mx-auto max-w-[1280px] w-full section-pad-x py-20 lg:py-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center min-h-[calc(100dvh-72px)]">
          {/* Left Panel - Text */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE_OUT_EXPO, delay: 0.4 }}
            className="flex flex-col justify-center"
          >
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE_OUT_EXPO, delay: 0.4 }}
              className="text-[12px] font-medium uppercase tracking-[0.15em] mb-4"
              style={{ color: '#00AEEF' }}
            >
              The First of Its Kind
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: EASE_OUT_EXPO, delay: 0.52 }}
              className="text-gradient-azure font-extrabold mb-4"
              style={{
                fontSize: 'clamp(64px, 7vw, 110px)',
                letterSpacing: '-0.03em',
                lineHeight: 1.05,
              }}
            >
              AZFIT
            </motion.h1>

            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: EASE_OUT_EXPO, delay: 0.64 }}
              className="mb-6 font-normal"
              style={{
                fontSize: 'clamp(24px, 2vw, 32px)',
                color: '#D1D5DB',
                maxWidth: '520px',
                letterSpacing: '-0.01em',
                lineHeight: 1.2,
              }}
            >
              The Operating System for Modern Personal Training
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: EASE_OUT_EXPO, delay: 0.76 }}
              className="mb-8"
              style={{
                color: '#9CA3AF',
                fontSize: '16px',
                lineHeight: 1.7,
                maxWidth: '440px',
              }}
            >
              AI-driven programming. Real-time biometric sync. Seamless client
              engagement. AzFIT is the all-in-one platform built for the next
              generation of personal training.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: EASE_OUT_EXPO, delay: 0.88 }}
              className="flex flex-wrap items-center gap-4 mb-10"
            >
              <Link
                to="/pricing"
                className="gradient-azure text-[#F9FAFB] font-semibold text-[16px] px-8 py-4 rounded-lg shadow-glow-blue transition-all duration-200 hover:shadow-glow-blue-lg hover:scale-[1.03] active:scale-[0.97]"
              >
                Start 14-Day Trial
              </Link>
              <button
                className="flex items-center gap-2 border font-medium text-[16px] px-8 py-4 rounded-lg transition-all duration-200 hover:scale-[1.02]"
                style={{
                  borderColor: '#00AEEF',
                  color: '#00AEEF',
                  background: 'transparent',
                }}
                onClick={() => {
                  alert('Demo video coming soon!')
                }}
              >
                <Play size={18} fill="#00AEEF" />
                Watch Demo
              </button>
            </motion.div>

            {/* Stats Row */}
            <motion.div
              ref={statsRef}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE_OUT_EXPO, delay: 1.0 }}
              className="flex flex-wrap items-center gap-8"
            >
              <div>
                <div className="font-mono text-[24px] font-bold" style={{ color: '#00AEEF' }}>
                  {counts.coaches}+
                </div>
                <div className="text-[12px] font-medium uppercase tracking-[0.04em]" style={{ color: '#9CA3AF' }}>
                  Coaches Onboarded
                </div>
              </div>
              <div>
                <div className="font-mono text-[24px] font-bold" style={{ color: '#00AEEF' }}>
                  {counts.workouts.toLocaleString()}+
                </div>
                <div className="text-[12px] font-medium uppercase tracking-[0.04em]" style={{ color: '#9CA3AF' }}>
                  Workouts Delivered
                </div>
              </div>
              <div>
                <div className="font-mono text-[24px] font-bold" style={{ color: '#00AEEF' }}>
                  {counts.uptime}%
                </div>
                <div className="text-[12px] font-medium uppercase tracking-[0.04em]" style={{ color: '#9CA3AF' }}>
                  Uptime SLA
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Panel - AI Dashboard Orb (CSS-based) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.0, ease: EASE_OUT_EXPO, delay: 0.4 }}
            className="flex items-center justify-center relative"
            style={{ minHeight: 'min(55vw, 55vh)' }}
          >
            <div className="relative" style={{
              width: 'min(400px, 55vw)',
              height: 'min(400px, 55vw)',
            }}>
              {/* Outer glow */}
              <div
                className="absolute inset-0 rounded-full animate-orb-breathe"
                style={{
                  background: 'radial-gradient(circle, rgba(0,174,239,0.15) 0%, transparent 70%)',
                  filter: 'blur(40px)',
                }}
              />

              {/* Pulse wave rings */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="absolute w-full h-full rounded-full border border-[rgba(0,174,239,0.15)] animate-pulse-ring" style={{ animationDelay: '0s' }} />
              </div>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="absolute w-full h-full rounded-full border border-[rgba(0,174,239,0.12)] animate-pulse-ring" style={{ animationDelay: '1s' }} />
              </div>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="absolute w-full h-full rounded-full border border-[rgba(0,174,239,0.08)] animate-pulse-ring" style={{ animationDelay: '2s' }} />
              </div>

              {/* Main orb */}
              <div
                className="absolute inset-0 rounded-full animate-orb-breathe"
                style={{
                  background: 'radial-gradient(circle at 35% 35%, rgba(0,174,239,0.25) 0%, rgba(59,130,246,0.1) 40%, rgba(17,24,39,0.6) 70%, rgba(3,7,18,0.8) 100%)',
                  border: '2px solid rgba(0, 174, 239, 0.3)',
                  backdropFilter: 'blur(8px)',
                  boxShadow: '0 0 60px rgba(0, 174, 239, 0.15), inset 0 0 40px rgba(0, 174, 239, 0.05)',
                }}
              >
                {/* Wireframe core - rotating rings */}
                <div
                  className="absolute inset-[15%] rounded-full animate-rotate-wireframe"
                  style={{
                    border: '1px solid rgba(0, 174, 239, 0.2)',
                  }}
                />
                <div
                  className="absolute inset-[25%] rounded-full"
                  style={{
                    border: '1px solid rgba(0, 174, 239, 0.15)',
                    animation: 'rotate-wireframe 15s linear infinite reverse',
                  }}
                />
                <div
                  className="absolute inset-[35%] rounded-full"
                  style={{
                    border: '1px solid rgba(0, 174, 239, 0.1)',
                    animation: 'rotate-wireframe 10s linear infinite',
                  }}
                />

                {/* Cross wireframe lines */}
                <div
                  className="absolute top-0 bottom-0 left-1/2 w-px"
                  style={{ background: 'rgba(0, 174, 239, 0.15)' }}
                />
                <div
                  className="absolute left-0 right-0 top-1/2 h-px"
                  style={{ background: 'rgba(0, 174, 239, 0.15)' }}
                />

                {/* AzFIT Logo inside orb */}
                <div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
                  style={{ width: '85%', height: '85%' }}
                >
                  <img
                    src="/AzFIT_LOGO_Transparent.png"
                    alt="AzFIT"
                    className="w-full h-full object-contain drop-shadow-[0_0_20px_rgba(0,174,239,0.6)]"
                    style={{ filter: 'drop-shadow(0 0 12px rgba(0,174,239,0.5)) drop-shadow(0 0 4px rgba(255,255,255,0.2))' }}
                  />
                </div>

                {/* Inner glowing core */}
                <div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                  style={{
                    width: '30%',
                    height: '30%',
                    background: 'radial-gradient(circle, rgba(0,174,239,0.4) 0%, rgba(59,130,246,0.15) 50%, transparent 100%)',
                    filter: 'blur(8px)',
                  }}
                />

                {/* Glowing hotspots */}
                <div
                  className="absolute w-3 h-3 rounded-full"
                  style={{
                    top: '20%',
                    left: '70%',
                    background: '#00AEEF',
                    boxShadow: '0 0 12px rgba(0,174,239,0.8), 0 0 24px rgba(0,174,239,0.4)',
                    animation: 'orb-breathe 4s ease-in-out infinite',
                    animationDelay: '0.5s',
                  }}
                />
                <div
                  className="absolute w-2.5 h-2.5 rounded-full"
                  style={{
                    top: '65%',
                    left: '25%',
                    background: '#00AEEF',
                    boxShadow: '0 0 10px rgba(0,174,239,0.7), 0 0 20px rgba(0,174,239,0.3)',
                    animation: 'orb-breathe 4s ease-in-out infinite',
                    animationDelay: '1.5s',
                  }}
                />
                <div
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    top: '75%',
                    left: '60%',
                    background: '#3B82F6',
                    boxShadow: '0 0 8px rgba(59,130,246,0.7), 0 0 16px rgba(59,130,246,0.3)',
                    animation: 'orb-breathe 4s ease-in-out infinite',
                    animationDelay: '2.5s',
                  }}
                />
              </div>

              {/* Orbiting dots */}
              <div className="absolute inset-0 animate-spin-slow pointer-events-none">
                <div
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    top: '0%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    background: '#00AEEF',
                    boxShadow: '0 0 8px rgba(0,174,239,0.6)',
                  }}
                />
              </div>
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ animation: 'spin-slow 20s linear infinite reverse' }}
              >
                <div
                  className="absolute w-1.5 h-1.5 rounded-full"
                  style={{
                    bottom: '0%',
                    left: '50%',
                    transform: 'translate(-50%, 50%)',
                    background: '#3B82F6',
                    boxShadow: '0 0 6px rgba(59,130,246,0.5)',
                  }}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

/* ──────────────────────────────────────────────
   Section 2: Trusted By
   ────────────────────────────────────────────── */
function TrustedBySection() {
  const logos = [
    'FitPro Alliance', 'AthleteX', 'GymTrack', 'CoreMetrics',
    'RepSync', 'FitTech Asia', 'BioLab', 'TrainIQ',
  ]

  return (
    <section
      className="relative py-16 overflow-hidden"
      style={{ background: '#030712' }}
    >
      <div className="mx-auto max-w-[1280px] section-pad-x">
        <p
          className="text-center text-[12px] font-medium uppercase tracking-[0.15em] mb-10"
          style={{ color: '#6B7280' }}
        >
          Trusted by leading fitness brands
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
          {logos.map((name) => (
            <span
              key={name}
              className="text-[16px] font-semibold tracking-[0.02em] opacity-40 hover:opacity-70 transition-opacity duration-300"
              style={{ color: '#D1D5DB' }}
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ──────────────────────────────────────────────
   Section 3: AI Showcase
   ────────────────────────────────────────────── */
const coachingCues = [
  "Client's squat depth improved 12% this week",
  "Recommend deload for Client 247 — HRV down 15%",
  "PR alert: Sarah hit a new 1RM on deadlifts!",
]

const skillIcons = [
  Dumbbell, Activity, Brain, HeartPulse,
  TrendingUp, MessageCircle, Calendar, BarChart3,
]

function AIShowcaseSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' })
  const [cueIndex, setCueIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCueIndex((prev) => (prev + 1) % coachingCues.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[100dvh] flex items-center overflow-hidden"
      style={{
        background: 'linear-gradient(to bottom, #030712, #111827)',
      }}
    >
      {/* Radial glow from center-bottom */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center bottom, rgba(0,174,239,0.1) 0%, transparent 60%)',
        }}
      />

      <div className="relative z-10 mx-auto max-w-[1280px] w-full section-pad-x py-20">
        <div className="grid grid-cols-1 lg:grid-cols-[45%_55%] gap-12 lg:gap-8 items-center">
          {/* Left Column - Text */}
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 1.0, ease: EASE_OUT_EXPO }}
          >
            <span
              className="text-[12px] font-medium uppercase tracking-[0.15em] mb-4 block"
              style={{ color: '#00AEEF' }}
            >
              Artificial Intelligence
            </span>
            <h2
              className="font-bold mb-6"
              style={{
                fontSize: 'clamp(36px, 3.5vw, 56px)',
                color: '#F9FAFB',
                letterSpacing: '-0.015em',
                lineHeight: 1.1,
              }}
            >
              AI That Coaches With You
            </h2>
            <p
              className="mb-8"
              style={{
                color: '#9CA3AF',
                fontSize: '16px',
                lineHeight: 1.7,
                maxWidth: '420px',
              }}
            >
              AzFIT's AI understands your programming philosophy, adapts to client
              feedback, and generates coaching cues in real time. It's not a chatbot —
              it's a coaching partner.
            </p>

            <ul className="space-y-4 mb-8">
              {[
                'Context-aware — knows the page you\'re on and the client you\'re viewing',
                'Drag-and-drop floating assistant, always within reach',
                'Learns your coaching style with every interaction',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <Check size={18} className="shrink-0 mt-0.5" style={{ color: '#00AEEF' }} />
                  <span style={{ color: '#D1D5DB', fontSize: '14px', lineHeight: 1.6 }}>
                    {item}
                  </span>
                </li>
              ))}
            </ul>

            <Link
              to="/features"
              className="gradient-azure text-[#F9FAFB] font-semibold text-[16px] px-8 py-4 rounded-lg shadow-glow-blue transition-all duration-200 hover:shadow-glow-blue-lg hover:scale-[1.03] active:scale-[0.97] inline-block"
            >
              Explore AI Features
            </Link>
          </motion.div>

          {/* Right Column - AI Coaching Assistant */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 1.2, ease: EASE_OUT_EXPO, delay: 0.2 }}
            className="flex items-center justify-center relative"
          >
            <div className="relative flex items-center justify-center" style={{ width: '360px', height: '360px' }}>
              {/* Pedestal shadow */}
              <div
                className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-8"
                style={{
                  width: '200px',
                  height: '30px',
                  background: 'radial-gradient(ellipse, rgba(0,174,239,0.08) 0%, transparent 70%)',
                  borderRadius: '50%',
                }}
              />

              {/* Pulse wave ripples */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div
                  className="absolute rounded-full border border-[rgba(0,174,239,0.15)]"
                  style={{
                    width: '320px',
                    height: '320px',
                    animation: 'pulse-ring 3s ease-out infinite',
                    animationDelay: '0s',
                  }}
                />
                <div
                  className="absolute rounded-full border border-[rgba(0,174,239,0.12)]"
                  style={{
                    width: '320px',
                    height: '320px',
                    animation: 'pulse-ring 3s ease-out infinite',
                    animationDelay: '1s',
                  }}
                />
                <div
                  className="absolute rounded-full border border-[rgba(0,174,239,0.08)]"
                  style={{
                    width: '320px',
                    height: '320px',
                    animation: 'pulse-ring 3s ease-out infinite',
                    animationDelay: '2s',
                  }}
                />
              </div>

              {/* Outer rotating ring */}
              <div
                className="absolute animate-spin-slow pointer-events-none"
                style={{
                  width: '280px',
                  height: '280px',
                  borderRadius: '50%',
                  border: '1px solid rgba(0, 174, 239, 0.15)',
                }}
              >
                {/* Skill icons positioned around the ring */}
                {skillIcons.map((Icon, i) => {
                  const angle = (i * 360) / skillIcons.length
                  const radius = 140
                  const x = Math.cos((angle * Math.PI) / 180) * radius
                  const y = Math.sin((angle * Math.PI) / 180) * radius
                  return (
                    <div
                      key={i}
                      className="absolute flex items-center justify-center rounded-full"
                      style={{
                        width: '48px',
                        height: '48px',
                        left: `calc(50% + ${x}px - 24px)`,
                        top: `calc(50% + ${y}px - 24px)`,
                        background: 'rgba(0, 174, 239, 0.08)',
                        animation: 'spin-slow 30s linear infinite reverse',
                      }}
                    >
                      <Icon size={22} style={{ color: '#00AEEF' }} />
                    </div>
                  )
                })}
              </div>

              {/* Central breathing orb */}
              <div
                className="relative rounded-full animate-orb-breathe flex items-center justify-center"
                style={{
                  width: '160px',
                  height: '160px',
                  background: 'radial-gradient(circle, rgba(0,174,239,0.2) 0%, transparent 70%)',
                  border: '2px solid rgba(0, 174, 239, 0.3)',
                }}
              >
                {/* Inner glow */}
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: 'radial-gradient(circle at 40% 40%, rgba(0,174,239,0.3) 0%, transparent 60%)',
                  }}
                />
                <Brain size={40} style={{ color: '#00AEEF', position: 'relative', zIndex: 2 }} />
              </div>

              {/* Floating coaching cue cards */}
              <div className="absolute inset-0 pointer-events-none">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={cueIndex}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.4, ease: EASE_SMOOTH }}
                    className="absolute"
                    style={{
                      top: '10%',
                      right: '-5%',
                      maxWidth: '200px',
                      padding: '12px 16px',
                      background: 'linear-gradient(135deg, rgba(17,24,39,0.8), rgba(31,41,55,0.6))',
                      border: '1px solid rgba(0,174,239,0.15)',
                      borderRadius: '8px',
                    }}
                  >
                    <p style={{ color: '#D1D5DB', fontSize: '13px', lineHeight: 1.5 }}>
                      {coachingCues[cueIndex]}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

/* ──────────────────────────────────────────────
   Section 4: Dashboard Experience (Data Stream)
   ────────────────────────────────────────────── */
function DashboardExperienceSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' })

  const row1 = "LOAD \u2022 VOLUME \u2022 INTENSITY \u2022 HR_ZONE \u2022 RECOVERY \u2022 STREAK \u2022 SYNC \u2022 COACH \u2022 CLIENT \u2022 PROGRESS \u2022 METRICS \u2022 PERFORMANCE \u2022 "
  const row2 = "AI_COACH \u2022 BIOPRINT \u2022 TDEE_CALC \u2022 WEARABLE \u2022 MACRO \u2022 SET \u2022 REP \u2022 REST \u2022 PERIODIZE \u2022 ANALYZE \u2022 PREDICT \u2022 RETAIN \u2022 "
  const row3 = "SESSION_01 \u2022 SESSION_02 \u2022 CLIENT_247 \u2022 CHECK_IN \u2022 STREAK_14 \u2022 GOAL_HIT \u2022 PR_SET \u2022 RECOVERY_95% \u2022 SLEEP_A \u2022 HRV_62 \u2022 "

  return (
    <section
      ref={sectionRef}
      className="relative section-pad-y overflow-hidden"
      style={{ background: '#111827' }}
    >
      <div className="mx-auto max-w-[1280px] section-pad-x mb-12">
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.98 }}
          animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 1.0, ease: EASE_OUT_EXPO }}
          className="text-center"
        >
          <span
            className="text-[12px] font-medium uppercase tracking-[0.15em] mb-4 block"
            style={{ color: '#00AEEF' }}
          >
            The Interface
          </span>
          <h2
            className="font-bold"
            style={{
              fontSize: 'clamp(36px, 3.5vw, 56px)',
              color: '#F9FAFB',
              letterSpacing: '-0.015em',
              lineHeight: 1.1,
            }}
          >
            A View Into Performance
          </h2>
        </motion.div>
      </div>

      {/* Data Stream */}
      <div className="relative edge-fade-mask">
        {/* Row 1 - scrolls left */}
        <div className="overflow-hidden mb-4">
          <motion.div
            className="whitespace-nowrap font-mono font-medium uppercase flex"
            style={{
              fontSize: 'clamp(14px, 1.2vw, 18px)',
              color: 'rgba(209, 213, 219, 0.4)',
              letterSpacing: '0.08em',
            }}
            animate={{ x: ['0%', '-50%'] }}
            transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
          >
            <span className="mr-0">{row1.repeat(6)}</span>
            <span>{row1.repeat(6)}</span>
          </motion.div>
        </div>

        {/* Row 2 - scrolls right */}
        <div className="overflow-hidden mb-4">
          <motion.div
            className="whitespace-nowrap font-mono font-medium uppercase flex"
            style={{
              fontSize: 'clamp(14px, 1.2vw, 18px)',
              color: 'rgba(209, 213, 219, 0.35)',
              letterSpacing: '0.08em',
            }}
            animate={{ x: ['-50%', '0%'] }}
            transition={{ duration: 45, repeat: Infinity, ease: 'linear' }}
          >
            <span className="mr-0">{row2.repeat(6)}</span>
            <span>{row2.repeat(6)}</span>
          </motion.div>
        </div>

        {/* Row 3 - scrolls left slower */}
        <div className="overflow-hidden">
          <motion.div
            className="whitespace-nowrap font-mono font-medium uppercase flex"
            style={{
              fontSize: 'clamp(14px, 1.2vw, 18px)',
              color: 'rgba(209, 213, 219, 0.3)',
              letterSpacing: '0.08em',
            }}
            animate={{ x: ['0%', '-50%'] }}
            transition={{ duration: 55, repeat: Infinity, ease: 'linear' }}
          >
            <span className="mr-0">{row3.repeat(8)}</span>
            <span>{row3.repeat(8)}</span>
          </motion.div>
        </div>
      </div>

      {/* Dashboard Mockup Overlay */}
      <motion.div
        initial={{ opacity: 0, y: 60, scale: 0.98 }}
        animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
        transition={{ duration: 1.0, ease: EASE_OUT_EXPO, delay: 0.3 }}
        className="relative mx-auto max-w-[900px] mt-[-60px] z-10 section-pad-x"
      >
        <div
          className="relative rounded-xl overflow-hidden"
          style={{
            aspectRatio: '16/9',
            background: 'linear-gradient(135deg, rgba(17,24,39,0.95), rgba(31,41,55,0.9))',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(0, 174, 239, 0.08)',
          }}
        >
          {/* Dashboard Header */}
          <div
            className="flex items-center justify-between px-6 py-4"
            style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}
          >
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full" style={{ background: '#EF4444' }} />
              <div className="w-3 h-3 rounded-full" style={{ background: '#F59E0B' }} />
              <div className="w-3 h-3 rounded-full" style={{ background: '#10B981' }} />
            </div>
            <span className="font-mono text-[12px]" style={{ color: '#6B7280' }}>
              AzFIT Dashboard
            </span>
          </div>

          {/* Dashboard Content - KPI Cards */}
          <div className="grid grid-cols-3 gap-4 p-6">
            {[
              { label: 'Active Clients', value: '24', change: '+3 this week', color: '#00AEEF' },
              { label: 'Workouts This Week', value: '156', change: '+12% vs last', color: '#10B981' },
              { label: 'Avg Compliance', value: '87%', change: '+5% vs last', color: '#F59E0B' },
            ].map((kpi) => (
              <div
                key={kpi.label}
                className="rounded-lg p-4"
                style={{
                  background: 'rgba(31, 41, 55, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                }}
              >
                <p className="text-[11px] font-medium uppercase tracking-[0.04em] mb-2" style={{ color: '#9CA3AF' }}>
                  {kpi.label}
                </p>
                <p className="font-mono text-[28px] font-bold mb-1" style={{ color: kpi.color }}>
                  {kpi.value}
                </p>
                <p className="text-[11px]" style={{ color: '#6B7280' }}>
                  {kpi.change}
                </p>
              </div>
            ))}
          </div>

          {/* Mini chart area */}
          <div className="px-6 pb-6">
            <div
              className="rounded-lg p-4"
              style={{
                background: 'rgba(31, 41, 55, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              <p className="text-[11px] font-medium uppercase tracking-[0.04em] mb-3" style={{ color: '#9CA3AF' }}>
                Weekly Volume Trend
              </p>
              <div className="flex items-end gap-2 h-[80px]">
                {[40, 55, 45, 70, 60, 85, 75].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t-sm transition-all duration-300 hover:opacity-80"
                    style={{
                      height: `${h}%`,
                      background: i === 5
                        ? 'linear-gradient(to top, #00AEEF, #3B82F6)'
                        : 'rgba(0, 174, 239, 0.25)',
                    }}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-2">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
                  <span key={d} className="text-[10px] font-mono" style={{ color: '#6B7280' }}>
                    {d}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  )
}

/* ──────────────────────────────────────────────
   Section 5: Feature Grid
   ────────────────────────────────────────────── */
const features = [
  {
    icon: Dumbbell,
    title: 'AI-Powered Programming',
    description: 'Generate personalized programs in seconds with AI-assisted exercise selection, volume optimization, and periodization.',
  },
  {
    icon: Scan,
    title: 'BioPrint Assessment',
    description: 'Track 7-site body composition with digital skinfold logging and trend visualization.',
  },
  {
    icon: Apple,
    title: 'Smart Nutrition',
    description: 'TDEE, macros, and meal tracking. Auto-calculate metabolic needs and deliver precise macro targets.',
  },
  {
    icon: Users,
    title: 'Client Management',
    description: 'Complete client profiles, progress tracking, and engagement analytics all in one place.',
  },
  {
    icon: Calendar,
    title: 'Calendar',
    description: 'Schedule sessions, set reminders, and manage your training calendar all in one place.',
  },
  {
    icon: BarChart3,
    title: 'Analytics',
    description: 'Revenue, retention, and growth insights. Machine learning flags at-risk clients before they churn.',
  },
]

function FeatureGridSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' })

  return (
    <section
      ref={sectionRef}
      className="relative section-pad-y noise-overlay"
      style={{ background: '#030712' }}
    >
      <div className="relative z-10 mx-auto max-w-[1280px] section-pad-x">
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.98 }}
          animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 1.0, ease: EASE_OUT_EXPO }}
          className="text-center mb-16"
        >
          <span
            className="text-[12px] font-medium uppercase tracking-[0.15em] mb-4 block"
            style={{ color: '#00AEEF' }}
          >
            Platform
          </span>
          <h2
            className="font-bold mb-4"
            style={{
              fontSize: 'clamp(36px, 3.5vw, 56px)',
              color: '#F9FAFB',
              letterSpacing: '-0.015em',
              lineHeight: 1.1,
            }}
          >
            Scroll. Sync. Transform.
          </h2>
          <p
            className="mx-auto"
            style={{
              color: '#9CA3AF',
              fontSize: '16px',
              maxWidth: '560px',
              lineHeight: 1.6,
            }}
          >
            Every feature engineered to remove friction from the coaching workflow.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, ease: EASE_OUT_EXPO, delay: 0.12 * i }}
              className="group glass-card p-6 transition-all duration-300 hover:-translate-y-1"
              style={{
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(0, 174, 239, 0.3)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
              }}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
                style={{ background: 'rgba(0, 174, 239, 0.1)' }}
              >
                <feature.icon size={22} style={{ color: '#00AEEF' }} />
              </div>
              <h3
                className="text-[18px] font-semibold mb-2"
                style={{ color: '#F9FAFB', letterSpacing: '-0.01em' }}
              >
                {feature.title}
              </h3>
              <p
                className="text-[14px] leading-relaxed"
                style={{ color: '#9CA3AF' }}
              >
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ──────────────────────────────────────────────
   Section 6: Testimonials
   ────────────────────────────────────────────── */
const testimonials = [
  {
    avatar: '/avatar-1.jpg',
    quote: 'AzFIT cut my program design time by 70%. The AI suggestions are scarily good \u2014 it knows my style better than I do.',
    name: 'Marcus Chen',
    role: 'Strength Coach, Hong Kong',
  },
  {
    avatar: '/avatar-2.jpg',
    quote: "The wearable sync changed everything. My clients finally see how their recovery data connects to their training.",
    name: 'Sarah Lim',
    role: 'Performance Coach, Singapore',
  },
  {
    avatar: '/avatar-3.jpg',
    quote: "I've tried every platform on the market. AzFIT is the only one that actually feels built for coaches, not just adapted from a consumer app.",
    name: 'David Park',
    role: 'Private Trainer, Seoul',
  },
]

function TestimonialsSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' })

  return (
    <section
      ref={sectionRef}
      className="relative section-pad-y noise-overlay"
      style={{ background: '#030712' }}
    >
      {/* Noise is slightly lighter for testimonials */}
      <style>{`.noise-overlay::before { opacity: 0.02 !important; }`}</style>

      <div className="relative z-10 mx-auto max-w-[1280px] section-pad-x">
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.98 }}
          animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 1.0, ease: EASE_OUT_EXPO }}
          className="text-center mb-16"
        >
          <span
            className="text-[12px] font-medium uppercase tracking-[0.15em] mb-4 block"
            style={{ color: '#00AEEF' }}
          >
            Testimonials
          </span>
          <h2
            className="font-bold mb-4"
            style={{
              fontSize: 'clamp(36px, 3.5vw, 56px)',
              color: '#F9FAFB',
              letterSpacing: '-0.015em',
              lineHeight: 1.1,
            }}
          >
            Built for the Best
          </h2>
          <p
            className="mx-auto"
            style={{
              color: '#9CA3AF',
              fontSize: '16px',
              maxWidth: '560px',
              lineHeight: 1.6,
            }}
          >
            Hear from coaches who've transformed their business with AzFIT.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, ease: EASE_OUT_EXPO, delay: 0.15 * i }}
              className="p-8"
              style={{
                background: 'linear-gradient(135deg, rgba(17,24,39,0.8), rgba(31,41,55,0.6))',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '12px',
              }}
            >
              {/* Stars */}
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, si) => (
                  <Star key={si} size={16} fill="#00AEEF" style={{ color: '#00AEEF' }} />
                ))}
              </div>

              {/* Quote */}
              <p
                className="text-[16px] leading-relaxed mb-6 italic"
                style={{ color: '#F9FAFB' }}
              >
                "{t.quote}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-14 h-14 rounded-full object-cover"
                  style={{ border: '2px solid #00AEEF' }}
                />
                <div>
                  <p className="text-[16px] font-semibold" style={{ color: '#D1D5DB' }}>
                    {t.name}
                  </p>
                  <p className="text-[14px]" style={{ color: '#9CA3AF' }}>
                    {t.role}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ──────────────────────────────────────────────
   Section 7: CTA
   ────────────────────────────────────────────── */
function CTASection() {
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' })

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden"
      style={{
        background: 'linear-gradient(to bottom, #111827, #030712)',
        padding: 'clamp(6rem, 10vh, 10rem) clamp(1rem, 4vw, 4rem)',
      }}
    >
      {/* Radial glow */}
      <div
        className="absolute inset-0 pointer-events-none animate-glow-pulse"
        style={{
          background: 'radial-gradient(circle at center, rgba(0,174,239,0.05) 0%, transparent 50%)',
        }}
      />

      <div className="relative z-10 mx-auto max-w-[720px] text-center">
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: EASE_OUT_EXPO }}
          className="font-bold mb-6"
          style={{
            fontSize: 'clamp(36px, 3.5vw, 56px)',
            color: '#F9FAFB',
            letterSpacing: '-0.015em',
            lineHeight: 1.1,
          }}
        >
          Ready to Transform Your Coaching?
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: EASE_OUT_EXPO, delay: 0.1 }}
          className="mb-8 mx-auto"
          style={{
            color: '#9CA3AF',
            fontSize: '16px',
            maxWidth: '520px',
            lineHeight: 1.6,
          }}
        >
          Join 500+ coaches already using AzFIT. Start your free 14-day trial today —
          no credit card required.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: EASE_OUT_EXPO, delay: 0.2 }}
          className="flex flex-wrap items-center justify-center gap-4 mb-6"
        >
          <Link
            to="/pricing"
            className="gradient-azure text-[#F9FAFB] font-semibold text-[18px] px-10 py-5 rounded-lg shadow-glow-blue transition-all duration-200 hover:shadow-glow-blue-lg hover:scale-[1.03] active:scale-[0.97]"
          >
            Start Free Trial
          </Link>
          <Link
            to="/pricing"
            className="border font-medium text-[16px] px-8 py-4 rounded-lg transition-all duration-200 hover:scale-[1.02]"
            style={{
              borderColor: '#00AEEF',
              color: '#00AEEF',
              background: 'transparent',
            }}
          >
            View Pricing
          </Link>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, ease: EASE_OUT_EXPO, delay: 0.3 }}
          className="text-[12px] font-medium uppercase tracking-[0.04em]"
          style={{ color: '#9CA3AF' }}
        >
          Free for 14 days &bull; Cancel anytime &bull; Full feature access
        </motion.p>
      </div>
    </section>
  )
}

/* ──────────────────────────────────────────────
   Home Page Assembly
   ────────────────────────────────────────────── */
export default function Home() {
  return (
    <div>
      <HeroSection />
      <TrustedBySection />
      <AIShowcaseSection />
      <DashboardExperienceSection />
      <FeatureGridSection />
      <TestimonialsSection />
      <CTASection />
    </div>
  )
}
