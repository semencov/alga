const pkg = require('./package.json');
import json from 'rollup-plugin-json';
import babel from 'rollup-plugin-babel';
import uglify from 'rollup-plugin-uglify';

const now = new Date();
const year = now.getFullYear();

export default {
  entry: 'src/index.js',
  format: 'umd',
  moduleName: 'Alga',
  plugins: [
    json(),
    babel(),
    uglify({
      output: {
        comments: (node, comment) => /\!/i.test(comment.value)
      }
    })
  ],
  dest: pkg.main,
  banner: `//! ${pkg.name} v${pkg.version}\n//! Copyright (c) ${year}, ${pkg.author}`
};
