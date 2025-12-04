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
        primary: "#003580",
        secondary: "#0071c2",
        accent: "#febb02",
        dark: "#2D3436",
        light: "#7F8C8D",
        success: "#2ECC71",
        bg: {
          primary: "#FFFFFF",
          secondary: "#F5F7FA",
          tertiary: "#E8EDF2",
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
