/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "`./views/**/*.ejs`",  
    "./public/**/*.html", 
    "./public/**/*.js",    
    "./public/css/**/*.css" 
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('daisyui'),
  ],
  daisyui: {
    themes: ["dim"],  
  },
};