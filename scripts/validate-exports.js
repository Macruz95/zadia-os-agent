const fs = require('fs');
const path = require('path');

// Exports requeridos en el index.ts principal de cada módulo
const REQUIRED_EXPORTS = [
  "export * from './types';",
  "export * from './validations';",
  "export * from './services';",
  "export * from './hooks';",
  "export * from './utils';"
];

// Exports requeridos en cada subdirectorio
const DIRECTORY_EXPORTS = {
  components: [
    'Directory',
    'Form', 
    'Table',
    'Filters'
  ],
  hooks: [
    'use-{module}'
  ],
  services: [
    '{Module}Service'
  ],
  types: [
    '{Module}',
    '{Module}Status',
    '{Module}Type',
    '{Module}Filters'
  ],
  validations: [
    '{Module}Schema',
    '{Module}FormSchema',
    '{Module}FiltersSchema'
  ]
};

function validateModuleExports(modulePath) {
  console.log(`\n🔍 Validating exports: ${path.basename(modulePath)}`);
  
  const indexPath = path.join(modulePath, 'index.ts');
  
  if (!fs.existsSync(indexPath)) {
    console.log(`❌ Missing index.ts in ${path.basename(modulePath)}`);
    return false;
  }
  
  const content = fs.readFileSync(indexPath, 'utf8');
  let valid = true;
  const issues = [];
  
  // Verificar exports requeridos
  const missingExports = REQUIRED_EXPORTS.filter(exp => {
    const normalized = exp.replace(/'/g, '\"').replace(/\s+/g, ' ').trim();
    const contentNormalized = content.replace(/'/g, '\"').replace(/\s+/g, ' ');
    return !contentNormalized.includes(normalized);
  });
  
  if (missingExports.length > 0) {
    issues.push(`Missing exports: ${missingExports.join(', ')}`);
    valid = false;
  }
  
  // Verificar que no haya imports relativos profundos
  const lines = content.split('\n');
  const deepImports = lines.filter(line => 
    line.includes('import') && line.includes('../../../')
  );
  
  if (deepImports.length > 0) {
    issues.push('Contains deep relative imports (use @ imports instead)');
    valid = false;
  }
  
  if (valid) {
    console.log(`✅ ${path.basename(modulePath)}: Exports valid`);
  } else {
    console.log(`❌ ${path.basename(modulePath)}: Issues found`);
    issues.forEach(issue => console.log(`   - ${issue}`));
  }
  
  return valid;
}

function validateDirectoryExports(dirPath, dirName, moduleName) {
  const indexPath = path.join(dirPath, 'index.ts');
  
  if (!fs.existsSync(indexPath)) {
    return { valid: false, issues: [`Missing index.ts in ${dirName}/`] };
  }
  
  const content = fs.readFileSync(indexPath, 'utf8');
  const issues = [];
  
  // Verificar que tenga al menos un export
  if (!content.includes('export')) {
    issues.push(`${dirName}/index.ts has no exports`);
  }
  
  // Verificar formato de exports
  const lines = content.split('\n');
  const exportLines = lines.filter(line => line.trim().startsWith('export'));
  
  exportLines.forEach(line => {
    if (!line.includes('from') && !line.includes('{') && !line.includes('default')) {
      issues.push(`${dirName}/index.ts: Invalid export format: ${line.trim()}`);
    }
  });
  
  return {
    valid: issues.length === 0,
    issues
  };
}

function main() {
  console.log('📦 ZADIA OS - Module Exports Validation');
  console.log('======================================');
  
  const modulesPath = path.join(__dirname, '../src/modules');
  
  if (!fs.existsSync(modulesPath)) {
    console.log('❌ Modules directory not found at src/modules');
    process.exit(1);
  }
  
  const modules = fs.readdirSync(modulesPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  
  if (modules.length === 0) {
    console.log('ℹ️  No modules found to validate');
    return;
  }
  
  let allValid = true;
  const results = [];
  
  modules.forEach(module => {
    const modulePath = path.join(modulesPath, module);
    const valid = validateModuleExports(modulePath);
    
    // Validar exports de subdirectorios
    const subdirs = ['components', 'hooks', 'services', 'types', 'validations', 'utils'];
    let subdirValid = true;
    
    subdirs.forEach(subdir => {
      const subdirPath = path.join(modulePath, subdir);
      if (fs.existsSync(subdirPath)) {
        const result = validateDirectoryExports(subdirPath, subdir, module);
        if (!result.valid) {
          console.log(`❌ ${module}/${subdir}: ${result.issues.join(', ')}`);
          subdirValid = false;
        }
      }
    });
    
    const moduleValid = valid && subdirValid;
    results.push({ module, valid: moduleValid });
    if (!moduleValid) allValid = false;
  });
  
  console.log('\n📊 Summary:');
  console.log('============');
  results.forEach(({ module, valid }) => {
    console.log(`${valid ? '✅' : '❌'} ${module}`);
  });
  
  console.log(`\n${allValid ? '🎉' : '❌'} ${allValid ? 'All exports valid!' : 'Some exports have issues'}`);
  
  if (!allValid) {
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { validateModuleExports };