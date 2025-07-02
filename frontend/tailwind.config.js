/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,js,jsx}"],
  theme: {
    extend: {
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-5deg)' },
          '50%': { transform: 'rotate(5deg)' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0.8)', opacity: 0 },
          '100%': { transform: 'scale(1)', opacity: 1 },
        },
      },
      animation: {
        wiggle: 'wiggle 0.3s ease-in-out infinite',
        bounceIn: 'bounceIn 0.4s ease-out',
      },
      fontFamily: {
        sans: ['ComicReliefB', 'sans-serif'],
      },
    },
  },
  plugins: [],
}