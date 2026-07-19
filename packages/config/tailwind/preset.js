/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef7ee",
          100: "#d5ebd6",
          200: "#aad7ac",
          300: "#7ec27f",
          400: "#53ad55",
          500: "#2f8f32", // EagleHR primary green
          600: "#257226",
          700: "#1c561d",
          800: "#123915",
          900: "#091d0a",
        },
        accent: {
          50: "#fffaeb",
          100: "#fef0c7",
          200: "#fde08a",
          300: "#fbc94d",
          400: "#f9b023",
          500: "#f0930b", // warm gold — CTAs, highlights, boosted badges
          600: "#d17206",
          700: "#a8530a",
          800: "#88420f",
          900: "#71370f",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 2px 8px -2px rgb(0 0 0 / 0.06), 0 4px 16px -4px rgb(0 0 0 / 0.08)",
        lift: "0 8px 24px -6px rgb(0 0 0 / 0.12), 0 4px 8px -4px rgb(0 0 0 / 0.08)",
        glow: "0 0 0 1px rgb(47 143 50 / 0.15), 0 4px 20px -4px rgb(47 143 50 / 0.35)",
        "glow-accent": "0 0 0 1px rgb(240 147 11 / 0.2), 0 4px 24px -4px rgb(240 147 11 / 0.4)",
        "glow-lg": "0 0 0 1px rgb(47 143 50 / 0.15), 0 8px 40px -6px rgb(47 143 50 / 0.45)",
      },
      backgroundImage: {
        "brand-radial": "radial-gradient(circle at top left, var(--tw-gradient-stops))",
        "hero-grid":
          "linear-gradient(to right, rgb(0 0 0 / 0.04) 1px, transparent 1px), linear-gradient(to bottom, rgb(0 0 0 / 0.04) 1px, transparent 1px)",
        "mesh-brand":
          "radial-gradient(at 20% 20%, rgb(47 143 50 / 0.25) 0px, transparent 50%), radial-gradient(at 80% 0%, rgb(240 147 11 / 0.2) 0px, transparent 50%), radial-gradient(at 0% 80%, rgb(83 173 85 / 0.2) 0px, transparent 50%)",
      },
      backgroundSize: {
        "grid-cell": "32px 32px",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.96)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          from: { backgroundPosition: "200% 0" },
          to: { backgroundPosition: "-200% 0" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.6s ease-out both",
        "fade-in-up": "fade-in-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) both",
        "scale-in": "scale-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) both",
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 2.5s linear infinite",
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
