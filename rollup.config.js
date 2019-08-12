import strip from 'rollup-plugin-strip';

const capitalize = str => str[0].toUpperCase() + str.slice(1);

const input = 'src/index.js';
const dest = 'build/core';

export default {
  input,
  output: [
    { file: `${dest}/index.js`, format: 'cjs' },
    { file: `${dest}/index.es.js`, format: 'es' },
    { file: `${dest}/dist/index.js`, format: 'umd', name: 'EventContext' },
  ],
  plugins: [strip({
    debugger: true,
    functions: [ 'console.*', 'assert.*', 'debug', 'alert' ],
  })]
};
