module.exports = {
    env: {
        'node': true,
        'browser': true,
        'es2020': true,
        'jest': true
    },
    plugins: [
        '@typescript-eslint/eslint-plugin',
        'eslint-plugin-tsdoc',
        'jest'
    ],
    extends: [
        'plugin:@typescript-eslint/recommended'
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 11,
        sourceType: 'module'
    },
    ignorePatterns: ['coverage/**/*', '**/dist/**/*', 'docs/**/*'],
    rules: {
        'tsdoc/syntax': 'warn',
        '@typescript-eslint/no-var-requires': 'off',
        'no-unused-vars': 'off',
        'indent': [
            'error',
            4,
            { 'SwitchCase': 1 }
        ],
        'quotes': [
            'error',
            'single',
            {
                'avoidEscape': true,
                'allowTemplateLiterals': true
            }
        ],
        'semi': [
            'error',
            'always'
        ],
        'spaced-comment': ['error', 'always', { 'markers': ['/'] }]
    }
};