const { fixupConfigRules } = require("@eslint/eslintrc");
const typescriptEslint = require("@typescript-eslint/eslint-plugin");
const react = require("eslint-plugin-react");
const reactHooks = require("eslint-plugin-react-hooks");
const _import = require("eslint-plugin-import");
const globals = require("globals");
const tsParser = require("@typescript-eslint/parser");
const js = require("@eslint/js");

module.exports = [
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2022,
      },
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
        project: "./tsconfig.json",
        tsconfigRootDir: __dirname,
      },
    },
  },
  js.configs.recommended,
  ...fixupConfigRules([
    {
      extends: [
        "eslint:recommended",
        "next/core-web-vitals",
        "plugin:react/recommended",
        "plugin:react-hooks/recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/recommended-requiring-type-checking",
        "plugin:import/recommended",
      ],
      plugins: [
        "@typescript-eslint",
        "react",
        "react-hooks",
        "import",
      ],
      rules: {
        // TypeScript specific rules - relaxed for initial setup
        "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
        "@typescript-eslint/no-explicit-any": "off", // Allow any types initially
        "@typescript-eslint/no-non-null-assertion": "warn",
        "@typescript-eslint/no-unnecessary-type-assertion": "warn",
        "@typescript-eslint/no-unsafe-assignment": "off", // Too strict for initial setup
        "@typescript-eslint/no-unsafe-member-access": "off",
        "@typescript-eslint/no-unsafe-call": "off",
        "@typescript-eslint/no-unsafe-return": "off",
        "@typescript-eslint/no-unsafe-argument": "off",
        "@typescript-eslint/require-await": "warn",
        "@typescript-eslint/no-misused-promises": "warn",
        "@typescript-eslint/restrict-template-expressions": "warn",

        // React specific rules
        "react/react-in-jsx-scope": "off", // Not needed in Next.js
        "react/prop-types": "off", // Using TypeScript for prop validation
        "react/no-unescaped-entities": "warn",
        "react/jsx-uses-react": "off",
        "react/jsx-uses-vars": "error",

        // React Hooks rules
        "react-hooks/rules-of-hooks": "error",
        "react-hooks/exhaustive-deps": "warn",

        // Import rules
        "import/no-unresolved": "error",
        "import/named": "error",
        "import/namespace": "error",
        "import/default": "error",
        "import/export": "error",
        "import/no-named-as-default": "warn",
        "import/no-named-as-default-member": "warn",

        // General rules
        "no-console": "warn",
        "no-debugger": "error",
        "no-unused-vars": "off", // Turned off in favor of @typescript-eslint/no-unused-vars
        "prefer-const": "error",
        "no-var": "error",
      },
    },
  ]),
];
