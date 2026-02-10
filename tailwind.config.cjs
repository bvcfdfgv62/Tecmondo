/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './index.html',
        './src/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
        extend: {
            colors: {
                background: '#020617', // Deep Obsidian
                surface: '#0F1219',    // Carbon
                surfaceHighlight: '#1E293B',
                border: '#1E293B',
                primary: {
                    DEFAULT: '#06B6D4', // Electric Cyan
                    hover: '#0891B2',
                    foreground: '#FFFFFF',
                },
                secondary: {
                    DEFAULT: '#64748B', // Slate 500
                    foreground: '#FFFFFF',
                },
                destructive: {
                    DEFAULT: '#EF4444',
                    foreground: '#FFFFFF',
                },
                text: {
                    primary: '#F8FAFC', // Slate 50
                    secondary: '#94A3B8', // Slate 400
                    muted: '#64748B', // Slate 500
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            borderRadius: {
                'none': '0',
                'sm': '0.125rem', // 2px - Sharp/Tech feel
                DEFAULT: '0.25rem', // 4px
                'md': '0.375rem', // 6px
                'lg': '0.5rem', // 8px
                'xl': '0.75rem', // 12px
                '2xl': '1rem', // 16px
                'full': '9999px',
            },
            animation: {
                'fade-in': 'fadeIn 0.3s ease-out',
                'slide-in-right': 'slideInRight 0.4s ease-out',
                'scale-in': 'scaleIn 0.2s ease-out',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideInRight: {
                    '0%': { transform: 'translateX(20px)', opacity: '0' },
                    '100%': { transform: 'translateX(0)', opacity: '1' },
                },
                scaleIn: {
                    '0%': { transform: 'scale(0.95)', opacity: '0' },
                    '100%': { transform: 'scale(1)', opacity: '1' },
                }
            }
        },
    },
    plugins: [],
};
