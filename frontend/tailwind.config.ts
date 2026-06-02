import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#060C14",
        surface: "#0A1525",
        card: "#0A1525",
        "card-hover": "#0F1D35",
        primary: "#00D68F",
        "primary-hover": "#00BA7A",
        accent: "#22D3EE",
        success: "#00D68F",
        warning: "#F59E0B",
        danger: "#F43F5E",
        border: "#152B45",
        foreground: "#EDF2FF",
        "foreground-muted": "#4E6E8E",
      },
      fontFamily: {
        sans: ["IBM Plex Sans", "system-ui", "sans-serif"],
        display: ["Space Grotesk", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-hero":
          "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(0,214,143,0.08) 0%, transparent 70%), linear-gradient(180deg, #060C14 0%, #060C14 100%)",
        "gradient-card":
          "linear-gradient(145deg, #0A1525 0%, #0D1A30 100%)",
        "gradient-primary":
          "linear-gradient(135deg, #00D68F 0%, #22D3EE 100%)",
        "dot-grid":
          "radial-gradient(circle, #152B45 1px, transparent 1px)",
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
        "slide-down": "slideDown 0.25s ease-out",
        "cursor-blink": "cursorBlink 1.2s step-end infinite",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        float: "float 8s ease-in-out infinite",
        "glow-green": "glowGreen 2.5s ease-in-out infinite alternate",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(16px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-12px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        cursorBlink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-16px)" },
        },
        glowGreen: {
          "0%": { boxShadow: "0 0 20px rgba(0, 214, 143, 0.15)" },
          "100%": { boxShadow: "0 0 40px rgba(0, 214, 143, 0.35)" },
        },
      },
      boxShadow: {
        card: "0 2px 20px rgba(0, 0, 0, 0.5), 0 1px 0 rgba(255,255,255,0.03) inset",
        "card-hover": "0 8px 40px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(0, 214, 143, 0.15)",
        glow: "0 0 24px rgba(0, 214, 143, 0.25)",
        "glow-lg": "0 0 48px rgba(0, 214, 143, 0.3)",
        "glow-cyan": "0 0 24px rgba(34, 211, 238, 0.25)",
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
    },
  },
  plugins: [],
};

export default config;
