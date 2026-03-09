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
      colors: {
        border: "hsl(214 32% 18%)",
        input: "hsl(214 32% 18%)",
        ring: "hsl(212 96% 78%)",
        background: "hsl(222 47% 11%)",
        foreground: "hsl(210 40% 98%)",
        primary: {
          DEFAULT: "hsl(212 96% 78%)",
          foreground: "hsl(222 47% 11%)"
        },
        secondary: {
          DEFAULT: "hsl(217 33% 17%)",
          foreground: "hsl(210 40% 98%)"
        },
        muted: {
          DEFAULT: "hsl(217 33% 17%)",
          foreground: "hsl(215 20% 65%)"
        },
        accent: {
          DEFAULT: "hsl(217 33% 17%)",
          foreground: "hsl(210 40% 98%)"
        },
        destructive: {
          DEFAULT: "hsl(0 84% 60%)",
          foreground: "hsl(210 40% 98%)"
        },
        card: {
          DEFAULT: "hsla(222, 47%, 11%, 0.6)",
          foreground: "hsl(210 40% 98%)"
        }
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.375rem"
      },
      boxShadow: {
        glass: "0 18px 45px rgba(15,23,42,0.75)",
        subtle: "0 10px 30px rgba(15,23,42,0.45)"
      },
      backdropBlur: {
        xs: "2px"
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(4px) scale(0.98)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" }
        }
      },
      animation: {
        "fade-in": "fade-in 0.18s ease-out"
      }
    }
  },
  plugins: [require("tailwindcss-animate")]
};

