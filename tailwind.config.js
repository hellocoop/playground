module.exports = {
  darkMode: 'media',
  content: [
    "./index.html",
    "./src/**/*.{svelte,js,ts,html}",
  ],
  theme: {
    extend: {
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
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms')({
      strategy: 'class'
    })
  ],
}
