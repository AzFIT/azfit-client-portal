import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const productLinks = [
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Program Library', href: '/programs' },
  { label: 'Nutrition Hub', href: '/nutrition' },
  { label: 'AI Assistant', href: '#' },
]

const resourceLinks = [
  { label: 'Help Center', href: '#' },
  { label: 'Exercise Database', href: '#' },
  { label: 'Training Methods', href: '#' },
  { label: 'Blog', href: '#' },
  { label: 'Community', href: '#' },
]

const companyLinks = [
  { label: 'About Us', href: '#about' },
  { label: 'Careers', href: '#' },
  { label: 'Contact', href: '#' },
  { label: 'Privacy Policy', href: '#' },
  { label: 'Terms of Service', href: '#' },
]

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
}

export default function Footer() {
  return (
    <footer className="bg-[#0A0A0A] border-t border-[#2A2A2A] relative">
      <div className="noise-overlay noise-overlay-light" />
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8 relative z-[2]"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand Column */}
          <motion.div variants={itemVariants}>
            <img
              src="/AzFIT_Logo_WhiteBackground_Text.png"
              alt="AzFIT"
              className="h-8 w-auto brightness-0 invert mb-4"
            />
            <p className="text-[#6B6B6B] text-sm mb-6">
              Science-based training, beautifully organized.
            </p>
            <div className="flex items-center gap-4">
              {/* Instagram */}
              <a href="#" className="text-[#6B6B6B] hover:text-[#00AEEF] transition-colors duration-200" aria-label="Instagram">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" />
                  <circle cx="12" cy="12" r="5" />
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                </svg>
              </a>
              {/* Facebook */}
              <a href="#" className="text-[#6B6B6B] hover:text-[#00AEEF] transition-colors duration-200" aria-label="Facebook">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
              {/* LinkedIn */}
              <a href="#" className="text-[#6B6B6B] hover:text-[#00AEEF] transition-colors duration-200" aria-label="LinkedIn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect x="2" y="9" width="4" height="12" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>
            </div>
          </motion.div>

          {/* Product Column */}
          <motion.div variants={itemVariants}>
            <h4 className="text-[#F0F0F0] font-semibold text-sm mb-4">Product</h4>
            <ul className="space-y-3">
              {productLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-[#6B6B6B] hover:text-[#A0A0A0] text-sm transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Resources Column */}
          <motion.div variants={itemVariants}>
            <h4 className="text-[#F0F0F0] font-semibold text-sm mb-4">Resources</h4>
            <ul className="space-y-3">
              {resourceLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-[#6B6B6B] hover:text-[#A0A0A0] text-sm transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Company Column */}
          <motion.div variants={itemVariants}>
            <h4 className="text-[#F0F0F0] font-semibold text-sm mb-4">Company</h4>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-[#6B6B6B] hover:text-[#A0A0A0] text-sm transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          variants={itemVariants}
          className="mt-12 pt-8 border-t border-[#1F1F1F] flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <p className="text-[#6B6B6B] text-sm text-center sm:text-left">
            &copy; 2025 AzTechFit Hong Kong. All rights reserved.
          </p>
          <p className="text-[#6B6B6B] text-sm">
            Made with precision in Hong Kong
          </p>
        </motion.div>
      </motion.div>
    </footer>
  )
}
