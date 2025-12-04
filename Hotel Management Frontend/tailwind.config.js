/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'heading': ['Fredoka', 'Poppins', 'system-ui', 'sans-serif'],
        'body': ['Poppins', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        primary: "#0056D6",
        primaryDark: "#003580",
        primaryHover: "#0046B1",
        accent: "#F4B400",
        accentHover: "#D99A00",
        neutral: {
          50: "#F9FAFB",
          100: "#F3F4F6",
          200: "#E5E7EB",
          300: "#D1D5DB",
          500: "#6B7280",
          600: "#4B5563",
          800: "#111827",
          900: "#0B1220",
        },
        dark: "#0B1220",
        light: "#6B7280",
        success: "#16A34A",
        bg: {
          primary: "#FFFFFF",
          secondary: "#F9FAFB",
          tertiary: "#F3F4F6",
        },
        error: "#DC2626",
      },
      spacing: {
        "safe": "env(safe-area-inset-bottom)",
      },
      borderRadius: {
        lg: "15px",
        md: "8px",
        sm: "6px",
      },
      letterSpacing: {
        'heading': '0.05em',
        'subheading': '0.025em',
      },
      fontSize: {
        'display': ['4rem', { lineHeight: '1.1', letterSpacing: '0.05em' }],
        'heading-xl': ['3rem', { lineHeight: '1.2', letterSpacing: '0.05em' }],
        'heading-lg': ['2.25rem', { lineHeight: '1.3', letterSpacing: '0.05em' }],
        'heading-md': ['1.75rem', { lineHeight: '1.3', letterSpacing: '0.05em' }],
        'heading-sm': ['1.25rem', { lineHeight: '1.4', letterSpacing: '0.05em' }],
      },
    },
  },
  plugins: [],
}
