import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  CalendarDays,
  Dumbbell,
  Apple,
  Users,
  Camera,
  Settings,
  Zap,
  Search,
  Bell,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sun,
  Moon,
} from 'lucide-react'
import AiChat from './AiChat'

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Calendar', path: '/calendar', icon: CalendarDays },
  { label: 'Programs', path: '/programs', icon: Dumbbell },
  { label: 'Program Creator', path: '/programs/create', icon: Zap },
  { label: 'Nutrition', path: '/nutrition', icon: Apple },
  { label: 'Clients', path: '/clients', icon: Users },
  { label: 'Photos', path: '/photos', icon: Camera },
  { label: 'Settings', path: '/settings', icon: Settings },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)

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

  const sidebarWidthPx = isDesktop ? (collapsed ? 72 : 260) : 0
  const isActive = (path: string) => {
    if (path === '/clients') return location.pathname.startsWith('/clients')
    return location.pathname === path
  }

  /* -- Theme-aware colours -- */
  const isDark = theme === 'dark'

  /* Page background */
  const pageBg       = isDark ? '#0A0A0A'                    : '#F1F5F9'
  /* Sidebar */
  const sidebarBg    = isDark
    ? 'linear-gradient(180deg, rgba(0,174,239,0.06) 0%, rgba(139,92,246,0.03) 50%, transparent 100%), #141414'
    : '#FFFFFF'
  const sidebarBorder     = isDark ? '#2A2A2A' : '#E2E8F0'
  const sidebarText       = isDark ? '#F0F0F0' : '#1E293B'
  const sidebarMuted      = isDark ? '#6B6B6B' : '#94A3B8'
  const sidebarHoverBg    = isDark ? '#242424' : '#F1F5F9'
  const sidebarActiveBg   = isDark ? 'rgba(0,174,239,0.15)' : 'rgba(0,174,239,0.10)'
  const tooltipBg         = isDark ? '#1A1A1A' : '#FFFFFF'
  const tooltipBorder     = isDark ? '#2A2A2A' : '#E2E8F0'
  /* Toolbar */
  const toolbarBg    = isDark
    ? 'linear-gradient(135deg, rgba(0,174,239,0.18) 0%, rgba(139,92,246,0.10) 50%, rgba(10,10,10,0.0) 100%), #141414'
    : 'linear-gradient(135deg, rgba(0,174,239,0.08) 0%, rgba(139,92,246,0.04) 100%), #FFFFFF'
  const toolbarBorder     = isDark ? 'rgba(0,174,239,0.15)' : '#E2E8F0'
  const toolbarShadow     = isDark
    ? 'inset 0 1px 0 rgba(0,174,239,0.25), 0 4px 30px rgba(0,174,239,0.10)'
    : 'inset 0 1px 0 rgba(0,174,239,0.12), 0 4px 20px rgba(0,174,239,0.06)'
  const titleText         = isDark ? '#FFFFFF' : '#0F172A'
  const iconColor         = isDark ? '#A0A0A0' : '#64748B'
  const iconHoverColor    = isDark ? '#F0F0F0' : '#0F172A'
  const iconHoverBg       = isDark ? '#242424' : '#F1F5F9'
  const searchBg          = isDark ? '#141414' : '#F1F5F9'
  const searchBorder      = isDark ? '#2A2A2A' : '#E2E8F0'
  const searchText        = isDark ? '#F0F0F0' : '#0F172A'
  const searchPlaceholder = isDark ? '#6B6B6B' : '#94A3B8'
  const searchIcon        = isDark ? '#6B6B6B' : '#94A3B8'
  const avatarRing        = isDark ? '#2A2A2A' : '#E2E8F0'
  /* Mobile overlay */
  const mobileOverlay     = isDark ? 'bg-black/50' : 'bg-black/30'

  /* Logo source switches with theme */
  const logoFull   = isDark ? '/AzFIT_Logo_BlackBackground_Text.png' : '/AzFIT_Logo_WhiteBackground_Text.png'
  const logoIcon   = isDark ? '/AzFIT_Logo_BlackBackground.png'       : '/AzFIT_Logo_WhiteBackground.png'

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
          {navItems.map((item) => {
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
            <img
              src="/avatar-placeholder.png"
              alt="User"
              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
            />
            <div
              className="flex-1 min-w-0 overflow-hidden transition-opacity duration-300"
              style={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : 'auto' }}
            >
              <p className="text-sm font-medium truncate" style={{ color: sidebarText }}>Trainer</p>
              <p className="text-xs truncate" style={{ color: sidebarMuted }}>Pro Plan</p>
            </div>
            {!collapsed && (
              <button
                className="p-1 transition-colors flex-shrink-0"
                style={{ color: sidebarMuted }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#EF4444')}
                onMouseLeave={(e) => (e.currentTarget.style.color = sidebarMuted)}
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
                {navItems.map((item) => {
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
                  <img src="/avatar-placeholder.png" alt="User" className="w-9 h-9 rounded-full object-cover" />
                  <div className="flex-1">
                    <p className="text-sm font-medium" style={{ color: sidebarText }}>Trainer</p>
                    <p className="text-xs" style={{ color: sidebarMuted }}>Pro Plan</p>
                  </div>
                </div>
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
          boxShadow: toolbarShadow,
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
              style={{
                color: titleText,
                textShadow: isDark ? '0 0 6px rgba(0,174,239,0.3)' : 'none',
              }}
            >
              {navItems.find((i) => isActive(i.path))?.label || 'Dashboard'}
            </h1>
          </div>

          {/* Right: Search, Notifications, Avatar */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search */}
            <div
              className="hidden sm:flex items-center rounded-full transition-all duration-300"
              style={{
                backgroundColor: searchBg,
                border: `1px solid ${searchFocused ? '#00AEEF' : searchBorder}`,
                width: searchFocused ? '16rem' : '12rem',
              }}
            >
              <Search size={16} className="ml-3 flex-shrink-0" style={{ color: searchIcon }} />
              <input
                type="text"
                placeholder="Search..."
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className="bg-transparent border-none outline-none text-sm px-2 py-2 w-full placeholder:text-[#94A3B8]"
                style={{ color: searchText }}
              />
            </div>

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

            {/* Notification */}
            <button
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
              aria-label="Notifications"
            >
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#EF4444]" />
            </button>

            {/* Avatar */}
            <button
              onClick={() => navigate('/settings')}
              className="w-9 h-9 rounded-full overflow-hidden transition-all hover:ring-[#00AEEF]"
              style={{ ring: `2px solid ${avatarRing}` }}
            >
              <img src="/avatar-placeholder.png" alt="User" className="w-full h-full object-cover" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main
        className="pt-16 transition-all duration-300 min-h-[100dvh]"
        style={{ marginLeft: sidebarWidthPx }}
      >
        <div className="p-4 sm:p-6 lg:p-8 max-w-[1440px] mx-auto">
          {children}
        </div>
      </main>

      {/* AI Chat */}
      <AiChat />
    </div>
  )
}
