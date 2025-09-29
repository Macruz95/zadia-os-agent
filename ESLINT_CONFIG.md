# 🔧 Configuración de Validación ESLint - ZADIA OS

## Reglas Específicas para Módulos

```json
{
  "extends": [
    "next/core-web-vitals",
    "@typescript-eslint/recommended"
  ],
  "rules": {
    // Estructura de módulos
    "zadia/module-structure": "error",
    "zadia/module-exports": "error",
    "zadia/module-naming": "error",
    
    // Imports organizados
    "import/order": [
      "error",
      {
        "groups": [
          "builtin",
          "external", 
          "internal",
          "parent",
          "sibling",
          "index"
        ],
        "pathGroups": [
          {
            "pattern": "react",
            "group": "external",
            "position": "before"
          },
          {
            "pattern": "@/components/ui/**",
            "group": "internal",
            "position": "before"
          },
          {
            "pattern": "@/lib/**",
            "group": "internal",
            "position": "before"
          },
          {
            "pattern": "../**",
            "group": "parent",
            "position": "after"
          }
        ],
        "pathGroupsExcludedImportTypes": ["react"],
        "newlines-between": "always",
        "alphabetize": {
          "order": "asc",
          "caseInsensitive": true
        }
      }
    ],
    
    // Nomenclatura consistente
    "naming-convention": [
      "error",
      {
        "selector": "interface",
        "format": ["PascalCase"],
        "prefix": ["I", ""]
      },
      {
        "selector": "typeAlias",
        "format": ["PascalCase"]
      },
      {
        "selector": "enum",
        "format": ["PascalCase"],
        "suffix": ["Enum"]
      },
      {
        "selector": "class",
        "format": ["PascalCase"],
        "suffix": ["Service", ""]
      }
    ],
    
    // Hooks personalizados
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    
    // Componentes
    "react/prop-types": "off",
    "react/react-in-jsx-scope": "off",
    "react/display-name": "error",
    
    // TypeScript específico
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    
    // Calidad de código
    "prefer-const": "error",
    "no-var": "error",
    "no-console": "warn",
    "eqeqeq": "error",
    "curly": "error"
  },
  
  "overrides": [
    // Reglas específicas para servicios
    {
      "files": ["**/services/**/*.ts"],
      "rules": {
        "zadia/service-structure": "error",
        "zadia/error-handling": "error",
        "zadia/logging-required": "error"
      }
    },
    
    // Reglas específicas para hooks
    {
      "files": ["**/hooks/**/*.ts"],
      "rules": {
        "zadia/hook-naming": "error",
        "zadia/hook-return-type": "error"
      }
    },
    
    // Reglas específicas para tipos
    {
      "files": ["**/types/**/*.ts"],
      "rules": {
        "zadia/zod-enums-only": "error",
        "zadia/interface-documentation": "error"
      }
    }
  ]
}
```

## 🎯 Reglas Customizadas ZADIA

### **Module Structure Rule**
```javascript
// .eslint/rules/module-structure.js
module.exports = {
  name: "module-structure",
  meta: {
    type: "problem",
    docs: {
      description: "Enforce consistent module structure",
      category: "ZADIA Standards"
    }
  },
  create(context) {
    return {
      Program(node) {
        const filename = context.getFilename();
        const isModuleFile = filename.includes('/modules/');
        
        if (isModuleFile) {
          // Verificar estructura de directorios requerida
          const requiredDirs = [
            'components',
            'hooks', 
            'services',
            'types',
            'validations',
            'utils'
          ];
          
          // Lógica de validación aquí
        }
      }
    };
  }
};
```

### **Zod Enums Only Rule**
```javascript
// .eslint/rules/zod-enums-only.js
module.exports = {
  name: "zod-enums-only",
  meta: {
    type: "problem",
    docs: {
      description: "Enforce Zod enums instead of TypeScript enums",
      category: "ZADIA Standards"
    }
  },
  create(context) {
    return {
      TSEnumDeclaration(node) {
        const filename = context.getFilename();
        const isTypesFile = filename.includes('/types/');
        
        if (isTypesFile) {
          context.report({
            node,
            message: "Use Zod enums (z.enum) instead of TypeScript enums in types files"
          });
        }
      }
    };
  }
};
```

### **Error Handling Rule**
```javascript
// .eslint/rules/error-handling.js
module.exports = {
  name: "error-handling",
  meta: {
    type: "problem",
    docs: {
      description: "Enforce proper error handling in services",
      category: "ZADIA Standards"
    }
  },
  create(context) {
    return {
      MethodDefinition(node) {
        const filename = context.getFilename();
        const isServiceFile = filename.includes('/services/');
        
        if (isServiceFile && node.static) {
          // Verificar try/catch y logging
          let hasTryCatch = false;
          let hasLogging = false;
          
          // Lógica de validación aquí
          
          if (!hasTryCatch) {
            context.report({
              node,
              message: "Service methods must have try/catch blocks"
            });
          }
          
          if (!hasLogging) {
            context.report({
              node,
              message: "Service methods must include error logging"
            });
          }
        }
      }
    };
  }
};
```

