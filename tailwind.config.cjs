/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1rem"
    },
    extend: {
      fontFamily: {
        display: ["Syne", "system-ui", "sans-serif"],
        sans: ["DM Sans", "system-ui", "sans-serif"]
      },
      colors: {
        border: "hsl(25 15% 18%)",
        input: "hsl(25 12% 14%)",
        ring: "hsl(32 95% 55%)",
        background: "hsl(30 12% 7%)",
        foreground: "hsl(40 15% 96%)",
        primary: {
          DEFAULT: "hsl(32 95% 55%)",
          foreground: "hsl(30 12% 7%)"
        },
        secondary: {
          DEFAULT: "hsl(28 14% 14%)",
          foreground: "hsl(40 15% 96%)"
        },
        muted: {
          DEFAULT: "hsl(28 12% 14%)",
          foreground: "hsl(35 10% 58%)"
        },
        accent: {
          DEFAULT: "hsl(32 90% 50%)",
          foreground: "hsl(30 12% 7%)"
        },
        destructive: {
          DEFAULT: "hsl(0 72% 52%)",
          foreground: "hsl(40 15% 96%)"
        },
        card: {
          DEFAULT: "hsla(28, 14%, 10%, 0.75)",
          foreground: "hsl(40 15% 96%)"
        }
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.375rem"
      },
      boxShadow: {
        glass: "0 20px 50px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,180,80,0.06)",
        subtle: "0 12px 32px rgba(0,0,0,0.4)",
        glow: "0 0 24px -4px rgba(251,191,36,0.2)"
      },
      backdropBlur: {
        xs: "2px"
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(4px) scale(0.98)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" }
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        "stagger-1": { "0%": { opacity: "0", transform: "translateY(12px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        "stagger-2": { "0%": { opacity: "0", transform: "translateY(12px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        "stagger-3": { "0%": { opacity: "0", transform: "translateY(12px)" }, "100%": { opacity: "1", transform: "translateY(0)" } }
      },
      animation: {
        "fade-in": "fade-in 0.25s ease-out forwards",
        "slide-up": "slide-up 0.4s ease-out forwards",
        "stagger-1": "stagger-1 0.4s ease-out 0.05s forwards",
        "stagger-2": "stagger-2 0.4s ease-out 0.15s forwards",
        "stagger-3": "stagger-3 0.4s ease-out 0.25s forwards"
      }
    }
  },
  plugins: [require("tailwindcss-animate")]
};

