const path = require('path');

// Check if tailwindcss exists before loading
let plugins = {};
try {
  require.resolve('tailwindcss');
  require.resolve('autoprefixer');
  if (process.env.NODE_ENV !== 'test') {
    plugins = {
      tailwindcss: {},
      autoprefixer: {},
    };
  }
} catch (e) {
  // tailwindcss not found, skip
}

module.exports = {
  plugins,
};

