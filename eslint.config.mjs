import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default [{
    ignores: ["**/dist"],
}, ...compat.extends("eslint:recommended", "prettier"), {
    plugins: {},

    languageOptions: {
        globals: {
            ...globals.node,
        },

        ecmaVersion: "latest",
        sourceType: "module",
    },

    rules: {
        "no-duplicate-imports": "error",
        "no-self-compare": "error",
        "no-unmodified-loop-condition": "error",

        "accessor-pairs": ["error", {
            setWithoutGet: true,
            getWithoutSet: false,
        }],

        "arrow-body-style": "error",
        "block-scoped-var": "error",
        camelcase: "error",

        "consistent-return": ["error"],

        "consistent-this": "error",
        curly: "error",
        "default-case-last": "error",
        "default-param-last": "error",
        "dot-notation": "error",
        eqeqeq: ["error", "smart"],
        "grouped-accessor-pairs": "error",
        "guard-for-in": "error",
        "init-declarations": "error",
        "max-depth": "error",
        "max-nested-callbacks": ["error", 3],
        "no-array-constructor": "error",
        "no-case-declarations": "error",
        "no-delete-var": "error",
        "no-div-regex": "error",
        "no-else-return": "error",
        "no-empty": "error",
        "no-empty-static-block": "error",
        "no-eval": "error",
        "no-extra-bind": "error",
        "no-extra-boolean-cast": "error",
        "no-extra-label": "error",
        "no-implicit-coercion": "error",
        "no-implicit-globals": "error",
        "no-implied-eval": "error",
        "no-invalid-this": "error",
        "no-magic-numbers": "off",
        "no-nested-ternary": "error",
        "no-nonoctal-decimal-escape": "error",
        "no-object-constructor": "error",
        "no-redeclare": "error",
        "no-return-assign": "error",
        "no-script-url": "error",
        "no-underscore-dangle": "error",
        "no-unneeded-ternary": "error",
        "no-unused-expressions": "error",
        "no-unused-labels": "error",
        "no-useless-call": "error",
        "no-useless-catch": "error",
        "no-useless-computed-key": "error",
        "no-useless-concat": "error",
        "no-useless-constructor": "error",
        "no-useless-escape": "error",
        "no-useless-rename": "error",
        "no-useless-return": "error",
        "no-var": "error",
        "no-with": "error",
        "prefer-arrow-callback": "error",
        "prefer-const": "error",
        "prefer-destructuring": "error",
        "prefer-exponentiation-operator": "error",
        "prefer-numeric-literals": "error",
        "prefer-object-has-own": "error",
        "prefer-regex-literals": "error",
        "prefer-rest-params": "error",
        "prefer-spread": "error",
        "prefer-template": "error",
        "require-unicode-regexp": "error",
        "symbol-description": "error",
        "vars-on-top": "error",
        "unicode-bom": ["error", "never"]
    },
}];
