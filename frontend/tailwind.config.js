/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        purple: {
          DEFAULT: "#6b5b8a", // Main purple color
          light: "#b7a2d5", // Light purple for accents
          dark: "#4C1D95", // Darker purple for buttons and highlights
          darker: "#3E2A60", // Even darker for hover states
        },
        teal: {
          DEFAULT: "#3ebf77", // Teal for success messages or accents
        },
        gold: {
          DEFAULT: "#f6a832", // Gold for highlights or alerts
        },
        dark: {
          DEFAULT: "#121212", // Main dark background
          surface: "#1e1e1e", // Slightly lighter surface color
        },
        gray: {
          DEFAULT: "#e0e0e0", // Light gray for text
          medium: "#4a4a4a", // Medium gray for borders or dividers
          dark: "#2a2a2a", // Darker gray for accents
        },
        // Adding modern variations for buttons
        "button-purple": "#6b5b8a", // Base purple for buttons
        "button-purple-hover": "#7787ad", // Hover state for buttons
        "purple-light-200": "#9b7ec1",
        "teal-refresh": "#3ebf77",
        "grey-darker": "#333333",
        "purple-darker-200": "#5E2B9A",
      },
      boxShadow: {
        "lg-hover": "0 4px 20px rgba(0, 0, 0, 0.5)",
      },
      screens: {
        xs: "430px", // Custom breakpoint for small screens
        sm: "640px", // Small devices
        md: "768px", // Medium devices
        lg: "1024px", // Large devices
        xl: "1280px", // Extra large devices
        "2xl": "1536px", // Double extra large devices
      },
    },
  },
  plugins: [],
};
