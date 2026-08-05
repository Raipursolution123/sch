/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-body)'],
        display: ['var(--font-display)'],
        mono: ['var(--font-mono)'],
      },
      colors: {
        border: 'oklch(var(--border) / <alpha-value>)',
        input: 'oklch(var(--input) / <alpha-value>)',
        ring: 'oklch(var(--ring) / <alpha-value>)',
        background: 'oklch(var(--background) / <alpha-value>)',
        foreground: 'oklch(var(--foreground) / <alpha-value>)',
        canvas: {
          DEFAULT: 'oklch(var(--canvas) / <alpha-value>)',
          soft: 'oklch(var(--canvas-soft) / <alpha-value>)',
        },
        ink: {
          DEFAULT: 'oklch(var(--ink) / <alpha-value>)',
          deep: 'oklch(var(--ink-deep) / <alpha-value>)',
        },
        paper: {
          DEFAULT: 'oklch(var(--paper) / <alpha-value>)',
          2: 'oklch(var(--paper-2) / <alpha-value>)',
          3: 'oklch(var(--paper-3) / <alpha-value>)',
        },
        rule: {
          DEFAULT: 'oklch(var(--rule) / <alpha-value>)',
          2: 'oklch(var(--rule-2) / <alpha-value>)',
        },
        graphite: {
          DEFAULT: 'oklch(var(--graphite) / <alpha-value>)',
          2: 'oklch(var(--graphite-2) / <alpha-value>)',
        },
        primary: {
          DEFAULT: 'oklch(var(--primary) / <alpha-value>)',
          foreground: 'oklch(var(--primary-foreground) / <alpha-value>)',
          hover: 'oklch(var(--primary-hover) / <alpha-value>)',
          neutral: 'oklch(var(--primary-neutral) / <alpha-value>)',
          pale: 'oklch(var(--primary-pale) / <alpha-value>)',
        },
        secondary: {
          DEFAULT: 'oklch(var(--secondary) / <alpha-value>)',
          foreground: 'oklch(var(--secondary-foreground) / <alpha-value>)',
        },
        destructive: {
          DEFAULT: 'oklch(var(--destructive) / <alpha-value>)',
          foreground: 'oklch(var(--destructive-foreground) / <alpha-value>)',
          deep: 'oklch(var(--destructive-deep) / <alpha-value>)',
        },
        muted: {
          DEFAULT: 'oklch(var(--muted) / <alpha-value>)',
          foreground: 'oklch(var(--muted-foreground) / <alpha-value>)',
        },
        accent: {
          DEFAULT: 'oklch(var(--accent) / <alpha-value>)',
          foreground: 'oklch(var(--accent-foreground) / <alpha-value>)',
        },
        card: {
          DEFAULT: 'oklch(var(--card) / <alpha-value>)',
          foreground: 'oklch(var(--card-foreground) / <alpha-value>)',
        },
        popover: {
          DEFAULT: 'oklch(var(--popover) / <alpha-value>)',
          foreground: 'oklch(var(--popover-foreground) / <alpha-value>)',
        },
        sidebar: {
          DEFAULT: 'oklch(var(--sidebar-background) / <alpha-value>)',
          foreground: 'oklch(var(--sidebar-foreground) / <alpha-value>)',
          border: 'oklch(var(--sidebar-border) / <alpha-value>)',
          accent: 'oklch(var(--sidebar-accent) / <alpha-value>)',
        },
        success: {
          DEFAULT: 'oklch(var(--success) / <alpha-value>)',
          foreground: 'oklch(var(--success-foreground) / <alpha-value>)',
          deep: 'oklch(var(--success-deep) / <alpha-value>)',
          pale: 'oklch(var(--success-pale) / <alpha-value>)',
        },
        warning: {
          DEFAULT: 'oklch(var(--warning) / <alpha-value>)',
          foreground: 'oklch(var(--warning-foreground) / <alpha-value>)',
          deep: 'oklch(var(--warning-deep) / <alpha-value>)',
        },
        info: {
          DEFAULT: 'oklch(var(--info) / <alpha-value>)',
          foreground: 'oklch(var(--info-foreground) / <alpha-value>)',
        },
        chart: {
          1: 'oklch(var(--chart-1) / <alpha-value>)',
          2: 'oklch(var(--chart-2) / <alpha-value>)',
          3: 'oklch(var(--chart-3) / <alpha-value>)',
          4: 'oklch(var(--chart-4) / <alpha-value>)',
          5: 'oklch(var(--chart-5) / <alpha-value>)',
          muted: 'oklch(var(--chart-muted) / <alpha-value>)',
        },
      },
      borderRadius: {
        lg: 'var(--radius-lg)',
        md: 'var(--radius-md)',
        sm: 'var(--radius-sm)',
        xl: 'var(--radius-xl)',
        panel: 'var(--radius-panel)',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
      },
      transitionDuration: {
        fast: 'var(--motion-fast)',
        DEFAULT: 'var(--motion-base)',
        slow: 'var(--motion-slow)',
      },
      transitionTimingFunction: {
        DEFAULT: 'var(--motion-ease)',
      },
      letterSpacing: {
        display: 'var(--tracking-display)',
        label: 'var(--tracking-label)',
      },
      spacing: {
        '3xs': 'var(--space-3xs)',
        '2xs': 'var(--space-2xs)',
        xs: 'var(--space-xs)',
        sm: 'var(--space-sm)',
        md: 'var(--space-md)',
        lg: 'var(--space-lg)',
        xl: 'var(--space-xl)',
        '2xl': 'var(--space-2xl)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down var(--motion-base) var(--motion-ease)',
        'accordion-up': 'accordion-up var(--motion-base) var(--motion-ease)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
