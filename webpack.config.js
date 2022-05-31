/* eslint-disable */
const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

console.log(process.argv[2]);
const loaders = [
  {
    test: /\.jsx?$/,
    exclude: /(node_modules)/,
    use: {
      loader: 'babel-loader',
      options: {
        presets: ['@babel/preset-env', '@babel/preset-react']
      }
    }
  },
  {
    test: /\.tsx?$/,
    exclude: /node_modules/,
    loader: 'babel-loader',
    options: {
      presets: ['@babel/preset-env', '@babel/preset-react', '@babel/preset-typescript']
    }
  }, // 先解析ts和tsx，rule规则从下往上
  {
    test: /\.svg$/,
    use: [
      {
        loader: 'svg-inline-loader'
      }
    ]
  }
];

const config = {
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx']
  },
  entry: path.join(__dirname, './web/index.ts'),
  output: {
    path: path.join(__dirname, './dist'),
    filename: 'web.min.js',
    libraryTarget: 'umd',
    umdNamedDefine: true
  },

  module: {
    rules: loaders
  },

  mode: 'production',
  devtool: 'nosources-source-map',

  plugins: [
    new CleanWebpackPlugin({
      cleanAfterEveryBuildPatterns: ['dist']
    }),
    new webpack.optimize.AggressiveMergingPlugin()
  ],

  performance: {
    maxAssetSize: 1000000,
    hints: 'warning'
  }
};

module.exports = config;
