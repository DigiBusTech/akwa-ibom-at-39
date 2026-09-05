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
        background: "var(--background)",
        foreground: "var(--foreground)",
        akwa: {
          orange: {
            DEFAULT: "#FF7A00",
            light: "#FFA043",
            dark: "#D95D00",
            glow: "rgba(255, 122, 0, 0.35)",
          },
          green: {
            DEFAULT: "#008751",
            light: "#10B981",
            dark: "#046A38",
            glow: "rgba(0, 135, 81, 0.35)",
          },
          gold: {
            DEFAULT: "#F59E0B",
            light: "#FCD34D",
            dark: "#B45309",
            glow: "rgba(245, 158, 11, 0.3)",
          },
          navy: {
            DEFAULT: "#0B1120",
            card: "#0F172A",
            border: "#1E293B",
            accent: "#1E2235",
          },
        },
      },
      fontFamily: {
        sans: ["var(--font-outfit)", "system-ui", "sans-serif"],
        heading: ["var(--font-outfit)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        "glow-orange": "0 0 25px rgba(255, 122, 0, 0.4)",
        "glow-green": "0 0 25px rgba(0, 135, 81, 0.4)",
        "glow-gold": "0 0 25px rgba(245, 158, 11, 0.4)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 6s ease-in-out infinite",
        "spin-reverse": "spin-reverse 1.2s linear infinite",
        "pulse-fast": "pulse 0.9s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "marquee": "marquee 30s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "spin-reverse": {
          from: { transform: "rotate(360deg)" },
          to: { transform: "rotate(0deg)" },
        },
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-100%)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
