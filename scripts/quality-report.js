const fs = require('fs');
const path = require('path');
const { validateModuleStructure } = require('./validate-structure');
const { validateModuleExports } = require('./validate-exports');

// Criterios de calidad
const QUALITY_CRITERIA = {
  structure: 30,    // 30% - Estructura de directorios
  exports: 20,      // 20% - Exports correctos
  types: 20,        // 20% - Tipos definidos
  components: 15,   // 15% - Componentes implementados
  services: 10,     // 10% - Servicios implementados
  documentation: 5  // 5% - Documentación
};

function analyzeModule(modulePath) {
  const moduleName = path.basename(modulePath);
  console.log(`\n🔬 Analyzing module: ${moduleName}`);
  
  const analysis = {
    name: moduleName,
    path: modulePath,
    score: 0,
    issues: [],
    details: {}
  };
  
  // 1. Estructura (30%)
  const structureValid = validateModuleStructure(modulePath);
  analysis.details.structure = {
    valid: structureValid,
    score: structureValid ? QUALITY_CRITERIA.structure : 0
  };
  
  // 2. Exports (20%)
  const exportsValid = validateModuleExports(modulePath);
  analysis.details.exports = {
    valid: exportsValid,
    score: exportsValid ? QUALITY_CRITERIA.exports : 0
  };
  
  // 3. Types (20%)
  const typesAnalysis = analyzeTypes(modulePath);
  analysis.details.types = typesAnalysis;
  
  // 4. Components (15%)
  const componentsAnalysis = analyzeComponents(modulePath);
  analysis.details.components = componentsAnalysis;
  
  // 5. Services (10%)
  const servicesAnalysis = analyzeServices(modulePath);
  analysis.details.services = servicesAnalysis;
  
  // 6. Documentation (5%)
  const docsAnalysis = analyzeDocumentation(modulePath);
  analysis.details.documentation = docsAnalysis;
  
  // Calcular score total
  analysis.score = Object.values(analysis.details)
    .reduce((total, detail) => total + detail.score, 0);
  
  // Clasificar módulo
  if (analysis.score >= 90) {
    analysis.classification = 'EXCELLENT';
    analysis.status = '🟢';
  } else if (analysis.score >= 70) {
    analysis.classification = 'GOOD';
    analysis.status = '🟡';
  } else if (analysis.score >= 50) {
    analysis.classification = 'NEEDS_IMPROVEMENT';
    analysis.status = '🟠';
  } else {
    analysis.classification = 'CRITICAL';
    analysis.status = '🔴';
  }
  
  console.log(`${analysis.status} Score: ${analysis.score}% - ${analysis.classification}`);
  
  return analysis;
}

function analyzeTypes(modulePath) {
  const typesPath = path.join(modulePath, 'types');
  let score = 0;
  const issues = [];
  
  if (!fs.existsSync(typesPath)) {
    issues.push('Types directory missing');
    return { score: 0, issues };
  }
  
  const files = fs.readdirSync(typesPath);
  
  // Verificar archivos requeridos
  if (files.includes('index.ts')) score += 5;
  else issues.push('Missing types/index.ts');
  
  const moduleTypesFile = files.find(f => f.endsWith('.types.ts'));
  if (moduleTypesFile) {
    score += 10;
    
    // Analizar contenido
    const content = fs.readFileSync(path.join(typesPath, moduleTypesFile), 'utf8');
    
    if (content.includes('z.enum')) score += 5;
    else issues.push('No Zod enums found');
    
  } else {
    issues.push('Missing module types file');
  }
  
  return { score: Math.min(score, QUALITY_CRITERIA.types), issues };
}

function analyzeComponents(modulePath) {
  const componentsPath = path.join(modulePath, 'components');
  let score = 0;
  const issues = [];
  
  if (!fs.existsSync(componentsPath)) {
    issues.push('Components directory missing');
    return { score: 0, issues };
  }
  
  const files = fs.readdirSync(componentsPath);
  const moduleName = path.basename(modulePath);
  const capitalizedModule = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
  
  // Verificar componentes requeridos
  const requiredComponents = [
    `${capitalizedModule}Directory.tsx`,
    `${capitalizedModule}Form.tsx`, 
    `${capitalizedModule}Table.tsx`
  ];
  
  requiredComponents.forEach(component => {
    if (files.includes(component)) {
      score += 3;
    } else {
      issues.push(`Missing ${component}`);
    }
  });
  
  // Verificar index.ts
  if (files.includes('index.ts')) score += 3;
  else issues.push('Missing components/index.ts');
  
  // Bonus por componentes adicionales
  const additionalComponents = files.filter(f => 
    f.endsWith('.tsx') && !requiredComponents.includes(f)
  ).length;
  score += Math.min(additionalComponents * 1, 3);
  
  return { score: Math.min(score, QUALITY_CRITERIA.components), issues };
}

