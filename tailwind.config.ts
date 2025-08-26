import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
    "./*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "sans-serif"],
        display: ["var(--font-display)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      colors: {
        // Minimal Design System - One Source of Truth
        background: 'hsl(var(--bg))',
        surface: 'hsl(var(--surface))',
        border: 'hsl(var(--border))',
        muted: 'hsl(var(--muted))',
        foreground: 'hsl(var(--fg))',
        accent: 'hsl(var(--accent))',
        'accent-foreground': 'hsl(var(--accent-fg))',

        // Legacy semantic colors for backward compatibility
        primary: 'hsl(var(--accent))',
        'primary-foreground': 'hsl(var(--accent-fg))',
        secondary: 'hsl(var(--surface))',
        'secondary-foreground': 'hsl(var(--fg))',
        destructive: 'hsl(0 84% 60%)',
        'destructive-foreground': 'hsl(var(--fg))',
        input: 'hsl(var(--surface))',
        ring: 'hsl(var(--accent))',
        popover: 'hsl(var(--surface))',
        'popover-foreground': 'hsl(var(--fg))',
        card: 'hsl(var(--surface))',
        'card-foreground': 'hsl(var(--fg))',

        // Backwards-compat brand aliases
        "orange-accent": "hsl(var(--accent))",
        "orange-accent-hover": "var(--color-orange-accent-hover)",
        "gunmetal": "var(--color-gunmetal)",
        "gunmetal-lighter": "var(--color-gunmetal-lighter)",
        "light-silver": "var(--color-light-silver)",
        "light-silver-darker": "var(--color-light-silver-darker)",
      },
      borderRadius: {
        sm: 'var(--r-sm)',
        md: 'var(--r-md)',
        lg: 'var(--r-lg)',
        xl: 'var(--r-xl)',
        full: 'var(--r-pill)'
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)'
      },
      transitionDuration: {
        fast: 'var(--dur-fast)',
        base: 'var(--dur)',
        slow: 'var(--dur-slow)',
        // Legacy durations for backward compatibility
        150: "150ms",
        200: "200ms",
        300: "300ms",
        500: "500ms",
      },
      transitionTimingFunction: {
        smooth: 'var(--ease)',
        // Legacy timing functions
        bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
      },
      // Responsive spacing aliases aligned with spacing.ts
      spacing: {
        'responsive-base': 'var(--spacing-responsive-base, 0.5rem)',
        'responsive-md': 'var(--spacing-responsive-md, 0.75rem)',
        'responsive-lg': 'var(--spacing-responsive-lg, 1rem)',
      },
      // Enhanced backdrop blur scale for glass effects
      backdropBlur: {
        xs: "2px",
        sm: "4px",
        DEFAULT: "8px",
        md: "12px",
        lg: "16px",
        xl: "24px",
        "2xl": "40px",
        "3xl": "64px",
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
        shine: {
          from: { backgroundPosition: "200% 0" },
          to: { backgroundPosition: "-200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "33%": { transform: "translateY(-10px) rotate(1deg)" },
          "66%": { transform: "translateY(5px) rotate(-1deg)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200px 0" },
          "100%": { backgroundPosition: "calc(200px + 100%) 0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        shine: "shine 6s linear infinite",
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "bounce-slow": "bounce 2s infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config

export default config
