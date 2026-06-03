import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LogIn, Eye, EyeOff } from 'lucide-react'
import { loginCoach, getAuthToken } from '@/lib/auth'
import { toast } from 'sonner'

const easeOut = [0.16, 1, 0.3, 1] as [number, number, number, number]

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const token = getAuthToken()
    if (token) {
      navigate('/dashboard')
    }
  }, [navigate])

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      toast.error('Please enter both email and password')
      return
    }

    setIsLoading(true)

    const coach = await loginCoach(email, password)
    setIsLoading(false)

    if (!coach) {
      toast.error('Invalid email or password')
      return
    }

    toast.success(`Welcome back, ${coach.fullName}!`)
    navigate('/dashboard')
  }

  return (
    <div className="min-h-[100dvh] bg-[#0A0A0A] flex items-center justify-center p-4">
      {/* Ambient glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-[rgba(0,174,239,0.04)] blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] rounded-full bg-[rgba(139,92,246,0.03)] blur-[100px]" />
      </div>

      {/* Background Image */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat opacity-15 pointer-events-none"
        style={{ backgroundImage: 'url(/hero-bg.jpg)' }}
      />

      {/* Noise texture */}
      <div className="fixed inset-0 bg-[url(\'/noise.png\')] opacity-[0.03] pointer-events-none mix-blend-overlay" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: easeOut }}
        className="w-full max-w-[400px] relative z-10"
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
              src="./AzFIT_Logo_BlackBackground_Text.png"
              alt="AzFIT"
              className="h-10 w-auto mx-auto mb-6"
            />
          </Link>
          <h1 className="font-playfair text-3xl font-bold text-gray-900 dark:text-[#F0F0F0] mb-2">
            Welcome back
          </h1>
          <p className="text-gray-500 dark:text-[#A0A0A0] text-sm">
            Sign in to your AzFIT trainer portal
          </p>
        </motion.div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: easeOut }}
          className="bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-[#2A2A2A] rounded-2xl p-6 sm:p-8"
        >
          <div className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-gray-500 dark:text-[#A0A0A0] text-sm mb-2">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSignIn()}
                className="w-full bg-gray-100 dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2A2A2A] rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-[#F0F0F0] placeholder:text-gray-400 dark:placeholder:text-[#6B6B6B] focus:outline-none focus:border-[#00AEEF] focus:ring-1 focus:ring-[rgba(0,174,239,0.15)] transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-gray-500 dark:text-[#A0A0A0] text-sm mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSignIn()}
                  className="w-full bg-gray-100 dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2A2A2A] rounded-xl px-4 py-3 pr-11 text-sm text-gray-900 dark:text-[#F0F0F0] placeholder:text-gray-400 dark:placeholder:text-[#6B6B6B] focus:outline-none focus:border-[#00AEEF] focus:ring-1 focus:ring-[rgba(0,174,239,0.15)] transition-all"
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

            {/* Forgot password */}
            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={() => toast.info('Password reset coming soon!')}
                className="text-[#00AEEF] text-sm hover:text-[#33BFF2] transition-colors"
              >
                Forgot password?
              </button>
            </div>

            {/* Sign In Button */}
            <button
              onClick={handleSignIn}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-[#00AEEF] hover:bg-[#009BD6] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-sm mt-2"
            >
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <LogIn size={16} />
              )}
              Sign In
            </button>
          </div>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-400 dark:text-[#6B6B6B] text-sm">
              Don&apos;t have an account?{' '}
              <Link
                to="/signup"
                className="text-[#00AEEF] hover:text-[#33BFF2] transition-colors font-medium"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </motion.div>

        {/* Back to home */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
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
