const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')

// Phaser webpack config
const phaserModule = path.join(__dirname, '/node_modules/phaser-ce/')
const phaser = path.join(phaserModule, 'build/custom/phaser-split.js')
const pixi = path.join(phaserModule, 'build/custom/pixi.js')
const p2 = path.join(phaserModule, 'build/custom/p2.js')

module.exports = {

  entry: {
    app: './src/index.js',
    vendor: ['pixi', 'p2', 'phaser'],
  },

  output: {
    filename: 'bundle.js',
  },

  plugins: [
    new webpack.optimize.CommonsChunkPlugin({ name: 'vendor', filename: 'vendor.bundle.js' }),
    new HtmlWebpackPlugin({ template: 'index.html' }),
  ],

  module: {
    rules: [
      // { test: /\.js$/, use: ['babel-loader'], include: path.join(__dirname, 'src') },
      { test: /pixi\.js/, use: ['expose-loader?PIXI'] },
      { test: /phaser-split\.js$/, use: ['expose-loader?Phaser'] },
      { test: /p2\.js/, use: ['expose-loader?p2'] },
    ],
  },

  devServer: {
    open: true,
    port: 3000,
  },

  resolve: {
    alias: { phaser, pixi, p2 },
  },
}
