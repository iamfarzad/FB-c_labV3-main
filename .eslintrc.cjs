module.exports = {
  extends: ["next/core-web-vitals", "next/typescript"],
  plugins: ["regexp"],
  rules: {
    // Disallow hex/rgb(a) string literals in TS/TSX
    "regexp/no-useless-escape": "off",
    "no-restricted-syntax": [
      "error",
      {
        "selector": "Literal[value=/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/]",
        "message": "Use CSS var tokens, not hex."
      },
      {
        "selector": "Literal[value=/^rgb(a)?\\(/]",
        "message": "Use CSS var tokens, not rgb(a)."
      }
    ]
  },
  overrides: [
    {
      files: ["**/*.{ts,tsx}"],
      rules: {}
    }
  ]
}
