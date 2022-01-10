module.exports = {
	env: {
		es6: true,
		browser: true,
		commonjs: true,
		es2021: true,
		node: true,
	},
	extends: [
		'airbnb-base',
		"eslint:recommended",
		"prettier",
	],
	parserOptions: {
		ecmaVersion: 12,
	},
	rules: {
		"no-console":"off",
		"no-underscore-dangle": [
			"error",
			{
				"allow": ["_id"]
			}
		],
		"no-unused-vars": [
			"error",
			{
				"vars": "all",
				"args": "after-used"
			}]
	},
};
