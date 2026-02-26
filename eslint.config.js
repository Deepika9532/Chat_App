import nextPlugin from "eslint-config-next";

export default [
  ...nextPlugin,
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-unused-vars": "warn",
    },
  },
];
