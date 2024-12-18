const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: './api/remove-background.js',
  output: {
    filename: 'remove-background.bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  target: 'node',
  mode: 'production',
  externals: {
    sharp: 'commonjs sharp', // Exclude sharp
    'onnxruntime-node': 'commonjs onnxruntime-node', // Exclude onnxruntime-node
  },
  resolve: {
    extensions: ['.js', '.json'],
  },
  module: {
    rules: [
      {
        test: /\.node$/,
        use: 'node-loader', // Handle native .node files
      },
    ],
  },
  plugins: [
    new webpack.IgnorePlugin({
      resourceRegExp: /^\.\/locale$/, // Example: Ignore unnecessary locales
    }),
  ],
};
