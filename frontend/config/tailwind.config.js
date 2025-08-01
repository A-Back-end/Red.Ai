/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
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
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
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
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
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
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-down": {
          "0%": { opacity: "0", transform: "translateY(-20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-left": {
          "0%": { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "slide-in-right": {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        "float-delayed": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        "pulse-slow": {
          "0%, 100%": { 
            transform: "scale(1)",
            opacity: "0.6"
          },
          "50%": { 
            transform: "scale(1.5)",
            opacity: "1"
          },
        },
        "expand": {
          "0%, 100%": { 
            transform: "scale(1)",
            opacity: "0.2"
          },
          "50%": { 
            transform: "scale(2)",
            opacity: "0"
          },
        },
        "data-flow": {
          "0%, 100%": { opacity: "0.3" },
          "50%": { opacity: "0.8" },
        },
        "signal": {
          "0%": { 
            left: "0",
            opacity: "0"
          },
          "10%": { opacity: "1" },
          "90%": { opacity: "1" },
          "100%": { 
            left: "100%",
            opacity: "0"
          },
        },
        "cluster-pulse": {
          "0%, 100%": { 
            transform: "scale(1)",
            opacity: "0.1"
          },
          "50%": { 
            transform: "scale(1.1)",
            opacity: "0.3"
        },
      },
        "cluster-pulse-reverse": {
          "0%, 100%": { 
            transform: "scale(1.1)",
            opacity: "0.3"
          },
          "50%": { 
            transform: "scale(1)",
            opacity: "0.1"
          },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        "gradient": {
          "0%, 100%": { "background-position": "0% 50%" },
          "50%": { "background-position": "100% 50%" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-in",
        "fade-in-up": "fade-in-up 0.6s ease-out",
        "fade-in-down": "fade-in-down 0.6s ease-out",
        "slide-in-left": "slide-in-left 0.6s ease-out",
        "slide-in-right": "slide-in-right 0.6s ease-out",
        "float": "float 6s ease-in-out infinite",
        "float-delayed": "float-delayed 6s ease-in-out infinite 2s",
        "pulse-slow": "pulse-slow 3s ease-in-out infinite",
        "expand": "expand 3s ease-in-out infinite",
        "data-flow": "data-flow 4s ease-in-out infinite",
        "signal": "signal 4s linear infinite",
        "cluster-pulse": "cluster-pulse 6s ease-in-out infinite",
        "cluster-pulse-reverse": "cluster-pulse-reverse 6s ease-in-out infinite",
        "spin-slow": "spin-slow 60s linear infinite",
        "gradient": "gradient 15s ease infinite",
      },
      animationDelay: {
        '200': '200ms',
        '400': '400ms',
        '600': '600ms',
        '800': '800ms',
        '1000': '1000ms',
      },
      backdropBlur: {
        '20': '20px',
      },
      spacing: {
        '15': '3.75rem',
        '18': '4.5rem',
      },
      width: {
        '0.75': '3px',
      },
      height: {
        '0.75': '3px',
      },
    },
  },
  plugins: [],
} 