/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Warm Dark Mode palette - Cozy and sophisticated
        background: {
          DEFAULT: "#1c1917", // Warm dark brown
          surface: "#292524", // Lighter warm brown
          elevated: "#44403c", // Hover/elevated state
        },
        primary: {
          DEFAULT: "#fb923c", // Warm orange
          light: "#fdba74",
          dark: "#f97316",
          foreground: "#000000",
        },
        success: {
          DEFAULT: "#84cc16", // Sage green
          light: "#a3e635",
          dark: "#65a30d",
        },
        error: {
          DEFAULT: "#ef4444",
          light: "#f87171",
          dark: "#dc2626",
        },
        accent: {
          DEFAULT: "#fbbf24", // Soft yellow
          light: "#fcd34d",
          dark: "#f59e0b",
        },
        text: {
          primary: "#fafaf9", // Almost white
          secondary: "#a8a29e", // Warm gray
          muted: "#78716c", // Muted warm gray
        },
        border: {
          DEFAULT: "#44403c",
          light: "#57534e",
        },
        // Legacy colors for backward compatibility during migration
        purple: {
          DEFAULT: "#8b5cf6",
          light: "#a78bfa",
          dark: "#7c3aed",
          darker: "#6d28d9",
        },
        teal: {
          DEFAULT: "#14b8a6",
          refresh: "#14b8a6",
        },
        gold: {
          DEFAULT: "#f59e0b",
        },
        dark: {
          DEFAULT: "#0a0a0f",
          surface: "#12121a",
        },
        gray: {
          DEFAULT: "#e5e7eb",
          medium: "#6b7280",
          dark: "#374151",
        },
        "grey-darker": "#1f2937",
        "button-purple": "#8b5cf6",
        "button-purple-hover": "#a78bfa",
        "purple-light-200": "#c4b5fd",
        "purple-darker-200": "#7c3aed",
      },
      boxShadow: {
        "warm-sm": "0 2px 8px rgba(0, 0, 0, 0.3)",
        "warm-md": "0 4px 16px rgba(0, 0, 0, 0.4)",
        "warm-lg": "0 8px 24px rgba(0, 0, 0, 0.5)",
      },
      borderRadius: {
        lg: "1rem", // 16px
        xl: "1.5rem", // 24px
        "2xl": "2rem", // 32px
        "3xl": "2.5rem", // 40px
      },
      screens: {
        xs: "430px",
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/forms")({
      strategy: 'class',
    }),
  ],
};
