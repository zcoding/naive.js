import babel from 'rollup-plugin-babel';

export default {
  entry: 'src/main.js',
  sourceMap: true,
  plugins: [
    babel({
      exclude: 'node_modules/**',
      presets: ['es2015-rollup']
    })
  ],
  targets: [
    {
      format: 'amd',
      moduleId: 'naive',
      dest: 'dist/amd/naive.js'
    },
    {
      format: 'es',
      dest: 'dist/es/naive.js'
    },
    {
      format: 'cjs',
      dest: 'dist/cjs/naive.js'
    },
    {
      format: 'iife',
      moduleName: 'Naive',
      dest: 'dist/iife/naive.js'
    }
  ]
};
