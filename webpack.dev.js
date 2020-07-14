const path = require('path');
const common = require("./webpack.common");
const { merge } = require("webpack-merge");

const HtmlWebpackPlugin = require("html-webpack-plugin");


module.exports = merge(common, {
  devServer: {
    hot: true
  },
  mode: 'development',
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/template.html"
    })
  ],
  module: {
    rules: [
      {
        test: /\.js/,
        exclude: /(node_modules)/,
        use: ['aframe-super-hot-loader']
      },
      {
        test: /\.html$/,
        use: ["aframe-super-hot-html-loader"]
      },
      {
        test: /\.sccs$/,
        use: [
          "style-loader", // 3. Inject styles into DOM
          "css-loader", //2. Turns css into commonjs
          "sass-loader" //1. Turns sass into css
        ]
      }
    ]
  }
});