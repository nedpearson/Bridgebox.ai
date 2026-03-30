/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          500: '#6366f1', // Indigo baseline
          600: '#4f46e5',
          700: '#4338ca',
          DEFAULT: "#6366f1", // Standardizes the blue-heavy buttons to Indigo matching the $100M theme
          dark: "#4f46e5",
        },
        accent: {
          DEFAULT: "#10B981", // Emerald success tracking
          light: '#34d399',
          dark: '#059669',
        },
        dark: {
          DEFAULT: "#0f172a", // Slate-900 baseline
          lighter: "#1e293b", // Slate-800
          darker: "#020617", // Slate-950
        },
        warning: "#f59e0b",
        error: "#ef4444",
        success: "#10b981",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
