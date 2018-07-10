"use strict";
module.exports = {
  parserOptions: { ecmaVersion: 5 },
  env: {
    node: true,
    browser: true
  },
  extends: ["eslint:recommended", "plugin:prettier/recommended"],
  rules: {
    "prefer-const": "error",
    strict: "error",
    eqeqeq: "error"
  }
};
