import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import {
  ArrowRight,
  Play,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Quote,
  TrendingUp,
  Dumbbell,
  Apple,
  BarChart3,
} from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

/* ─────────────────────── easing helper ─────────────────────── */
const ease = [0.16, 1, 0.3, 1] as [number, number, number, number]

/* ═════════════════════════ HERO ═════════════════════════ */

function HeroParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    const particles: {
      x: number; y: number; r: number; speedY: number; speedX: number; opacity: number
    }[] = []

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio
      canvas.height = canvas.offsetHeight * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }

    const initParticles = () => {
      particles.length = 0
      const w = canvas.offsetWidth
      const h = canvas.offsetHeight
      for (let i = 0; i < 50; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: 1.5 + Math.random() * 2.5,
          speedY: -0.3 - Math.random() * 0.4,
          speedX: (Math.random() - 0.5) * 0.3,
          opacity: 0.15 + Math.random() * 0.25,
        })
      }
    }

    const draw = () => {
      const w = canvas.offsetWidth
      const h = canvas.offsetHeight
      ctx.clearRect(0, 0, w, h)

      particles.forEach((p) => {
        p.y += p.speedY
        p.x += p.speedX
        if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w }
        if (p.x < -10) p.x = w + 10
        if (p.x > w + 10) p.x = -10

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(0, 174, 239, ${p.opacity})`
        ctx.fill()
      })

      animId = requestAnimationFrame(draw)
    }

    resize()
    initParticles()
    draw()

    window.addEventListener('resize', () => { resize(); initParticles() })

    return () => cancelAnimationFrame(animId)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 2 }}
    />
  )
}

function Hero() {
  return (
    <section className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/hero-bg.jpg)' }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, rgba(10,10,10,0.95) 0%, rgba(20,20,20,0.85) 50%, rgba(0,174,239,0.15) 100%)',
          }}
        />
        {/* Animated gradient blobs */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at 20% 50%, rgba(0,174,239,0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(139,92,246,0.06) 0%, transparent 50%)',
          }}
        />
        {/* Noise overlay */}
        <div className="noise-overlay noise-overlay-light" />
      </div>

      {/* Particles */}
      <HeroParticles />

      {/* Content */}
      <div className="relative z-10 max-w-[800px] mx-auto px-4 sm:px-6 text-center pt-16">
        {/* Eyebrow */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4, ease }}
          className="font-mono text-xs text-[#00AEEF] uppercase tracking-[0.15em] mb-6"
        >
          AzTechFit Hong Kong Presents
        </motion.p>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.6, ease }}
          className="font-playfair text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.05] tracking-[-0.03em] mb-6"
          style={{ textShadow: '0 2px 40px rgba(0,0,0,0.5)' }}
        >
          Science-Based Training,{' '}
          <br className="hidden sm:block" />
          Beautifully Organized
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5, ease }}
          className="text-[#A0A0A0] text-base sm:text-lg max-w-[560px] mx-auto mb-8 leading-relaxed"
        >
          The complete client management platform for personal trainers. Track progress, design programs, manage nutrition — all in one place.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.5, ease }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8"
        >
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 bg-[#00AEEF] hover:bg-[#009BD6] text-white font-semibold px-7 py-3.5 rounded-xl transition-all duration-200 hover:scale-[1.02] hover:shadow-lg text-sm"
          >
            Start Free Trial
            <ArrowRight size={16} />
          </Link>
          <button
            onClick={() => alert('Demo video coming soon!')}
            className="inline-flex items-center gap-2 text-[#A0A0A0] hover:text-[#F0F0F0] font-medium px-7 py-3.5 rounded-xl border border-[#2A2A2A] hover:bg-[#1A1A1A] transition-all duration-200 text-sm"
          >
            <Play size={16} className="fill-current" />
            Watch Demo
          </button>
        </motion.div>

        {/* Stats Preview */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5, ease }}
          className="text-[#6B6B6B] text-sm"
        >
          Trusted by 116+ clients across Hong Kong
        </motion.p>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.0, duration: 0.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown size={24} className="text-[#6B6B6B]" />
        </motion.div>
      </motion.div>
    </section>
  )
}

/* ═══════════════════════ STATS BAR ═══════════════════════ */

const stats = [
  { value: 116, suffix: '+', label: 'Active Clients' },
  { value: 11, suffix: '+', label: 'Expert Trainers' },
  { value: 2333, suffix: '+', label: 'Sessions Completed' },
  { value: 22, suffix: '%', label: 'Avg. Improvement' },
]

function AnimatedCounter({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.5 })

  useEffect(() => {
    if (!inView) return
    let start = 0
    const duration = 1500
    const startTime = performance.now()

    const tick = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Ease-out
      const eased = 1 - Math.pow(1 - progress, 3)
      start = Math.round(eased * target)
      setCount(start)
      if (progress < 1) requestAnimationFrame(tick)
    }

    requestAnimationFrame(tick)
  }, [inView, target])

  return (
    <span ref={ref} className="font-mono text-3xl sm:text-4xl font-bold text-[#111827] tabular-nums">
      {count.toLocaleString()}{suffix}
    </span>
  )
}

function StatsBar() {
  return (
    <section className="bg-[#F8F9FA] border-t border-[#E5E7EB] py-12 sm:py-16">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: i * 0.15, duration: 0.5, ease }}
              className={`flex flex-col items-center text-center ${
                i < stats.length - 1 ? 'lg:border-r lg:border-[#E5E7EB]' : ''
              }`}
            >
              <AnimatedCounter target={stat.value} suffix={stat.suffix} />
              <span className="text-[#6B7280] text-sm mt-2">{stat.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════ FEATURES GRID ═══════════════════ */

const features = [
  {
    image: '/landing-feature-1.jpg',
    icon: <BarChart3 size={24} className="text-[#00AEEF]" />,
    title: 'Progress Tracking',
    description: 'Track every metric that matters — body composition, strength gains, measurements, and photos. Visualize progress with beautiful charts and spot trends at a glance.',
    items: ['Body composition analysis', 'Progress photo timeline', 'Strength & performance logs', 'Automated trend detection'],
  },
  {
    image: '/landing-feature-2.jpg',
    icon: <Dumbbell size={24} className="text-[#8B5CF6]" />,
    title: 'Program Design',
    description: 'Build science-based training programs with our intelligent wizard. Select goals, methods, and exercises — the system handles periodization, progression, and recovery.',
    items: ['8-step program wizard', '200+ exercise database', '84 training methods', 'Auto-generated progression'],
  },
  {
    image: '/landing-feature-3.jpg',
    icon: <Apple size={24} className="text-[#22C55E]" />,
    title: 'Nutrition Management',
    description: 'Calculate TDEE, set macro targets, plan meals, and track adherence. With a 120-item food database and water/supplement tracking, nutrition has never been simpler.',
    items: ['Mifflin-St Jeor TDEE calculator', 'Macro ring visualization', 'Meal planner with food database', 'Water & supplement tracking'],
  },
]

function FeaturesGrid() {
  return (
    <section id="features" className="bg-white py-20 lg:py-24">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease }}
            className="font-mono text-xs text-[#00AEEF] uppercase tracking-[0.1em] mb-4"
          >
            Features
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.5, ease }}
            className="font-playfair text-3xl sm:text-4xl font-bold text-[#111827] mb-4"
          >
            Everything You Need to Train Smarter
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5, ease }}
            className="text-[#6B7280] text-base sm:text-lg max-w-[640px] mx-auto"
          >
            A complete toolkit for modern personal training management
          </motion.p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: i * 0.15, duration: 0.5, ease }}
              className="group bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] hover:border-[rgba(0,174,239,0.2)] transition-all duration-300"
            >
              {/* Image */}
              <div className="h-[200px] overflow-hidden">
                <img
                  src={feature.image}
                  alt={feature.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Icon overlapping image */}
              <div className="relative px-6">
                <div className="absolute -top-6 left-6 w-12 h-12 bg-white rounded-full border border-[#E5E7EB] flex items-center justify-center shadow-sm">
                  {feature.icon}
                </div>
              </div>

              {/* Content */}
              <div className="px-6 pt-8 pb-6">
                <h3 className="font-semibold text-xl text-[#111827] mb-2">{feature.title}</h3>
                <p className="text-[#6B7280] text-sm leading-relaxed mb-4">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-[#374151]">
                      <Check size={16} className="text-[#22C55E] flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════ HOW IT WORKS ═══════════════════ */

const steps = [
  {
    number: '01',
    title: 'Sign Up & Connect',
    description: 'Create your account and connect with your trainer. Set your goals, share your history, and get matched with the perfect program.',
    icon: <TrendingUp size={20} className="text-white" />,
  },
  {
    number: '02',
    title: 'Initial Assessment',
    description: 'Complete a comprehensive assessment including BioPrint, body stats, lifestyle questionnaire, and fitness testing. Your trainer uses this data to build your personalized plan.',
    icon: <BarChart3 size={20} className="text-white" />,
  },
  {
    number: '03',
    title: 'Receive Your Program',
    description: 'Your trainer designs a tailored training program and nutrition plan based on your goals, schedule, and assessment data. Everything is delivered through the platform.',
    icon: <Dumbbell size={20} className="text-white" />,
  },
  {
    number: '04',
    title: 'Track & Improve',
    description: 'Log workouts, track nutrition, upload progress photos, and monitor your metrics. AI-powered insights help your trainer make data-driven adjustments for continuous improvement.',
    icon: <TrendingUp size={20} className="text-white" />,
  },
]

function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-[#F8F9FA] py-20 lg:py-24">
      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease }}
            className="font-mono text-xs text-[#00AEEF] uppercase tracking-[0.1em] mb-4"
          >
            How It Works
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.5, ease }}
            className="font-playfair text-3xl sm:text-4xl font-bold text-[#111827]"
          >
            Your Journey to Better Results
          </motion.h2>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Center line - desktop */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-[#E5E7EB] -translate-x-1/2" />

          {/* Mobile line */}
          <div className="md:hidden absolute left-4 top-0 bottom-0 w-0.5 bg-[#E5E7EB]" />

          {steps.map((step, i) => {
            const isLeft = i % 2 === 0
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: i * 0.2, duration: 0.5, ease }}
                className="relative flex items-start mb-12 last:mb-0"
              >
                {/* Desktop layout: alternating left/right */}
                <div className="hidden md:grid md:grid-cols-2 md:gap-8 md:w-full md:items-start">
                  {/* Left side */}
                  <div className={`${isLeft ? 'text-right pr-8' : 'col-start-2 pl-8'}`}>
                    <div className={`inline-flex flex-col ${isLeft ? 'items-end' : 'items-start'}`}>
                      <div className="bg-white rounded-xl p-6 shadow-[0_4px_16px_rgba(0,0,0,0.06)] border border-[#E5E7EB] max-w-[380px]">
                        <h3 className="font-semibold text-lg text-[#111827] mb-2">{step.title}</h3>
                        <p className="text-[#6B7280] text-sm leading-relaxed">{step.description}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mobile card */}
                <div className="md:hidden ml-12 mr-0">
                  <div className="bg-white rounded-xl p-5 shadow-[0_4px_16px_rgba(0,0,0,0.06)] border border-[#E5E7EB]">
                    <h3 className="font-semibold text-base text-[#111827] mb-1.5">{step.title}</h3>
                    <p className="text-[#6B7280] text-sm leading-relaxed">{step.description}</p>
                  </div>
                </div>

                {/* Number circle */}
                <div
                  className="absolute left-4 md:left-1/2 w-12 h-12 rounded-full bg-[#00AEEF] flex items-center justify-center z-10 md:-translate-x-1/2"
                >
                  <span className="font-mono text-white text-sm font-bold">{step.number}</span>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════ ROLE CARDS ═══════════════════ */

function RoleCards() {
  return (
    <section id="pricing" className="bg-white py-20 lg:py-24">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease }}
            className="font-mono text-xs text-[#00AEEF] uppercase tracking-[0.1em] mb-4"
          >
            For Everyone
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.5, ease }}
            className="font-playfair text-3xl sm:text-4xl font-bold text-[#111827]"
          >
            Built for Trainers & Clients
          </motion.h2>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Trainer Card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.5, ease }}
            className="group relative min-h-[480px] rounded-[20px] overflow-hidden cursor-pointer"
          >
            <img
              src="/trainer-role-card.jpg"
              alt="Trainer"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-600"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[rgba(10,10,10,0.85)] via-[rgba(10,10,10,0.3)] to-transparent" />
            <div className="relative h-full min-h-[480px] flex flex-col justify-end p-8 sm:p-10">
              <span className="inline-block self-start px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider text-[#00AEEF] bg-[rgba(0,174,239,0.15)] mb-4">
                For Trainers
              </span>
              <h3 className="font-playfair text-2xl sm:text-3xl font-bold text-white mb-3">
                Elevate Your Training Business
              </h3>
              <p className="text-[rgba(255,255,255,0.8)] text-sm sm:text-base leading-relaxed mb-6 max-w-[400px]">
                Manage clients, design science-based programs, track progress, and grow your business — all from one powerful dashboard.
              </p>
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 self-start bg-[#00AEEF] hover:bg-[#009BD6] text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 hover:scale-[1.02] text-sm"
              >
                Join as Trainer
                <ArrowRight size={16} />
              </Link>
            </div>
          </motion.div>

          {/* Client Card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ delay: 0.2, duration: 0.5, ease }}
            className="group relative min-h-[480px] rounded-[20px] overflow-hidden cursor-pointer"
          >
            <img
              src="/client-role-card.jpg"
              alt="Client"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-600"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[rgba(10,10,10,0.85)] via-[rgba(10,10,10,0.3)] to-transparent" />
            <div className="relative h-full min-h-[480px] flex flex-col justify-end p-8 sm:p-10">
              <span className="inline-block self-start px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider text-[#00AEEF] bg-[rgba(0,174,239,0.15)] mb-4">
                For Clients
              </span>
              <h3 className="font-playfair text-2xl sm:text-3xl font-bold text-white mb-3">
                Achieve Your Fitness Goals
              </h3>
              <p className="text-[rgba(255,255,255,0.8)] text-sm sm:text-base leading-relaxed mb-6 max-w-[400px]">
                Get personalized programs, track your nutrition, monitor progress with photos and metrics, and stay connected with your trainer.
              </p>
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 self-start bg-white hover:bg-[#F0F0F0] text-[#111827] font-semibold px-6 py-3 rounded-xl transition-all duration-200 hover:scale-[1.02] text-sm"
              >
                Join as Client
                <ArrowRight size={16} />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════ TESTIMONIALS ═══════════════════ */

const testimonials = [
  {
    quote: 'AzFIT transformed how I manage my clients. The program wizard saves me hours every week, and my clients love tracking their progress visually.',
    name: 'Azwar H.',
    role: 'Head Trainer, AzTechFit',
    avatar: '/Azwar_Profile.jpg',
  },
  {
    quote: "Finally, a platform that understands what personal trainers actually need. The nutrition tracking alone has improved my clients' adherence by 40%.",
    name: 'Sarah L.',
    role: 'Personal Trainer',
    avatar: '/testimonial-1.jpg',
  },
  {
    quote: "I've seen a 22% improvement in my body composition in just 3 months. Having everything — workouts, nutrition, photos — in one place keeps me accountable.",
    name: 'Michael T.',
    role: 'AzFIT Client',
    avatar: '/testimonial-2.jpg',
  },
  {
    quote: 'The BioPrint integration and progress photo comparison tools are game-changers. My clients can finally see the changes they\'ve been working so hard for.',
    name: 'Jennifer W.',
    role: 'Senior Trainer',
    avatar: '/testimonial-3.jpg',
  },
]

function Testimonials() {
  const [current, setCurrent] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % testimonials.length)
  }, [])

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }, [])

  useEffect(() => {
    if (!isAutoPlaying) return
    const timer = setInterval(next, 5000)
    return () => clearInterval(timer)
  }, [isAutoPlaying, next])

  return (
    <section className="bg-[#F8F9FA] py-20 lg:py-24">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease }}
            className="font-mono text-xs text-[#00AEEF] uppercase tracking-[0.1em] mb-4"
          >
            Testimonials
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.5, ease }}
            className="font-playfair text-3xl sm:text-4xl font-bold text-[#111827]"
          >
            What Our Clients Say
          </motion.h2>
        </div>

        {/* Carousel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease }}
          className="relative"
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
        >
          {/* Prev/Next arrows */}
          <button
            onClick={prev}
            className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 lg:-translate-x-6 w-12 h-12 rounded-full bg-white border border-[#E5E7EB] items-center justify-center text-[#6B7280] hover:text-[#111827] hover:bg-[#F1F3F5] transition-colors z-10"
            aria-label="Previous testimonial"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={next}
            className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 lg:translate-x-6 w-12 h-12 rounded-full bg-white border border-[#E5E7EB] items-center justify-center text-[#6B7280] hover:text-[#111827] hover:bg-[#F1F3F5] transition-colors z-10"
            aria-label="Next testimonial"
          >
            <ChevronRight size={20} />
          </button>

          {/* Cards container */}
          <div className="overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.4, ease }}
                className="bg-white border border-[#E5E7EB] rounded-2xl p-8 sm:p-10 min-h-[280px] flex flex-col justify-between"
              >
                <div>
                  <Quote size={48} className="text-[#00AEEF] opacity-10 mb-4" />
                  <p className="text-[#111827] text-base sm:text-lg italic leading-relaxed">
                    "{testimonials[current].quote}"
                  </p>
                </div>

                <div className="flex items-center gap-4 mt-8">
                  <img
                    src={testimonials[current].avatar}
                    alt={testimonials[current].name}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-[#111827]">{testimonials[current].name}</p>
                    <p className="text-sm text-[#6B7280]">{testimonials[current].role}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Dots */}
          <div className="flex items-center justify-center gap-2 mt-6">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                  i === current ? 'bg-[#00AEEF]' : 'bg-[#E5E7EB] hover:bg-[#D1D5DB]'
                }`}
                aria-label={`Go to testimonial ${i + 1}`}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

/* ═══════════════════ CTA BANNER ═══════════════════ */

function CTABanner() {
  return (
    <section className="relative bg-[#0A0A0A] py-24 lg:py-32 overflow-hidden">
      {/* Gradient overlay */}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(90deg, #00AEEF 0%, #8B5CF6 100%)', opacity: 0.15 }}
      />
      {/* Noise */}
      <div className="noise-overlay noise-overlay-light" />

      <div className="relative z-10 max-w-[700px] mx-auto px-4 sm:px-6 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, ease }}
          className="font-playfair text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6"
        >
          Ready to Transform Your Training?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ delay: 0.15, duration: 0.5, ease }}
          className="text-[#A0A0A0] text-base sm:text-lg max-w-[520px] mx-auto mb-8"
        >
          Join 116+ clients and 11+ trainers already using AzFIT to achieve better results. Start your free trial today — no credit card required.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ delay: 0.3, duration: 0.5, ease: [0.175, 0.885, 0.32, 1.275] as [number, number, number, number] }}
        >
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 bg-[#00AEEF] hover:bg-[#009BD6] text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200 hover:scale-[1.02] text-sm animate-pulseGlow"
            style={{ boxShadow: '0 4px 24px rgba(0,174,239,0.3)' }}
          >
            Get Started Free
            <ArrowRight size={16} />
          </Link>
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-[#6B6B6B] text-sm mt-6"
        >
          Free 14-day trial · No credit card required
        </motion.p>
      </div>
    </section>
  )
}

/* ═══════════════════ LANDING PAGE ═══════════════════ */

export default function LandingPage() {
  return (
    <div className="bg-[#0A0A0A]">
      <Navbar />
      <main>
        <Hero />
        <StatsBar />
        <FeaturesGrid />
        <HowItWorks />
        <RoleCards />
        <Testimonials />
        <CTABanner />
      </main>
      <Footer />
    </div>
  )
}
