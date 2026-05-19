/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ms: {
          cream: "#F5F0E8",
          navy: "#0B1F3A",
          blue: "#2D6CDF",
          dark: "#111827",
          muted: "#8A8175",
          border: "#E5DED3",
        },
      },
      fontFamily: {
        display: ["Inter", "system-ui", "sans-serif"],
        body: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 18px 45px rgba(11, 31, 58, 0.08)",
      },
    },
  },
  plugins: [],
};