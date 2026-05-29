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

  return (
    <div className="min-h-[100dvh] bg-[#0A0A0A]">
      {/* Desktop Sidebar */}
      <aside
        className="fixed left-0 top-0 bottom-0 bg-[#141414] border-r border-[#2A2A2A] z-50 transition-all duration-300 hidden lg:flex flex-col"
        style={{ width: sidebarWidthPx || 260 }}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-[#2A2A2A] overflow-hidden">
          <Link to="/dashboard" className="flex items-center gap-3 flex-shrink-0">
            <img
              src="/AzFIT_Logo_BlackBackground_Text.png"
              alt="AzFIT"
              className="h-8 w-auto transition-opacity duration-300"
              style={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : 'auto' }}
            />
            {collapsed && (
              <img
                src="/AzFIT_Logo_BlackBackground.png"
                alt="AzFIT"
                className="h-8 w-8 object-contain"
              />
            )}
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto text-[#6B6B6B] hover:text-[#F0F0F0] p-1 rounded-lg hover:bg-[#242424] transition-colors flex-shrink-0"
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
                className={`flex items-center gap-3 h-10 px-3 rounded-lg transition-all duration-200 group relative ${
                  active
                    ? 'bg-[rgba(0,174,239,0.15)]'
                    : 'text-white hover:text-[#F0F0F0] hover:bg-[#242424]'
                }`}
                style={active ? { color: '#F0F0F0', borderLeft: '3px solid #00AEEF' } : { borderLeft: '3px solid transparent' }}
              >
                <item.icon size={20} className="flex-shrink-0" style={active ? { color: '#00AEEF' } : undefined} />
                <span
                  className="text-sm font-medium truncate transition-opacity duration-300"
                  style={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : 'auto' }}
                >
                  {item.label}
                </span>
                {/* Tooltip for collapsed */}
                {collapsed && (
                  <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg text-xs text-[#F0F0F0] whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-lg">
                    {item.label}
                  </div>
                )}
              </Link>
            )
          })}
        </nav>

        {/* User Profile */}
        <div className="p-3 border-t border-[#2A2A2A]">
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#242424] transition-colors cursor-pointer">
            <img
              src="/avatar-placeholder.png"
              alt="User"
              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
            />
            <div
              className="flex-1 min-w-0 overflow-hidden transition-opacity duration-300"
              style={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : 'auto' }}
            >
              <p className="text-[#F0F0F0] text-sm font-medium truncate">Trainer</p>
              <p className="text-[#6B6B6B] text-xs truncate">Pro Plan</p>
            </div>
            {!collapsed && (
              <button className="text-[#6B6B6B] hover:text-[#EF4444] p-1 transition-colors flex-shrink-0" aria-label="Logout">
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
              className="fixed inset-0 bg-black/50 z-[100] lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="fixed left-0 top-0 bottom-0 w-[260px] bg-[#141414] border-r border-[#2A2A2A] z-[100] lg:hidden flex flex-col"
            >
              {/* Mobile Logo */}
              <div className="h-16 flex items-center justify-between px-4 border-b border-[#2A2A2A]">
                <Link to="/dashboard" className="flex items-center" onClick={() => setMobileOpen(false)}>
                  <img src="/AzFIT_Logo_BlackBackground_Text.png" alt="AzFIT" className="h-8 w-auto" />
                </Link>
                <button onClick={() => setMobileOpen(false)} className="text-[#A0A0A0] p-2" aria-label="Close menu">
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
                      className={`flex items-center gap-3 h-12 px-3 rounded-lg transition-all duration-200 ${
                        active
                          ? 'bg-[rgba(0,174,239,0.15)] border-l-[3px] border-[#00AEEF]'
                          : 'text-white hover:text-[#F0F0F0] hover:bg-[#242424] border-l-[3px] border-transparent'
                      }`}
                      style={active ? { color: '#F0F0F0' } : undefined}
                    >
                      <item.icon size={20} style={active ? { color: '#00AEEF' } : undefined} />
                      <span className="text-sm font-medium">{item.label}</span>
                    </Link>
                  )
                })}
              </nav>

              {/* Mobile User */}
              <div className="p-4 border-t border-[#2A2A2A]">
                <div className="flex items-center gap-3">
                  <img src="/avatar-placeholder.png" alt="User" className="w-9 h-9 rounded-full object-cover" />
                  <div className="flex-1">
                    <p className="text-[#F0F0F0] text-sm font-medium">Trainer</p>
                    <p className="text-[#6B6B6B] text-xs">Pro Plan</p>
                  </div>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Top Bar */}
      <header
        className="fixed top-0 right-0 h-16 bg-[#0A0A0A]/80 backdrop-blur-xl border-b border-[#1F1F1F] z-40 flex items-center px-4 sm:px-6 lg:px-8 transition-all duration-300"
        style={{ left: sidebarWidthPx }}
      >
        <div className="flex items-center justify-between w-full max-w-[1440px] mx-auto">
          {/* Left: Menu button + Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden text-[#A0A0A0] hover:text-[#F0F0F0] p-2 -ml-2"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-[#F0F0F0] font-semibold text-lg hidden sm:block">
              {navItems.find((i) => isActive(i.path))?.label || 'Dashboard'}
            </h1>
          </div>

          {/* Right: Search, Notifications, Avatar */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search */}
            <div
              className={`hidden sm:flex items-center bg-[#141414] rounded-full border border-[#2A2A2A] transition-all duration-300 ${
                searchFocused ? 'w-64 border-[#00AEEF]' : 'w-48'
              }`}
            >
              <Search size={16} className="text-[#6B6B6B] ml-3 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search..."
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className="bg-transparent border-none outline-none text-sm text-[#F0F0F0] placeholder:text-[#6B6B6B] px-2 py-2 w-full"
              />
            </div>

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme((t) => t === 'dark' ? 'light' : 'dark')}
              className="relative w-10 h-10 rounded-lg flex items-center justify-center text-[#A0A0A0] hover:text-[#F0F0F0] hover:bg-[#242424] transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Notification */}
            <button
              className="relative w-10 h-10 rounded-lg flex items-center justify-center text-[#A0A0A0] hover:text-[#F0F0F0] hover:bg-[#242424] transition-colors"
              aria-label="Notifications"
            >
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#EF4444]" />
            </button>

            {/* Avatar */}
            <button
              onClick={() => navigate('/settings')}
              className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-[#2A2A2A] hover:ring-[#00AEEF] transition-all"
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