function analyzeServices(modulePath) {
  const servicesPath = path.join(modulePath, 'services');
  let score = 0;
  const issues = [];
  
  if (!fs.existsSync(servicesPath)) {
    issues.push('Services directory missing');
    return { score: 0, issues };
  }
  
  const entitiesPath = path.join(servicesPath, 'entities');
  if (fs.existsSync(entitiesPath)) {
    score += 5;
    
    const entityFiles = fs.readdirSync(entitiesPath);
    const serviceFiles = entityFiles.filter(f => f.endsWith('.service.ts'));
    
    if (serviceFiles.length > 0) {
      score += 3;
      
      // Analizar primer servicio encontrado
      const firstService = fs.readFileSync(
        path.join(entitiesPath, serviceFiles[0]), 'utf8'
      );
      
      if (firstService.includes('try {') && firstService.includes('catch')) {
        score += 1;
      } else {
        issues.push('Service missing error handling');
      }
      
      if (firstService.includes('logger.')) {
        score += 1;
      } else {
        issues.push('Service missing logging');
      }
    } else {
      issues.push('No service files found');
    }
  } else {
    issues.push('Missing services/entities directory');
  }
  
  return { score: Math.min(score, QUALITY_CRITERIA.services), issues };
}

function analyzeDocumentation(modulePath) {
  const docsPath = path.join(modulePath, 'docs');
  let score = 0;
  const issues = [];
  
  if (fs.existsSync(docsPath)) {
    const files = fs.readdirSync(docsPath);
    
    if (files.includes('README.md')) score += 3;
    else issues.push('Missing docs/README.md');
    
    if (files.includes('API.md')) score += 1;
    if (files.includes('examples.md')) score += 1;
  } else {
    issues.push('Documentation directory missing');
  }
  
  return { score: Math.min(score, QUALITY_CRITERIA.documentation), issues };
}

function generateReport(analyses) {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total: analyses.length,
      excellent: analyses.filter(a => a.classification === 'EXCELLENT').length,
      good: analyses.filter(a => a.classification === 'GOOD').length,
      needsImprovement: analyses.filter(a => a.classification === 'NEEDS_IMPROVEMENT').length,
      critical: analyses.filter(a => a.classification === 'CRITICAL').length,
      averageScore: analyses.reduce((sum, a) => sum + a.score, 0) / analyses.length
    },
    modules: analyses,
    recommendations: generateRecommendations(analyses)
  };
  
  return report;
}

function generateRecommendations(analyses) {
  const recommendations = [];
  
  const criticalModules = analyses.filter(a => a.classification === 'CRITICAL');
  if (criticalModules.length > 0) {
    recommendations.push({
      priority: 'HIGH',
      action: `Refactor critical modules: ${criticalModules.map(m => m.name).join(', ')}`,
      modules: criticalModules.map(m => m.name)
    });
  }
  
  const needsImprovementModules = analyses.filter(a => a.classification === 'NEEDS_IMPROVEMENT');
  if (needsImprovementModules.length > 0) {
    recommendations.push({
      priority: 'MEDIUM',
      action: `Improve modules: ${needsImprovementModules.map(m => m.name).join(', ')}`,
      modules: needsImprovementModules.map(m => m.name)
    });
  }
  
  // Análisis de patrones comunes
  const commonIssues = {};
  analyses.forEach(analysis => {
    Object.values(analysis.details).forEach(detail => {
      if (detail.issues) {
        detail.issues.forEach(issue => {
          commonIssues[issue] = (commonIssues[issue] || 0) + 1;
        });
      }
    });
  });
  
  const topIssues = Object.entries(commonIssues)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3);
  
  topIssues.forEach(([issue, count]) => {
    if (count > 1) {
      recommendations.push({
        priority: 'LOW',
        action: `Address common issue: ${issue} (affects ${count} modules)`,
        modules: []
      });
    }
  });
  
  return recommendations;
}

function main() {
  console.log('📊 ZADIA OS - Quality Report Generator');
  console.log('====================================');
  
  const modulesPath = path.join(__dirname, '../src/modules');
  
  if (!fs.existsSync(modulesPath)) {
    console.log('❌ Modules directory not found at src/modules');
    process.exit(1);
  }
  
  const modules = fs.readdirSync(modulesPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  
  if (modules.length === 0) {
    console.log('ℹ️  No modules found to analyze');
    return;
  }
  
  const analyses = [];
  
  modules.forEach(module => {
    const modulePath = path.join(modulesPath, module);
    const analysis = analyzeModule(modulePath);
    analyses.push(analysis);
  });
  
  const report = generateReport(analyses);
  
  // Guardar reporte JSON
  const reportPath = path.join(__dirname, '../QUALITY_REPORT.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  // Mostrar resumen
  console.log('\n📊 QUALITY SUMMARY');
  console.log('==================');
  console.log(`Total Modules: ${report.summary.total}`);
  console.log(`🟢 Excellent: ${report.summary.excellent}`);
  console.log(`🟡 Good: ${report.summary.good}`);
  console.log(`🟠 Needs Improvement: ${report.summary.needsImprovement}`);
  console.log(`🔴 Critical: ${report.summary.critical}`);
  console.log(`Average Score: ${report.summary.averageScore.toFixed(1)}%`);
  
  console.log('\n🎯 TOP RECOMMENDATIONS');
  console.log('======================');
  report.recommendations.slice(0, 5).forEach((rec, i) => {
    console.log(`${i + 1}. [${rec.priority}] ${rec.action}`);
  });
  
  console.log(`\n📄 Full report saved to: ${reportPath}`);
  
  // Exit code basado en calidad general
  if (report.summary.critical > 0 || report.summary.averageScore < 60) {
    console.log('\n❌ Quality standards not met');
    process.exit(1);
  } else {
    console.log('\n✅ Quality standards acceptable');
  }
}

if (require.main === module) {
  main();
}

module.exports = { analyzeModule, generateReport };