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
        // Material Design Color Palette
        primary: {
          50: '#f5f6f7',
          100: '#e8eaec', 
          200: '#d4d8dd',
          300: '#b3bbc4',
          400: '#8b9aa7',
          500: '#393E46', // Main primary
          600: '#333841',
          700: '#2d323a',
          800: '#222831', // Dark primary
          900: '#1a1e24'
        },
        secondary: {
          50: '#f9f9fa',
          100: '#f1f1f3',
          200: '#e8e8eb',
          300: '#d9d9dd',
          400: '#c4c4ca',
          500: '#EEEEEE', // Light accent
          600: '#d6d6d6',
          700: '#b8b8b8',
          800: '#9a9a9a',
          900: '#7c7c7c'
        },
        dark: {
          50: '#f5f6f7',
          100: '#e8eaec',
          200: '#d4d8dd',
          300: '#b3bbc4',
          400: '#8b9aa7',
          500: '#393E46',
          600: '#333841',
          700: '#2d323a', 
          800: '#222831',
          900: '#1a1e24'
        },
        // Legacy colors for backward compatibility
        'beaver': {
          900: '#222831', 
          700: '#393E46', 
          500: '#EEEEEE', 
          300: '#EEEEEE',
        },
        'accent': {
          blue: '#393E46',
          purple: '#EEEEEE',
          glow: '#EEEEEE'
        }
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'glimmer': 'glimmer 2s ease-in-out infinite',
        'slide-down': 'slideDown 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'fade-out': 'fadeOut 0.3s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'scale-out': 'scaleOut 0.3s ease-out',
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'carousel': 'carousel 60s linear infinite',
        'bounce-slow': 'bounce-slow 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'ripple': 'ripple 0.6s linear',
        'elastic': 'elastic 0.6s ease-out'
      },
      keyframes: {
        glow: {
          '0%': { 
            boxShadow: '0 0 20px rgba(238, 238, 238, 0.3)',
            borderColor: 'rgba(238, 238, 238, 0.5)'
          },
          '100%': { 
            boxShadow: '0 0 30px rgba(238, 238, 238, 0.6)',
            borderColor: 'rgba(238, 238, 238, 0.8)'
          }
        },
        glimmer: {
          '0%': { 
            transform: 'translateX(-200%)'
          },
          '100%': { 
            transform: 'translateX(200%)'
          }
        },
        slideDown: {
          '0%': { 
            opacity: '0',
            transform: 'translateY(-20px)' 
          },
          '100%': { 
            opacity: '1',
            transform: 'translateY(0)' 
          }
        },
        slideUp: {
          '0%': { 
            opacity: '0',
            transform: 'translateY(20px)' 
          },
          '100%': { 
            opacity: '1',
            transform: 'translateY(0)' 
          }
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' }
        },
        scaleIn: {
          '0%': { 
            opacity: '0',
            transform: 'scale(0.95)' 
          },
          '100%': { 
            opacity: '1',
            transform: 'scale(1)' 
          }
        },
        scaleOut: {
          '0%': { 
            opacity: '1',
            transform: 'scale(1)' 
          },
          '100%': { 
            opacity: '0',
            transform: 'scale(0.95)' 
          }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' }
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
        },
        shimmer: {
          '0%': {
            backgroundPosition: '-200% 0'
          },
          '100%': {
            backgroundPosition: '200% 0'
          }
        },
        ripple: {
          '0%': {
            transform: 'scale(0)',
            opacity: '0.7'
          },
          '100%': {
            transform: 'scale(4)',
            opacity: '0'
          }
        },
        elastic: {
          '0%': {
            transform: 'scale(0)'
          },
          '50%': {
            transform: 'scale(1.05)'
          },
          '100%': {
            transform: 'scale(1)'
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'Monaco', 'Consolas', 'monospace']
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'material': '0 2px 4px rgba(0,0,0,0.1), 0 8px 16px rgba(0,0,0,0.1)',
        'material-lg': '0 4px 8px rgba(0,0,0,0.12), 0 16px 32px rgba(0,0,0,0.12)',
        'material-xl': '0 8px 16px rgba(0,0,0,0.15), 0 32px 64px rgba(0,0,0,0.15)',
        'glow-sm': '0 0 10px rgba(238, 238, 238, 0.3)',
        'glow': '0 0 20px rgba(238, 238, 238, 0.4)',
        'glow-lg': '0 0 30px rgba(238, 238, 238, 0.5)'
      },
      borderRadius: {
        'material': '12px',
        'material-lg': '16px',
        'material-xl': '20px'
      }
    },
  },
  plugins: [],
}