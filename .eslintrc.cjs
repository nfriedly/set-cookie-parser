"use strict";
module.exports = {
  // We tried to stick to ES5 compat for browsers (#44), but eslint can't handle that with modules
  parserOptions: { ecmaVersion: 6, sourceType: 'module' },
  env: {
    node: true,
    browser: true,
  },
  extends: ["eslint:recommended", "plugin:prettier/recommended"],
  rules: {
    "prefer-const": "error",
    strict: "error",
    eqeqeq: "error",
  },
};
