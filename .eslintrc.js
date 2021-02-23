module.exports = {
  parser: "babel-eslint",
  env: {
    browser: true,
    mocha: true,
    node: true,
  },
  plugins: ["babel"],
  extends: ["eslint:recommended", "plugin:prettier/recommended"],
  rules: {
    "prefer-const": "error",
    strict: "error",
    eqeqeq: "error",
  },
};
