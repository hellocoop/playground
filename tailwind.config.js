module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{svelte,js,ts,html}",
  ],
  theme: {
    extend: {
      colors: {
        charcoal: '#303030',
        gray: {
          DEFAULT: '#D4D4D4'
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms')
  ],
}
