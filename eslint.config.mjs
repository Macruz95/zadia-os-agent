import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "*.config.*",
      "public/**",
    ],
  },
  {
    rules: {
      // ZADIA OS - Reglas de importación organizadas
      "import/order": [
        "error",
        {
          groups: [
            "builtin",
            "external", 
            "internal",
            "parent",
            "sibling",
            "index"
          ],
          pathGroups: [
            {
              pattern: "react",
              group: "external",
              position: "before"
            },
            {
              pattern: "next/**",
              group: "external",
              position: "before"
            },
            {
              pattern: "@/components/ui/**",
              group: "internal",
              position: "before"
            },
            {
              pattern: "@/lib/**",
              group: "internal",
              position: "before"
            },
            {
              pattern: "@/modules/**",
              group: "internal",
              position: "after"
            }
          ],
          pathGroupsExcludedImportTypes: ["react"],
          "newlines-between": "always",
          alphabetize: {
            order: "asc",
            caseInsensitive: true
          }
        }
      ],
      
      // ZADIA OS - Nomenclatura consistente
      "@typescript-eslint/naming-convention": [
        "error",
        {
          selector: "interface",
          format: ["PascalCase"],
          prefix: [""]
        },
        {
          selector: "typeAlias", 
          format: ["PascalCase"]
        },
        {
          selector: "enum",
          format: ["PascalCase"],
          suffix: ["Enum"]
        },
        {
          selector: "class",
          format: ["PascalCase"]
        },
        {
          selector: "function",
          format: ["camelCase", "PascalCase"]
        }
      ],
      
      // ZADIA OS - Calidad de código
      "prefer-const": "error",
      "no-var": "error", 
      "no-console": "warn",
      "eqeqeq": "error",
      "curly": "error",
      
      // ZADIA OS - React específico
      "react/prop-types": "off",
      "react/react-in-jsx-scope": "off",
      "react/display-name": "error",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      
      // ZADIA OS - TypeScript específico
      "@typescript-eslint/no-unused-vars": "error",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/prefer-nullish-coalescing": "error",
      "@typescript-eslint/prefer-optional-chain": "error"
    }
  },
  
  // ZADIA OS - Reglas específicas para módulos
  {
    files: ["src/modules/**/*.ts", "src/modules/**/*.tsx"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["../../../*"],
              message: "Use absolute imports (@/) instead of deep relative imports"
            }
          ]
        }
      ]
    }
  },
  
  // ZADIA OS - Reglas específicas para servicios
  {
    files: ["src/modules/**/services/**/*.ts"],
    rules: {
      "no-console": "error", // Servicios deben usar logger
      "@typescript-eslint/no-explicit-any": "error" // Servicios requieren tipado estricto
    }
  },
  
  // ZADIA OS - Reglas específicas para tipos
  {
    files: ["src/modules/**/types/**/*.ts"],
    rules: {
      "@typescript-eslint/no-namespace": "error",
      "@typescript-eslint/prefer-enum-declaration": "off" // Permitir Zod enums
    }
  }
];

export default eslintConfig;
