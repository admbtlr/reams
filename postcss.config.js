module.exports = {
  plugins: [
    require('autoprefixer'), // Automatically include vendor prefixes
    require('postcss-nested'), // Enable nested rules, like in Sass
    require('postcss-import'),
    require('postcss-simple-vars'),
    require('postcss-each'),
    require('postcss-color-function')
  ]
}