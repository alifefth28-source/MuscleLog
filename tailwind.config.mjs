/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: {
        ml: {
          bg: "#060B14",
          surface: "rgba(255, 255, 255, 0.04)",
          card: "rgba(255, 255, 255, 0.06)",
          border: "rgba(255, 255, 255, 0.08)",
          text: "#E8ECF4",
          muted: "#8892A6",
          subtle: "#4A5568",
          accent: "#3B82F6",
          "accent-light": "#60A5FA",
          "accent-dim": "rgba(59, 130, 246, 0.12)",
          "accent-glow": "rgba(59, 130, 246, 0.25)",
          warning: "#F59E0B",
          "warning-dim": "rgba(245, 158, 11, 0.1)",
          success: "#10B981",
          "success-dim": "rgba(16, 185, 129, 0.1)",
          danger: "#EF4444",
        },
      },
      fontFamily: {
        sans: ['"Inter"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
      },
      borderRadius: {
        xl: "16px",
        "2xl": "20px",
      },
      backdropBlur: {
        glass: "20px",
      },
    },
  },
  plugins: [],
};
