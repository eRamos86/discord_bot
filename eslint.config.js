import tseslint from 'typescript-eslint';
export default tseslint.config(
    { ignores: ['dist/**', 'node_modules/**'] },
    ...tseslint.configs.recommended,
    {
        files: ['src/**/*.ts', 'tests/**/*.ts'],
        rules: {
            '@typescript-eslint/no-unused-vars': [
                'error',
                { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
            ],
            '@typescript-eslint/no-explicit-any': 'error',
            '@typescript-eslint/no-non-null-assertion': 'off',
            '@typescript-eslint/consistent-type-imports': 'off',
            'no-empty': ['error', { allowEmptyCatch: true }],
        },
    },
    { files: ['tests/**/*.ts'], rules: { '@typescript-eslint/no-explicit-any': 'error' } },
);
