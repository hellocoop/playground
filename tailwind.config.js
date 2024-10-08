module.exports = {
	darkMode: 'media',
	content: ['./index.html', './src/**/*.{svelte,js,ts,html}'],
	theme: {
		extend: {
			spacing: {
				18: '4.5rem'
			},
			colors: {
				charcoal: '#303030',
				gray: {
					DEFAULT: '#D4D4D4',
					1000: '#151515',
					800: '#808080'
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
