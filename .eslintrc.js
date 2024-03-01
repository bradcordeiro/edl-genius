module.exports = {
  root: true,
  ignorePatterns: ["node_modules/**/*", "dist/*.js", "*.js"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "./tsconfig.json",
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ["@typescript-eslint"],
  extends: [
    "plugin:@typescript-eslint/recommended",
    "airbnb-base-typescript"
  ],
  rules: {
    "no-console": ["off"],
    "max-len": ["warn", { "code": 140, "ignoreComments": true }],
    "no-underscore-dangle": ["warn", { "allow": ["_transform", "_flush"] }]
  }
}