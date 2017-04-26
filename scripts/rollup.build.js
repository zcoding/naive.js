import babel from 'rollup-plugin-babel'

export default {
  entry: 'src/main.js',
  sourceMap: true,
  plugins: [
    babel({
      exclude: 'node_modules/**',
      presets: [
        [
          'es2015',
          {
            'modules': false
          }
        ]
      ],
      'plugins': [
        'external-helpers'
      ],
      babelrc: false
    })
  ],
  targets: [
    {
      format: 'es',
      dest: 'dist/es/naive.js'
    },
    {
      format: 'cjs',
      dest: 'dist/cjs/naive.js'
    }
  ]
}
