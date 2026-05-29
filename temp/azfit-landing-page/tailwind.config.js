/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        "deep-void": "#111827",
        "metallic-silver": "#D1D5DB",
        "electric-blue": "#00AEEF",
        "surface-dark": "#1F2937",
        "soft-white": "#F9FAFB",
        "pure-black": "#030712",
        "steel-gray": "#4B5563",
        "mist-gray": "#9CA3AF",
        success: "#10B981",
        alert: "#EF4444",
        warning: "#F59E0B",
      },
      fontFamily: {
        inter: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        xl: "calc(var(--radius) + 4px)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xs: "calc(var(--radius) - 6px)",
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        "glow-blue": "0 0 15px rgba(0, 174, 239, 0.4)",
        "glow-blue-lg": "0 0 30px rgba(0, 174, 239, 0.3)",
        "glow-blue-xl": "0 0 60px rgba(0, 174, 239, 0.15)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
        "orb-breathe": {
          "0%, 100%": {
            transform: "scale(1)",
            boxShadow: "0 0 30px rgba(0, 174, 239, 0.2)",
          },
          "50%": {
            transform: "scale(1.06)",
            boxShadow: "0 0 50px rgba(0, 174, 239, 0.35)",
          },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(1)", opacity: "0.3" },
          "100%": { transform: "scale(2.5)", opacity: "0" },
        },
        "float-up": {
          "0%": { transform: "translateY(0px)", opacity: "0" },
          "10%": { opacity: "1" },
          "90%": { opacity: "1" },
          "100%": { transform: "translateY(-20px)", opacity: "0" },
        },
        "data-scroll-left": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "data-scroll-right": {
          "0%": { transform: "translateX(-50%)" },
          "100%": { transform: "translateX(0)" },
        },
        "glow-pulse": {
          "0%, 100%": { opacity: "0.04" },
          "50%": { opacity: "0.06" },
        },
        "rotate-wireframe": {
          from: { transform: "rotateY(0deg) rotateX(10deg)" },
          to: { transform: "rotateY(360deg) rotateX(10deg)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "caret-blink": "caret-blink 1.25s ease-out infinite",
        "orb-breathe": "orb-breathe 4s ease-in-out infinite",
        "spin-slow": "spin-slow 30s linear infinite",
        "pulse-ring": "pulse-ring 3s ease-out infinite",
        "float-up": "float-up 4s ease-in-out infinite",
        "data-scroll-left": "data-scroll-left 40s linear infinite",
        "data-scroll-right": "data-scroll-right 45s linear infinite",
        "data-scroll-left-slow": "data-scroll-left 55s linear infinite",
        "glow-pulse": "glow-pulse 4s ease-in-out infinite",
        "rotate-wireframe": "rotate-wireframe 20s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
