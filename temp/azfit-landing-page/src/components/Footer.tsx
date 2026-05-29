import { Link } from 'react-router-dom'
import { Twitter, Instagram, Youtube, Linkedin } from 'lucide-react'
import { useState } from 'react'

const footerLinks = {
  features: [
    { label: 'Programs', href: '/features' },
    { label: 'Exercise Library', href: '/features' },
    { label: 'Calendar', href: '/features' },
    { label: 'Nutrition', href: '/features' },
    { label: 'AI Coach', href: '/features' },
  ],
  company: [
    { label: 'Pricing', href: '/pricing' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
  ],
}

export default function Footer() {
  const [email, setEmail] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setEmail('')
  }

  return (
    <footer className="relative" style={{ background: '#111827', borderTop: '1px solid rgba(209, 213, 219, 0.1)' }}>
      <div className="mx-auto max-w-[1280px] section-pad-x py-16 lg:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Brand Column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="inline-block mb-4">
              <img
                src="/AzFIT_Logo_WhiteBackground_Text.png"
                alt="AzFIT"
                className="h-[36px] w-auto object-contain"
              />
            </Link>
            <p className="text-[14px] leading-relaxed mb-6" style={{ color: '#9CA3AF', maxWidth: '280px' }}>
              The Operating System for Modern Personal Training. AI-driven programming,
              real-time biometric sync, and seamless client engagement.
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-4">
              <a href="#" className="text-[#9CA3AF] hover:text-[#00AEEF] transition-colors duration-200" aria-label="Twitter">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-[#9CA3AF] hover:text-[#00AEEF] transition-colors duration-200" aria-label="Instagram">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-[#9CA3AF] hover:text-[#00AEEF] transition-colors duration-200" aria-label="YouTube">
                <Youtube size={20} />
              </a>
              <a href="#" className="text-[#9CA3AF] hover:text-[#00AEEF] transition-colors duration-200" aria-label="LinkedIn">
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          {/* Features Column */}
          <div>
            <h4 className="text-[12px] font-semibold uppercase tracking-[0.04em] mb-4" style={{ color: '#D1D5DB' }}>
              Features
            </h4>
            <ul className="space-y-3">
              {footerLinks.features.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-[14px] transition-colors duration-200 hover:text-[#00AEEF]"
                    style={{ color: '#9CA3AF' }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h4 className="text-[12px] font-semibold uppercase tracking-[0.04em] mb-4" style={{ color: '#D1D5DB' }}>
              Company
            </h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-[14px] transition-colors duration-200 hover:text-[#00AEEF]"
                    style={{ color: '#9CA3AF' }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter Column */}
          <div>
            <h4 className="text-[12px] font-semibold uppercase tracking-[0.04em] mb-4" style={{ color: '#D1D5DB' }}>
              Stay Updated
            </h4>
            <p className="text-[14px] mb-4" style={{ color: '#9CA3AF' }}>
              Get the latest updates on new features and releases.
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-3 rounded-lg text-[14px] outline-none transition-all duration-200 focus:ring-2"
                style={{
                  background: '#1F2937',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#F9FAFB',
                }}
              />
              <button
                type="submit"
                className="gradient-azure text-[#F9FAFB] font-semibold text-[14px] px-4 py-3 rounded-lg shadow-glow-blue transition-all duration-200 hover:shadow-glow-blue-lg hover:scale-[1.02] active:scale-[0.98]"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          className="mt-16 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}
        >
          <p className="text-[12px]" style={{ color: '#6B7280' }}>
            &copy; {new Date().getFullYear()} AzFIT. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link to="#" className="text-[12px] transition-colors duration-200 hover:text-[#00AEEF]" style={{ color: '#6B7280' }}>
              Privacy
            </Link>
            <Link to="#" className="text-[12px] transition-colors duration-200 hover:text-[#00AEEF]" style={{ color: '#6B7280' }}>
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
