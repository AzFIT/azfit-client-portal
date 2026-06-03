import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  CalendarDays,
  Dumbbell,
  Users,
  BookOpen,
  Settings,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sun,
  Moon,
  Shield,
} from 'lucide-react'
import { getCurrentCoach, clearAuthToken, getClientsForCoach } from '@/lib/auth'
import { toast } from 'sonner'

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Clients', path: '/clients', icon: Users },
  { label: 'Programs', path: '/programs', icon: Dumbbell },
  { label: 'Exercise Library', path: '/exercises', icon: BookOpen },
  { label: 'Calendar', path: '/calendar', icon: CalendarDays },
  { label: 'Settings', path: '/settings', icon: Settings },
]

const adminNavItem = { label: 'Admin', path: '/admin', icon: Shield }

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)
  const [coach, setCoach] = useState(getCurrentCoach)

  /* Theme management */
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('azfit-theme')
    if (saved === 'light' || saved === 'dark') return saved
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('dark', 'light')
    root.classList.add(theme)
    localStorage.setItem('azfit-theme', theme)
    window.dispatchEvent(new CustomEvent('azfit-theme-change', { detail: theme }))
  }, [theme])

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    // Re-check coach on mount and when location changes
    setCoach(getCurrentCoach())
  }, [location.pathname])

  const handleLogout = () => {
    clearAuthToken()
    toast.info('You have been logged out')
    navigate('/login')
  }

  const sidebarWidthPx = isDesktop ? (collapsed ? 72 : 260) : 0
  const isActive = (path: string) => {
    if (path === '/clients') return location.pathname.startsWith('/clients')
    if (path === '/programs') return location.pathname.startsWith('/programs')
    return location.pathname === path
  }

  const isDark = theme === 'dark'

  const pageBg       = isDark ? '#0B1120'                    : '#F1F5F9'
  const sidebarBg    = isDark ? '#0B1120' : '#FFFFFF'
  const sidebarBorder     = isDark ? '#2A3A50' : '#E2E8F0'
  const sidebarText       = isDark ? '#F1F5F9' : '#1E293B'
  const sidebarMuted      = isDark ? '#94A3B8' : '#64748B'
  const sidebarHoverBg    = isDark ? '#151D2E' : '#F1F5F9'
  const sidebarActiveBg   = isDark ? 'rgba(0,174,239,0.12)' : 'rgba(0,174,239,0.08)'
  const tooltipBg         = isDark ? '#151D2E' : '#FFFFFF'
  const tooltipBorder     = isDark ? '#2A3A50' : '#E2E8F0'
  const toolbarBg    = isDark ? '#0F172A' : '#FFFFFF'
  const toolbarBorder     = isDark ? '#2A3A50' : '#E2E8F0'
  const titleText         = isDark ? '#F1F5F9' : '#0F172A'
  const iconColor         = isDark ? '#94A3B8' : '#64748B'
  const iconHoverColor    = isDark ? '#F1F5F9' : '#0F172A'
  const iconHoverBg       = isDark ? '#151D2E' : '#F1F5F9'
  const avatarRing        = isDark ? '#2A3A50' : '#E2E8F0'
  const mobileOverlay     = isDark ? 'bg-black/50' : 'bg-black/30'

  const logoFull   = isDark ? './AzFIT_Logo_BlackBackground_Text.png' : './AzFIT_Logo_WhiteBackground_Text.png'
  const logoIcon   = isDark ? './AzFIT_Logo_BlackBackground.png'       : './AzFIT_Logo_WhiteBackground.png'

  const clientCount = coach ? getClientsForCoach(coach.id).length : 0

  return (
    <div className="min-h-[100dvh]" style={{ backgroundColor: pageBg }}>
      {/* Desktop Sidebar */}
      <aside
        className="fixed left-0 top-0 bottom-0 z-50 transition-all duration-300 hidden lg:flex flex-col"
        style={{
          width: sidebarWidthPx || 260,
          background: sidebarBg,
          borderRight: `1px solid ${sidebarBorder}`,
        }}
      >
        {/* Logo */}
        <div
          className="h-16 flex items-center px-4 overflow-hidden"
          style={{ borderBottom: `1px solid ${sidebarBorder}` }}
        >
          <Link to="/dashboard" className="flex items-center gap-3 flex-shrink-0">
            <img
              src={logoFull}
              alt="AzFIT"
              className="h-8 w-auto transition-opacity duration-300"
              style={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : 'auto' }}
            />
            {collapsed && (
              <img src={logoIcon} alt="AzFIT" className="h-8 w-8 object-contain" />
            )}
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto p-1 rounded-lg transition-colors flex-shrink-0"
            style={{ color: sidebarMuted }}
            onMouseEnter={(e) => (e.currentTarget.style.color = sidebarText)}
            onMouseLeave={(e) => (e.currentTarget.style.color = sidebarMuted)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {[...navItems, ...(coach?.role === 'admin' ? [adminNavItem] : [])].map((item) => {
            const active = isActive(item.path)
            return (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center gap-3 h-10 px-3 rounded-lg transition-all duration-200 group relative"
                style={{
                  backgroundColor: active ? sidebarActiveBg : 'transparent',
                  color: active ? sidebarText : sidebarText,
                  borderLeft: active ? '3px solid #00AEEF' : '3px solid transparent',
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = sidebarHoverBg
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }
                }}
              >
                <item.icon
                  size={20}
                  className="flex-shrink-0"
                  style={{ color: active ? '#00AEEF' : sidebarMuted }}
                />
                <span
                  className="text-sm font-medium truncate transition-opacity duration-300"
                  style={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : 'auto' }}
                >
                  {item.label}
                </span>
                {/* Tooltip for collapsed */}
                {collapsed && (
                  <div
                    className="absolute left-full ml-2 px-2.5 py-1.5 rounded-lg text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-lg"
                    style={{
                      backgroundColor: tooltipBg,
                      border: `1px solid ${tooltipBorder}`,
                      color: sidebarText,
                    }}
                  >
                    {item.label}
                  </div>
                )}
              </Link>
            )
          })}
        </nav>

        {/* User Profile */}
        <div className="p-3" style={{ borderTop: `1px solid ${sidebarBorder}` }}>
          <div
            className="flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors"
            style={{ color: sidebarText }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = sidebarHoverBg)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{ background: '#00AEEF', color: '#fff' }}
            >
              {coach ? coach.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'CO'}
            </div>
            <div
              className="flex-1 min-w-0 overflow-hidden transition-opacity duration-300"
              style={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : 'auto' }}
            >
              <p className="text-sm font-medium truncate" style={{ color: sidebarText }}>
                {coach?.fullName || 'Coach'}
              </p>
              <p className="text-xs truncate" style={{ color: sidebarMuted }}>
                {clientCount} {clientCount === 1 ? 'client' : 'clients'}
              </p>
            </div>
            {!collapsed && (
              <button
                className="p-1 transition-colors flex-shrink-0"
                style={{ color: sidebarMuted }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#EF4444')}
                onMouseLeave={(e) => (e.currentTarget.style.color = sidebarMuted)}
                onClick={handleLogout}
                aria-label="Logout"
              >
                <LogOut size={16} />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`fixed inset-0 z-[100] lg:hidden ${mobileOverlay}`}
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="fixed left-0 top-0 bottom-0 w-[260px] z-[100] lg:hidden flex flex-col"
              style={{
                background: sidebarBg,
                borderRight: `1px solid ${sidebarBorder}`,
              }}
            >
              {/* Mobile Logo */}
              <div
                className="h-16 flex items-center justify-between px-4"
                style={{ borderBottom: `1px solid ${sidebarBorder}` }}
              >
                <Link to="/dashboard" className="flex items-center" onClick={() => setMobileOpen(false)}>
                  <img src={logoFull} alt="AzFIT" className="h-8 w-auto" />
                </Link>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-2 transition-colors"
                  style={{ color: sidebarMuted }}
                  aria-label="Close menu"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Mobile Nav Items */}
              <nav className="flex-1 py-4 px-3 space-y-1">
                {[...navItems, ...(coach?.role === 'admin' ? [adminNavItem] : [])].map((item) => {
                  const active = isActive(item.path)
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 h-12 px-3 rounded-lg transition-all duration-200"
                      style={{
                        backgroundColor: active ? sidebarActiveBg : 'transparent',
                        color: active ? sidebarText : sidebarText,
                        borderLeft: active ? '3px solid #00AEEF' : '3px solid transparent',
                      }}
                    >
                      <item.icon size={20} style={{ color: active ? '#00AEEF' : sidebarMuted }} />
                      <span className="text-sm font-medium">{item.label}</span>
                    </Link>
                  )
                })}
              </nav>

              {/* Mobile User */}
              <div className="p-4" style={{ borderTop: `1px solid ${sidebarBorder}` }}>
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ background: '#00AEEF', color: '#fff' }}
                  >
                    {coach ? coach.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'CO'}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium" style={{ color: sidebarText }}>
                      {coach?.fullName || 'Coach'}
                    </p>
                    <p className="text-xs" style={{ color: sidebarMuted }}>
                      {clientCount} {clientCount === 1 ? 'client' : 'clients'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="mt-3 w-full flex items-center justify-center gap-2 text-sm text-[#EF4444] py-2 rounded-lg border border-[#EF4444]/20 hover:bg-[#EF4444]/10 transition-colors"
                >
                  <LogOut size={14} />
                  Log Out
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Top Bar */}
      <header
        className="fixed top-0 right-0 h-16 z-40 flex items-center px-4 sm:px-6 lg:px-8 transition-all duration-300"
        style={{
          left: sidebarWidthPx,
          background: toolbarBg,
          borderBottom: `1px solid ${toolbarBorder}`,
        }}
      >
        <div className="flex items-center justify-between w-full max-w-[1440px] mx-auto">
          {/* Left: Menu button + Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 -ml-2 transition-colors"
              style={{ color: iconColor }}
              onMouseEnter={(e) => (e.currentTarget.style.color = iconHoverColor)}
              onMouseLeave={(e) => (e.currentTarget.style.color = iconColor)}
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
            <h1
              className="font-semibold text-lg hidden sm:block"
              style={{ color: titleText }}
            >
              {navItems.find((i) => isActive(i.path))?.label || 'Dashboard'}
            </h1>
          </div>

          {/* Right: Theme, Logout, Avatar */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle */}
            <button
              onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
              className="relative w-10 h-10 rounded-lg flex items-center justify-center transition-colors"
              style={{ color: iconColor }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = iconHoverColor
                e.currentTarget.style.backgroundColor = iconHoverBg
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = iconColor
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Avatar */}
            <button
              onClick={() => navigate('/settings')}
              className="w-9 h-9 rounded-full overflow-hidden transition-all hover:ring-2 hover:ring-[#00AEEF] flex items-center justify-center text-xs font-bold"
              style={{
                boxShadow: `0 0 0 2px ${avatarRing}`,
                background: '#00AEEF',
                color: '#fff',
              }}
            >
              {coach ? coach.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'CO'}
            </button>
          </div>
        </div>
      </header>

      {/* Scroll to Top */}
      <ScrollToTop />

      {/* Print Styles */}
      <style>{`
        @media print {
          nav, aside, header, .fixed, [class*="sidebar"], [class*="topbar"], [class*="fab"] {
            display: none !important;
          }
          main { margin-left: 0 !important; padding-top: 0 !important; }
          body { background: white !important; color: black !important; }
          * { box-shadow: none !important; }
        }
      `}</style>

      {/* Main Content */}
      <main
        className="pt-16 transition-all duration-300 min-h-[100dvh]"
        style={{ marginLeft: sidebarWidthPx }}
      >
        <div className="p-4 sm:p-6 lg:p-8 max-w-[1440px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}

/* ── Scroll to Top ───────────────────────────────────── */
function ScrollToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 400)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (!visible) return null

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-24 right-6 z-[200] w-10 h-10 rounded-full bg-white dark:bg-[#151D2E] border border-gray-200 dark:border-[#2A3A50] text-gray-500 dark:text-[#94A3B8] hover:text-[#00AEEF] hover:border-[#00AEEF]/50 flex items-center justify-center shadow-lg transition-colors"
      title="Scroll to top"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="18 15 12 9 6 15" />
      </svg>
    </motion.button>
  )
}


