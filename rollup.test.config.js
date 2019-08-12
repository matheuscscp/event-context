import multiEntry from 'rollup-plugin-multi-entry';
import alias from 'rollup-plugin-alias';
import path from 'path';

const tests = process.env.TESTS;
const input = tests ? tests.split(',').map(t => `test/${t}.js`) : 'test/*.js';

export default {
  input,
  output: {
    file: '_test/index.js',
    format: 'cjs'
  },
  plugins: [
    multiEntry(),
    alias({
      'tfg-event-context': path.resolve('./src/context.js'),
    }),
  ]
};
