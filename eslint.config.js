import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

/** @type {import('eslint').Linter.Config[]} */
export default [
	js.configs.recommended,
	...svelte.configs['flat/recommended'],
	prettier,
	...svelte.configs['flat/prettier'],
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node,
				__NAME__: 'readonly',
				__VERSION__: 'readonly',
				__GITHUBURL__: 'readonly',
				__SVELTEVERSION__: 'readonly',
				__VITEVERSION__: 'readonly',
				__TAILWINDCSSVERSION__: 'readonly'
			}
		}
	},
	{
		files: ['**/*.svelte'],
		languageOptions: {
			parserOptions: {
				svelteFeatures: {
					experimentalGenerics: true
				}
			}
		}
	},
	{
		ignores: [
			'.vercel/',
			'src/routes/utils/highlight/',
			'build/',
			'.svelte-kit/',
			'dist/',
			'test-results/',
			'*.md',
			'src/**/*/Setup.svelte'
		]
	},
	{
		rules: {
			// Note: you must disable the base rule as it can report incorrect errors
			// "no-unused-vars": "off",
			'svelte/no-at-html-tags': 'off',
			'no-unused-vars': [
				'error',
				{
					varsIgnorePattern: '^_$', // Ignore variables named '_'
					argsIgnorePattern: '^_$', // Ignore function arguments named '_'
					caughtErrors: 'none' // Ignore unused variables in catch clauses
				}
			]
		}
	}
];
