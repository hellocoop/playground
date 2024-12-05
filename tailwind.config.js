/** @type {import('tailwindcss').Config} */
export default {
	darkMode: 'media',
	content: ['./index.html', './src/**/*.{svelte,js,ts,jsx,tsx}'],
	theme: {
		extend: {
			spacing: {
				18: '4.5rem'
			},
			colors: {
				charcoal: '#303030',
				gray: {
					DEFAULT: '#D4D4D4',
					800: '#808080',
					1000: '#151515'
				}
			},
			strokeWidth: {
				3: '3px'
			},
			screens: {
				xs: '450px',
				'4xl': '2000px'
			}
		}
	},
	plugins: [
		require('@tailwindcss/forms')({
			strategy: 'class'
		})
	]
};
