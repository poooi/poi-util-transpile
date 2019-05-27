module.exports = {
  extends: ['airbnb-base', 'prettier'],
  plugins: ['import', 'prettier'],
  env: { node: true, jest: true },
  parser: 'babel-eslint',
  rules: {
    'comma-dangle': ['error', 'always-multiline'],
    semi: ['error', 'never'],
    'no-console': 'off',
    'prettier/prettier': 'warn',
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['', '.js', '.jsx', '.es', '.coffee', '.cjsx'],
        paths: [__dirname],
      },
    },
  },
}
