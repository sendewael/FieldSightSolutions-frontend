const path = require('path');
const Dotenv = require('dotenv-webpack');

module.exports = {
  mode: 'development', // Change this to 'production' for production builds
  entry: './src/index.js', // Entry point for your application
  output: {
    path: path.resolve(__dirname, 'dist'), // Output directory for bundled files
    filename: '[name].[contenthash].bundle.js', // Ensure each chunk has a unique name
    chunkFilename: '[name].[contenthash].chunk.js' // For dynamically loaded chunks
  },
  module: {
    rules: [
      // CSS Loader Rule
      {
        test: /\.css$/i, // Match any .css file
        use: [
          'style-loader',   // Inject CSS into the DOM via <style> tags
          'css-loader',     // Allows Webpack to understand CSS imports
          'postcss-loader', // Process CSS with PostCSS (required for Tailwind)
        ],
      },
      // JavaScript Loader Rule (optional for ES6+ code transpilation)
      {
        test: /\.js$/,
        exclude: /node_modules/, // Don't transpile node_modules
        use: {
          loader: 'babel-loader', // Transpile JS with Babel
          options: {
            presets: ['@babel/preset-env'], // Use Babel preset for modern JS
          },
        },
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.css'], // Allow imports without file extensions
  },
  devServer: {
    contentBase: path.join(__dirname, 'dist'), // Serve files from 'dist' folder
    compress: true, // Enable gzip compression
    port: 3000, // Port number for the development server
    hot: true, // Enable hot module replacement (HMR) for live reloading
  },
  plugins: [
    // You can add plugins here, such as HTMLWebpackPlugin, etc.
  ],
};
