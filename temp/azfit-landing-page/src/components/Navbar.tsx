import { useState, useEffect, useCallback } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, LogIn, LayoutDashboard } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../stores/authStore'

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Features', href: '/features' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Connect', href: '/connect' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const { isAuthenticated, user } = useAuthStore()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setIsOpen(false)
  }, [location.pathname])

  const isActive = useCallback(
    (href: string) => {
      if (href === '/') return location.pathname === '/'
      return location.pathname === href
    },
    [location.pathname],
  )

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrolled
            ? 'rgba(17, 24, 39, 0.9)'
            : 'rgba(17, 24, 39, 0.85)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(209, 213, 219, 0.1)',
          height: '72px',
        }}
      >
        <div className="mx-auto flex h-full max-w-[1280px] items-center justify-between section-pad-x">
          {/* Logo */}
          <Link to="/" className="flex items-center shrink-0">
            <img
              src="/AzFIT_Logo_WhiteBackground_Text.png"
              alt="AzFIT"
              className="h-[40px] w-auto object-contain"
            />
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="text-[16px] font-medium transition-colors duration-200 hover:text-[#00AEEF]"
                style={{
                  color: isActive(link.href) ? '#00AEEF' : '#D1D5DB',
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link
                  to="/portal"
                  className="flex items-center gap-2 text-[#00AEEF] font-medium text-[14px] px-4 py-2.5 rounded-lg border border-[#00AEEF] hover:bg-[rgba(0,174,239,0.08)] transition-all"
                >
                  <LayoutDashboard size={16} />
                  Portal
                </Link>
                <div className="flex items-center gap-2 text-[#D1D5DB] text-sm">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#00AEEF] to-[#3B82F6] flex items-center justify-center text-white text-xs font-bold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-[80px] truncate">{user?.name?.split(' ')[0]}</span>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-[#D1D5DB] font-medium text-[14px] px-4 py-2.5 rounded-lg hover:text-[#F9FAFB] hover:bg-[rgba(255,255,255,0.05)] transition-all flex items-center gap-1.5"
                >
                  <LogIn size={16} />
                  Login
                </Link>
                <Link
                  to="/register"
                  className="gradient-azure text-[#F9FAFB] font-semibold text-[14px] px-6 py-2.5 rounded-lg shadow-glow-blue transition-all duration-200 hover:shadow-glow-blue-lg hover:scale-[1.03] active:scale-[0.97] inline-block"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            className="lg:hidden flex items-center justify-center w-10 h-10 text-[#D1D5DB] hover:text-[#00AEEF] transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Full-Screen Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 lg:hidden"
            style={{ background: '#111827', paddingTop: '72px' }}
          >
            <div className="flex flex-col items-center justify-center gap-8 h-full">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ delay: i * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                >
                  <Link
                    to={link.href}
                    className="text-[22px] sm:text-[28px] font-bold transition-colors duration-200 hover:text-[#00AEEF]"
                    style={{
                      color: isActive(link.href) ? '#00AEEF' : '#F9FAFB',
                      fontFamily: 'Inter, sans-serif',
                    }}
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              {isAuthenticated ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ delay: navLinks.length * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                >
                  <Link
                    to="/portal"
                    className="gradient-azure text-[#F9FAFB] font-semibold text-[18px] px-10 py-5 rounded-lg shadow-glow-blue mt-4 inline-flex items-center gap-2"
                    onClick={() => setIsOpen(false)}
                  >
                    <LayoutDashboard size={20} />
                    Trainer Portal
                  </Link>
                </motion.div>
              ) : (
                <>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ delay: navLinks.length * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                  >
                    <Link
                      to="/login"
                      className="text-[#00AEEF] font-semibold text-[18px] px-10 py-3 rounded-lg border border-[#00AEEF] mt-4 inline-flex items-center gap-2"
                      onClick={() => setIsOpen(false)}
                    >
                      <LogIn size={20} />
                      Login
                    </Link>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ delay: (navLinks.length + 1) * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                  >
                    <Link
                      to="/register"
                      className="gradient-azure text-[#F9FAFB] font-semibold text-[18px] px-10 py-5 rounded-lg shadow-glow-blue mt-2 inline-block"
                      onClick={() => setIsOpen(false)}
                    >
                      Get Started
                    </Link>
                  </motion.div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
