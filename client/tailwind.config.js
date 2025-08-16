/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'beaver': {
          900: '#27374D', // Deep navy
          700: '#526D82', // Steel blue  
          500: '#9DB2BF', // Light blue
          300: '#DDE6ED', // Light gray
        },
        'dark': {
          bg: '#27374D',
          card: '#526D82',
          border: '#9DB2BF',
          text: '#DDE6ED',
          muted: '#9DB2BF'
        },
        'accent': {
          blue: '#526D82',
          purple: '#9DB2BF',
          glow: '#DDE6ED'
        }
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'slide': 'slide 30s linear infinite',
        'glimmer': 'glimmer 2s ease-in-out infinite',
        'carousel': 'carousel 60s linear infinite',
        'bounce-slow': 'bounce-slow 3s ease-in-out infinite'
      },
      keyframes: {
        glow: {
          '0%': { 
            boxShadow: '0 0 20px rgba(157, 178, 191, 0.3)',
            borderColor: 'rgba(157, 178, 191, 0.5)'
          },
          '100%': { 
            boxShadow: '0 0 30px rgba(221, 230, 237, 0.6)',
            borderColor: 'rgba(221, 230, 237, 0.8)'
          }
        },
        glimmer: {
          '0%': { 
            backgroundPosition: '-200% 0'
          },
          '100%': { 
            backgroundPosition: '200% 0'
          }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        slide: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-100%)' }
        },
        carousel: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' }
        },
        'bounce-slow': {
          '0%, 100%': {
            transform: 'translateY(-25%)',
            animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)'
          },
          '50%': {
            transform: 'translateY(0)',
            animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)'
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'Monaco', 'Consolas', 'monospace']
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}