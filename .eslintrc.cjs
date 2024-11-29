/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: ["@remix-run/eslint-config", "@remix-run/eslint-config/node"],
  rules: {
    "react/display-name": "off",
    "@typescript-eslint/consistent-type-imports": "off",
  },
};
