#!/usr/bin/env node

/**
 * 发布前检查脚本
 * 在发布到 npm 前运行此脚本，确保一切就绪
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

let hasErrors = false;

function error(message) {
  console.error(`❌ ${message}`);
  hasErrors = true;
}

function success(message) {
  console.log(`✅ ${message}`);
}

function warn(message) {
  console.warn(`⚠️  ${message}`);
}

function checkFile(filePath, description) {
  const fullPath = path.join(rootDir, filePath);
  if (fs.existsSync(fullPath)) {
    success(`${description} 存在: ${filePath}`);
    return true;
  } else {
    error(`${description} 缺失: ${filePath}`);
    return false;
  }
}

function checkPackageJson() {
  console.log('\n📦 检查 package.json...');
  
  const pkgPath = path.join(rootDir, 'package.json');
  if (!fs.existsSync(pkgPath)) {
    error('package.json 不存在');
    return;
  }
  
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  
  // 必需字段
  const requiredFields = ['name', 'version', 'description', 'main', 'license'];
  requiredFields.forEach(field => {
    if (pkg[field]) {
      success(`${field}: ${pkg[field]}`);
    } else {
      error(`package.json 缺少 ${field} 字段`);
    }
  });
  
  // 推荐字段
  const recommendedFields = ['repository', 'bugs', 'homepage', 'keywords', 'author'];
  recommendedFields.forEach(field => {
    if (pkg[field]) {
      success(`${field}: ${typeof pkg[field] === 'object' ? JSON.stringify(pkg[field]) : pkg[field]}`);
    } else {
      warn(`建议添加 ${field} 字段`);
    }
  });
  
  // 检查 files 字段
  if (pkg.files && pkg.files.length > 0) {
    success(`files 字段已配置: ${pkg.files.join(', ')}`);
  } else {
    warn('建议配置 files 字段以控制发布内容');
  }
  
  // 检查 engines
  if (pkg.engines && pkg.engines.node) {
    success(`Node.js 版本要求: ${pkg.engines.node}`);
  } else {
    warn('建议指定 engines.node 版本');
  }
  
  // 检查 scripts
  const requiredScripts = ['build', 'prepublishOnly'];
  requiredScripts.forEach(script => {
    if (pkg.scripts && pkg.scripts[script]) {
      success(`脚本 ${script}: ${pkg.scripts[script]}`);
    } else {
      error(`缺少 ${script} 脚本`);
    }
  });
}

function checkDistFiles() {
  console.log('\n🏗️  检查构建产物...');
  
  const distPath = path.join(rootDir, 'dist');
  if (!fs.existsSync(distPath)) {
    error('dist 目录不存在，请运行 npm run build');
    return;
  }
  
  success('dist 目录存在');
  
  // 检查主要文件
  const mainFiles = ['index.js', 'index.d.ts'];
  mainFiles.forEach(file => {
    if (fs.existsSync(path.join(distPath, file))) {
      success(`${file} 存在`);
    } else {
      error(`${file} 不存在`);
    }
  });
  
  // 统计文件数量
  const files = fs.readdirSync(distPath);
  success(`dist 目录包含 ${files.length} 个文件`);
}

function checkDocumentation() {
  console.log('\n📚 检查文档...');
  
  checkFile('README.md', 'README');
  checkFile('LICENSE', 'LICENSE');
  checkFile('CHANGELOG.md', 'CHANGELOG');
  
  // 检查 README 内容
  const readmePath = path.join(rootDir, 'README.md');
  if (fs.existsSync(readmePath)) {
    const readme = fs.readFileSync(readmePath, 'utf8');
    
    if (readme.includes('## 安装') || readme.includes('## Installation')) {
      success('README 包含安装说明');
    } else {
      warn('README 建议包含安装说明');
    }
    
    if (readme.includes('## 使用') || readme.includes('## Usage')) {
      success('README 包含使用说明');
    } else {
      warn('README 建议包含使用说明');
    }
    
    if (readme.length > 1000) {
      success(`README 内容充实 (${readme.length} 字符)`);
    } else {
      warn('README 内容较少，建议补充更多信息');
    }
  }
}

function checkIgnoreFiles() {
  console.log('\n🚫 检查忽略文件...');
  
  checkFile('.npmignore', '.npmignore');
  checkFile('.gitignore', '.gitignore');
  
  // 检查 .npmignore 内容
  const npmignorePath = path.join(rootDir, '.npmignore');
  if (fs.existsSync(npmignorePath)) {
    const npmignore = fs.readFileSync(npmignorePath, 'utf8');
    
    const shouldIgnore = ['src/', 'test/', 'tests/', '.env', 'node_modules/'];
    shouldIgnore.forEach(pattern => {
      if (npmignore.includes(pattern)) {
        success(`忽略 ${pattern}`);
      } else {
        warn(`建议在 .npmignore 中忽略 ${pattern}`);
      }
    });
  }
}

function checkVersion() {
  console.log('\n🔖 检查版本...');
  
  const pkgPath = path.join(rootDir, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  
  const version = pkg.version;
  if (version) {
    success(`当前版本: ${version}`);
    
    // 检查版本格式
    const semverRegex = /^\d+\.\d+\.\d+(-[a-z]+\.\d+)?$/;
    if (semverRegex.test(version)) {
      success('版本号格式正确（遵循语义化版本）');
    } else {
      error('版本号格式不正确，应为 x.y.z 或 x.y.z-beta.n');
    }
  }
  
  // 检查 CHANGELOG 是否更新
  const changelogPath = path.join(rootDir, 'CHANGELOG.md');
  if (fs.existsSync(changelogPath)) {
    const changelog = fs.readFileSync(changelogPath, 'utf8');
    if (changelog.includes(`[${version}]`)) {
      success(`CHANGELOG 包含版本 ${version} 的更新记录`);
    } else {
      warn(`CHANGELOG 中未找到版本 ${version} 的记录`);
    }
  }
}

function checkDependencies() {
  console.log('\n📦 检查依赖...');
  
  const pkgPath = path.join(rootDir, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  
  if (pkg.dependencies) {
    const depCount = Object.keys(pkg.dependencies).length;
    success(`生产依赖: ${depCount} 个`);
    
    // 检查是否有常见的应该是 devDependencies 的包
    const shouldBeDevDeps = ['typescript', 'tsx', '@types/node'];
    shouldBeDevDeps.forEach(dep => {
      if (pkg.dependencies[dep]) {
        warn(`${dep} 应该在 devDependencies 中`);
      }
    });
  }
  
  if (pkg.devDependencies) {
    const devDepCount = Object.keys(pkg.devDependencies).length;
    success(`开发依赖: ${devDepCount} 个`);
  }
}

function showNextSteps() {
  console.log('\n📋 发布步骤:');
  console.log('1. npm login           # 登录 npm');
  console.log('2. npm run build       # 构建项目');
  console.log('3. npm publish         # 发布到 npm');
  console.log('4. git tag v1.0.0      # 创建 git tag');
  console.log('5. git push --tags     # 推送 tags');
  console.log('\n💡 更多信息请参考 PUBLISHING.md');
}

// 主函数
function main() {
  console.log('🔍 开始发布前检查...\n');
  
  checkPackageJson();
  checkDistFiles();
  checkDocumentation();
  checkIgnoreFiles();
  checkVersion();
  checkDependencies();
  
  console.log('\n' + '='.repeat(50));
  
  if (hasErrors) {
    console.log('\n❌ 发现错误，请修复后再发布');
    process.exit(1);
  } else {
    console.log('\n✅ 所有检查通过！');
    showNextSteps();
    process.exit(0);
  }
}

main();

