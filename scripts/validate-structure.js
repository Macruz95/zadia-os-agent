const fs = require('fs');
const path = require('path');

// Estructura requerida para todos los módulos
const REQUIRED_STRUCTURE = [
  'components',
  'hooks',
  'services', 
  'types',
  'validations',
  'utils',
  'index.ts'
];

// Archivos requeridos en cada directorio
const REQUIRED_FILES = {
  components: ['index.ts'],
  hooks: ['index.ts', 'use-{module}.ts'],
  services: ['index.ts'],
  types: ['index.ts', '{module}.types.ts'],
  validations: ['index.ts', '{module}.schema.ts'],
  utils: ['index.ts']
};

function validateModuleStructure(modulePath) {
  console.log(`\n🔍 Validating module: ${path.basename(modulePath)}`);
  
  const items = fs.readdirSync(modulePath, { withFileTypes: true });
  const dirs = items.filter(item => item.isDirectory()).map(item => item.name);
  const files = items.filter(item => item.isFile()).map(item => item.name);
  
  let valid = true;
  const issues = [];
  
  // Verificar directorios requeridos
  const missingDirs = REQUIRED_STRUCTURE.filter(item => 
    item.endsWith('.ts') ? !files.includes(item) : !dirs.includes(item)
  );
  
  if (missingDirs.length > 0) {
    issues.push(`Missing directories/files: ${missingDirs.join(', ')}`);
    valid = false;
  }
  
  // Verificar archivos index.ts en cada directorio
  for (const dir of dirs) {
    if (REQUIRED_FILES[dir]) {
      const dirPath = path.join(modulePath, dir);
      const dirFiles = fs.readdirSync(dirPath);
      
      if (!dirFiles.includes('index.ts')) {
        issues.push(`Missing index.ts in ${dir}/`);
        valid = false;
      }
    }
  }
  
  // Verificar estructura de components
  if (dirs.includes('components')) {
    const componentsPath = path.join(modulePath, 'components');
    const componentFiles = fs.readdirSync(componentsPath);
    const moduleName = path.basename(modulePath);
    
    const expectedComponents = [
      `${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}Directory.tsx`,
      `${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}Form.tsx`,
      `${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}Table.tsx`
    ];
    
    const missingComponents = expectedComponents.filter(comp => !componentFiles.includes(comp));
    if (missingComponents.length > 0) {
      issues.push(`Missing components: ${missingComponents.join(', ')}`);
    }
  }
  
  if (valid) {
    console.log(`✅ ${path.basename(modulePath)}: Structure valid`);
  } else {
    console.log(`❌ ${path.basename(modulePath)}: Issues found`);
    issues.forEach(issue => console.log(`   - ${issue}`));
  }
  
  return valid;
}

function main() {
  console.log('🏗️  ZADIA OS - Module Structure Validation');
  console.log('==========================================');
  
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
    const valid = validateModuleStructure(path.join(modulesPath, module));
    results.push({ module, valid });
    if (!valid) allValid = false;
  });
  
  console.log('\n📊 Summary:');
  console.log('============');
  results.forEach(({ module, valid }) => {
    console.log(`${valid ? '✅' : '❌'} ${module}`);
  });
  
  console.log(`\n${allValid ? '🎉' : '❌'} ${allValid ? 'All modules valid!' : 'Some modules have issues'}`);
  
  if (!allValid) {
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { validateModuleStructure };