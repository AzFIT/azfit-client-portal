import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ArrowRight } from 'lucide-react'

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'About', href: '#about' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const isLanding = location.pathname === '/'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 100)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleAnchor = (href: string) => {
    setMobileOpen(false)
    if (isLanding) {
      const el = document.querySelector(href)
      el?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const navBg = scrolled
    ? 'bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-[#2A2A2A]'
    : 'bg-transparent'

  return (
    <>
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${navBg}`}
      >
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img
              src="./AzFIT_Logo_BlackBackground_Text.png"
              alt="AzFIT"
              className="h-9 w-auto"
            />
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => handleAnchor(link.href)}
                className="text-white hover:text-[#F0F0F0] text-sm font-medium transition-colors duration-200"
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/login"
              className="text-white hover:text-[#F0F0F0] text-sm font-medium px-4 py-2 rounded-lg transition-colors duration-200"
            >
              Log In
            </Link>
            <Link
              to="/signup"
              className="bg-[#00AEEF] hover:bg-[#009BD6] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all duration-200 hover:scale-[1.02] flex items-center gap-1.5"
            >
              Get Started
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden text-white p-2"
            aria-label="Open menu"
          >
            <Menu size={24} />
          </button>
        </div>
      </motion.nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 z-50 md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="fixed right-0 top-0 bottom-0 w-[280px] bg-[#0A0A0A] z-50 md:hidden flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b border-[#2A2A2A]">
                <img
                  src="./AzFIT_Logo_BlackBackground_Text.png"
                  alt="AzFIT"
                  className="h-8 w-auto"
                />
                <button onClick={() => setMobileOpen(false)} className="text-white p-2" aria-label="Close menu">
                  <X size={24} />
                </button>
              </div>
              <div className="flex flex-col p-4 gap-1">
                {navLinks.map((link) => (
                  <button
                    key={link.label}
                    onClick={() => handleAnchor(link.href)}
                    className="text-white hover:text-[#F0F0F0] text-lg font-medium px-4 py-3 rounded-lg hover:bg-[#1A1A1A] transition-colors text-left"
                  >
                    {link.label}
                  </button>
                ))}
              </div>
              <div className="mt-auto p-4 border-t border-[#2A2A2A] flex flex-col gap-3">
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="text-center text-[#A0A0A0] hover:text-[#F0F0F0] text-sm font-medium px-4 py-3 rounded-lg border border-[#2A2A2A] transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileOpen(false)}
                  className="text-center bg-[#00AEEF] hover:bg-[#009BD6] text-white text-sm font-semibold px-4 py-3 rounded-lg transition-all hover:scale-[1.02]"
                >
                  Get Started
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
