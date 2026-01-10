/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: '#ffffff',
                surface: '#f8f9fa',
                primary: '#4f46e5', // Indigo 600
                secondary: '#64748b', // Slate 500
                success: '#059669', // Emerald 600
                danger: '#dc2626', // Red 600
                warning: '#d97706', // Amber 600
                accent: '#8b5cf6', // Violet 500
            },
            fontFamily: {
                sans: ['Manrope', 'Inter', 'system-ui', 'sans-serif'],
                display: ['Manrope', 'sans-serif'],
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
            },
        },
    },
    plugins: [],
}
