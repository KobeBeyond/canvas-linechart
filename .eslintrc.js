module.exports = {
  root: true,
  env: {
    "node": true
  },
  ignorePatterns: ["/.vscode/**/*", "/dist/**/*", "/public/**/*"],
  extends: [
    "plugin:vue/vue3-essential",
    "eslint:recommended",
    "@vue/typescript/recommended",
    "plugin:prettier/recommended"
  ],
  plugins: ["@typescript-eslint"],
  parser: "vue-eslint-parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    vueFeatures: {
      filter: false,
      styleCSSVariableInjection: true,
    },
    parser: {
      // Script parser for `<script>`
      // js: "espree",

      // Script parser for `<script lang="ts">`
      ts: "@typescript-eslint/parser",

      // Script parser for vue directives (e.g. `v-if=` or `:attribute=`)
      // and vue interpolations (e.g. `{{variable}}`).
      // If not specified, the parser determined by `<script lang ="...">` is used.
      // "<template>": "typescript-estree",
    }
  },
  globals: {
    defineProps: "readonly",
    defineEmits: "readonly"
  },
  parserOptions: {
    "ecmaVersion": 2020
  },
  settings: {
    "import/resolver": {
      typescript: true,
      node: true,
    },
  },
  rules: {}
}