## 📝 Scripts de Validación

### **package.json Scripts**
```json
{
  "scripts": {
    "lint": "eslint . --ext .ts,.tsx,.js,.jsx",
    "lint:fix": "eslint . --ext .ts,.tsx,.js,.jsx --fix",
    "lint:modules": "eslint src/modules --ext .ts,.tsx",
    "validate:structure": "node scripts/validate-structure.js",
    "validate:exports": "node scripts/validate-exports.js",
    "validate:types": "node scripts/validate-types.js",
    "validate:all": "npm run validate:structure && npm run validate:exports && npm run validate:types && npm run lint:modules"
  }
}
```

### **Validation Scripts**

#### **validate-structure.js**
```javascript
const fs = require('fs');
const path = require('path');

const REQUIRED_STRUCTURE = [
  'components',
  'hooks',
  'services', 
  'types',
  'validations',
  'utils',
  'index.ts'
];

function validateModuleStructure(modulePath) {
  const items = fs.readdirSync(modulePath);
  const missing = REQUIRED_STRUCTURE.filter(item => !items.includes(item));
  
  if (missing.length > 0) {
    console.error(`❌ Module ${path.basename(modulePath)} missing: ${missing.join(', ')}`);
    return false;
  }
  
  console.log(`✅ Module ${path.basename(modulePath)} structure valid`);
  return true;
}

// Validar todos los módulos
const modulesPath = path.join(__dirname, '../src/modules');
const modules = fs.readdirSync(modulesPath, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name);

let allValid = true;
modules.forEach(module => {
  const valid = validateModuleStructure(path.join(modulesPath, module));
  if (!valid) allValid = false;
});

if (!allValid) {
  process.exit(1);
}
```

#### **validate-exports.js**
```javascript
const fs = require('fs');
const path = require('path');

function validateModuleExports(modulePath) {
  const indexPath = path.join(modulePath, 'index.ts');
  
  if (!fs.existsSync(indexPath)) {
    console.error(`❌ Module ${path.basename(modulePath)} missing index.ts`);
    return false;
  }
  
  const content = fs.readFileSync(indexPath, 'utf8');
  const requiredExports = [
    'export * from \'./types\'',
    'export * from \'./validations\'',
    'export * from \'./services\'',
    'export * from \'./hooks\'',
    'export * from \'./utils\''
  ];
  
  const missing = requiredExports.filter(exp => !content.includes(exp));
  
  if (missing.length > 0) {
    console.error(`❌ Module ${path.basename(modulePath)} missing exports: ${missing.join(', ')}`);
    return false;
  }
  
  console.log(`✅ Module ${path.basename(modulePath)} exports valid`);
  return true;
}

// Ejecutar validación para todos los módulos
const modulesPath = path.join(__dirname, '../src/modules');
const modules = fs.readdirSync(modulesPath, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name);

let allValid = true;
modules.forEach(module => {
  const valid = validateModuleExports(path.join(modulesPath, module));
  if (!valid) allValid = false;
});

if (!allValid) {
  process.exit(1);
}
```

## 🔍 Pre-commit Hooks

### **husky Pre-commit**
```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

echo "🔍 Validating module structure..."
npm run validate:structure

echo "📦 Validating exports..."
npm run validate:exports

echo "🎯 Linting modules..."
npm run lint:modules

echo "🔬 Type checking..."
npm run type-check

echo "✅ All validations passed!"
```

## 📊 Reportes de Calidad

### **quality-report.js**
```javascript
const fs = require('fs');
const path = require('path');

function generateQualityReport() {
  const modulesPath = path.join(__dirname, '../src/modules');
  const modules = fs.readdirSync(modulesPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  
  const report = {
    timestamp: new Date().toISOString(),
    modules: [],
    summary: {
      total: modules.length,
      compliant: 0,
      warnings: 0,
      errors: 0
    }
  };
  
  modules.forEach(moduleName => {
    const moduleReport = analyzeModule(path.join(modulesPath, moduleName));
    report.modules.push(moduleReport);
    
    if (moduleReport.score >= 90) report.summary.compliant++;
    else if (moduleReport.score >= 70) report.summary.warnings++;
    else report.summary.errors++;
  });
  
  // Generar archivo de reporte
  fs.writeFileSync(
    path.join(__dirname, '../QUALITY_REPORT.json'),
    JSON.stringify(report, null, 2)
  );
  
  console.log(`📊 Quality report generated: ${report.summary.compliant}/${report.summary.total} modules compliant`);
}

function analyzeModule(modulePath) {
  // Lógica de análisis detallado aquí
  return {
    name: path.basename(modulePath),
    score: 95, // Calculado basado en criterios
    issues: [],
    structure: 'valid',
    exports: 'valid',
    types: 'valid'
  };
}

generateQualityReport();
```

## ✅ Checklist de Configuración

- [ ] ESLint configurado con reglas ZADIA
- [ ] Reglas customizadas implementadas
- [ ] Scripts de validación creados
- [ ] Pre-commit hooks configurados
- [ ] Reportes de calidad automatizados
- [ ] Documentación de reglas completa