import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Fondos escudería
        forge: {
          bg: "#030712",
          surface: "#0d1117",
          card: "#111827",
          border: "#1f2937",
          muted: "#374151",
        },
        // Acentos neón
        neon: {
          cyan: "#00f5ff",
          "cyan-dim": "#00c4cc",
          green: "#39ff14",
          "green-dim": "#22c55e",
          amber: "#ffb700",
          "amber-dim": "#f59e0b",
          red: "#ff2d55",
          "red-dim": "#ef4444",
          purple: "#bf5af2",
        },
        // Severidades
        severity: {
          critical: "#ff2d55",
          warning: "#ffb700",
          info: "#00f5ff",
          success: "#39ff14",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "JetBrains Mono", "Fira Code", "monospace"],
      },
      animation: {
        "pulse-neon": "pulse-neon 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "spin-slow": "spin 3s linear infinite",
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.4s ease-out",
        "gauge-fill": "gaugeFill 1.5s ease-out forwards",
        "blink-cursor": "blink 1s step-end infinite",
        "progress-bar": "progressBar 0.6s ease-out forwards",
        "float": "float 3s ease-in-out infinite",
      },
      keyframes: {
        "pulse-neon": {
          "0%, 100%": {
            boxShadow: "0 0 5px currentColor, 0 0 10px currentColor",
            opacity: "1",
          },
          "50%": {
            boxShadow: "0 0 20px currentColor, 0 0 40px currentColor",
            opacity: "0.8",
          },
        },
        fadeIn: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        gaugeFill: {
          from: { "stroke-dashoffset": "565" },
          to: { "stroke-dashoffset": "var(--gauge-offset)" },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        progressBar: {
          from: { width: "0%" },
          to: { width: "var(--progress-width)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
      backgroundImage: {
        "grid-forge":
          "linear-gradient(rgba(0,245,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,245,255,0.03) 1px, transparent 1px)",
        "gradient-forge":
          "linear-gradient(135deg, #030712 0%, #0a0f1e 50%, #030712 100%)",
        "gradient-card":
          "linear-gradient(135deg, rgba(0,245,255,0.05) 0%, rgba(0,0,0,0) 100%)",
        "gradient-neon-cyan":
          "linear-gradient(135deg, #00f5ff 0%, #00c4cc 100%)",
        "gradient-neon-green":
          "linear-gradient(135deg, #39ff14 0%, #22c55e 100%)",
        "gradient-neon-amber":
          "linear-gradient(135deg, #ffb700 0%, #f59e0b 100%)",
        "gradient-neon-red":
          "linear-gradient(135deg, #ff2d55 0%, #ef4444 100%)",
      },
      backgroundSize: {
        grid: "40px 40px",
      },
      boxShadow: {
        "neon-cyan": "0 0 10px #00f5ff, 0 0 30px rgba(0,245,255,0.3)",
        "neon-green": "0 0 10px #39ff14, 0 0 30px rgba(57,255,20,0.3)",
        "neon-amber": "0 0 10px #ffb700, 0 0 30px rgba(255,183,0,0.3)",
        "neon-red": "0 0 10px #ff2d55, 0 0 30px rgba(255,45,85,0.3)",
        card: "0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
        "card-hover":
          "0 8px 40px rgba(0,245,255,0.1), inset 0 1px 0 rgba(255,255,255,0.08)",
      },
      borderRadius: {
        forge: "12px",
        "forge-lg": "16px",
      },
    },
  },
  plugins: [],
};

export default config;
