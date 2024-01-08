const path = require('path');

module.exports = {
  entry: './index.ts',
  output: {
    filename: 'bundle.prod.js',
    path: path.resolve(__dirname, 'dist')
  },
  mode: 'production',
  devServer: {
    allowedHosts: 'all',
    https: true,
    historyApiFallback: true,
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    port: 4200,
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules|\.html$/
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  }
};
