import babel from 'rollup-plugin-babel'

export default {
  entry: 'lib/main.js',
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
      dest: 'dist/naive.js'
    }
  ]
}
