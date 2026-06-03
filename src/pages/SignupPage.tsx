import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { UserPlus, Eye, EyeOff } from 'lucide-react'
import { registerCoach, getAuthToken, simpleHash } from '@/lib/auth'
import { toast } from 'sonner'

const easeOut = [0.16, 1, 0.3, 1] as [number, number, number, number]

const SPECIALTIES = ['Strength', 'Hypertrophy', 'Fat Loss', 'Athletic', 'Rehab', 'General']

export default function SignupPage() {
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [specialty, setSpecialty] = useState('')
  const [yearsExperience, setYearsExperience] = useState('')
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const token = getAuthToken()
    if (token) {
      navigate('/dashboard')
    }
  }, [navigate])

  const validateForm = (): string | null => {
    if (!fullName.trim() || fullName.trim().length < 2) {
      return 'Full name must be at least 2 characters'
    }
    if (!email.trim()) {
      return 'Email is required'
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address'
    }
    if (!password) {
      return 'Password is required'
    }
    if (password.length < 8) {
      return 'Password must be at least 8 characters'
    }
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least 1 uppercase letter'
    }
    if (!/[0-9]/.test(password)) {
      return 'Password must contain at least 1 number'
    }
    if (password !== confirmPassword) {
      return 'Passwords do not match'
    }
    if (!agreeTerms) {
      return 'You must agree to the Terms of Service and Privacy Policy'
    }
    return null
  }

  const handleCreateAccount = async () => {
    const error = validateForm()
    if (error) {
      toast.error(error)
      return
    }

    setIsLoading(true)

    const coach = await registerCoach({
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      passwordHash: simpleHash(password),
      businessName: businessName.trim(),
      specialty: specialty || 'General',
      yearsExperience: yearsExperience ? parseInt(yearsExperience, 10) : 0,
      lastLogin: new Date().toISOString(),
      settings: {
        theme: 'dark' as const,
        unitSystem: 'metric' as const,
        defaultSessionDuration: 60,
      },
    })

    setIsLoading(false)

    if (!coach) {
      toast.error('An account with this email already exists')
      return
    }

    toast.success(`Welcome to AzFIT, ${coach.fullName}!`)
    navigate('/dashboard')
  }

  const inputClasses =
    'w-full bg-gray-100 dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2A2A2A] rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-[#F0F0F0] placeholder:text-gray-400 dark:placeholder:text-[#6B6B6B] focus:outline-none focus:border-[#00AEEF] focus:ring-1 focus:ring-[rgba(0,174,239,0.15)] transition-all'

  return (
    <div className="min-h-[100dvh] bg-[#0A0A0A] flex items-center justify-center p-4">
      {/* Ambient glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-[rgba(0,174,239,0.04)] blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] rounded-full bg-[rgba(139,92,246,0.03)] blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: easeOut }}
        className="w-full max-w-[440px] relative z-10"
      >
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: easeOut }}
          className="text-center mb-8"
        >
          <Link to="/" className="inline-block">
            <img
              src="./AzFIT_Logo_WhiteBackground_Text.png"
              alt="AzFIT"
              className="h-10 w-auto brightness-0 invert mx-auto mb-6"
            />
          </Link>
          <h1 className="font-playfair text-3xl font-bold text-gray-900 dark:text-[#F0F0F0] mb-2">
            Create your account
          </h1>
          <p className="text-gray-500 dark:text-[#A0A0A0] text-sm">
            Join AzFIT and start training smarter
          </p>
        </motion.div>

        {/* Signup Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: easeOut }}
          className="bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-[#2A2A2A] rounded-2xl p-6 sm:p-8"
        >
          <div className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-gray-500 dark:text-[#A0A0A0] text-sm mb-2">Full Name <span className="text-[#EF4444]">*</span></label>
              <input
                type="text"
                placeholder="Your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={inputClasses}
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-gray-500 dark:text-[#A0A0A0] text-sm mb-2">Email <span className="text-[#EF4444]">*</span></label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClasses}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-gray-500 dark:text-[#A0A0A0] text-sm mb-2">Password <span className="text-[#EF4444]">*</span></label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min 8 chars, 1 uppercase, 1 number"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${inputClasses} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#6B6B6B] hover:text-gray-500 dark:hover:text-[#A0A0A0] transition-colors p-0.5"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-gray-500 dark:text-[#A0A0A0] text-sm mb-2">Confirm Password <span className="text-[#EF4444]">*</span></label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`${inputClasses} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#6B6B6B] hover:text-gray-500 dark:hover:text-[#A0A0A0] transition-colors p-0.5"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Business/Studio Name */}
            <div>
              <label className="block text-gray-500 dark:text-[#A0A0A0] text-sm mb-2">Business / Studio Name <span className="text-gray-400 dark:text-[#6B6B6B]">(optional)</span></label>
              <input
                type="text"
                placeholder="Your business name"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className={inputClasses}
              />
            </div>

            {/* Specialty */}
            <div>
              <label className="block text-gray-500 dark:text-[#A0A0A0] text-sm mb-2">Specialty</label>
              <select
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className={inputClasses}
              >
                <option value="" className="bg-gray-100 dark:bg-[#1A1A1A]">Select specialty...</option>
                {SPECIALTIES.map(s => (
                  <option key={s} value={s} className="bg-gray-100 dark:bg-[#1A1A1A]">{s}</option>
                ))}
              </select>
            </div>

            {/* Years of Experience */}
            <div>
              <label className="block text-gray-500 dark:text-[#A0A0A0] text-sm mb-2">Years of Experience <span className="text-gray-400 dark:text-[#6B6B6B]">(optional)</span></label>
              <input
                type="number"
                min={0}
                max={50}
                placeholder="0"
                value={yearsExperience}
                onChange={(e) => setYearsExperience(e.target.value)}
                className={inputClasses}
              />
            </div>

            {/* Agree to Terms */}
            <label className="flex items-start gap-3 cursor-pointer group pt-1">
              <div
                onClick={() => setAgreeTerms(!agreeTerms)}
                className={`w-[18px] h-[18px] rounded border flex items-center justify-center transition-colors flex-shrink-0 mt-0.5 ${
                  agreeTerms
                    ? 'bg-[#00AEEF] border-[#00AEEF]'
                    : 'border-[#4A4A4A] group-hover:border-[#6B6B6B]'
                }`}
              >
                {agreeTerms && (
                  <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                    <path
                      d="M1 4.5L4 7.5L10 1"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
              <span className="text-gray-500 dark:text-[#A0A0A0] text-xs leading-relaxed">
                I agree to the{' '}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    toast.info('Terms of Service coming soon!')
                  }}
                  className="text-[#00AEEF] hover:text-[#33BFF2] transition-colors"
                >
                  Terms of Service
                </button>{' '}
                and{' '}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    toast.info('Privacy Policy coming soon!')
                  }}
                  className="text-[#00AEEF] hover:text-[#33BFF2] transition-colors"
                >
                  Privacy Policy
                </button>
              </span>
            </label>

            {/* Create Account Button */}
            <button
              onClick={handleCreateAccount}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-[#00AEEF] hover:bg-[#009BD6] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-sm mt-2"
            >
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <UserPlus size={16} />
              )}
              Create Account
            </button>
          </div>

          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-400 dark:text-[#6B6B6B] text-sm">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-[#00AEEF] hover:text-[#33BFF2] transition-colors font-medium"
              >
                Sign In
              </Link>
            </p>
          </div>
        </motion.div>

        {/* Back to home */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="mt-6 text-center"
        >
          <Link
            to="/"
            className="text-gray-400 dark:text-[#6B6B6B] text-xs hover:text-gray-500 dark:hover:text-[#A0A0A0] transition-colors"
          >
            Back to home page
          </Link>
        </motion.div>
      </motion.div>
    </div>
  )
}
