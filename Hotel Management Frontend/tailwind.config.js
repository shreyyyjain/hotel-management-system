/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1C6BAD",
        secondary: "#2ECC71",
        accent: "#E67E22",
        dark: "#2D3436",
        light: "#7F8C8D",
        bg: {
          primary: "#FFFFFF",
          secondary: "#F2F5FA",
          tertiary: "#ECF0F1",
        },
        error: "#E74C3C",
      },
      spacing: {
        "safe": "env(safe-area-inset-bottom)",
      },
      borderRadius: {
        lg: "15px",
        md: "8px",
        sm: "6px",
      },
    },
  },
  plugins: [],
}
