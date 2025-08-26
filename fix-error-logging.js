#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get all TypeScript files that have changes
const changedFiles = execSync('git diff --name-only', { encoding: 'utf8' })
  .split('\n')
  .filter(file => file && (file.endsWith('.ts') || file.endsWith('.tsx')))
  .filter(file => !file.includes('node_modules') && !file.includes('.next'));

console.log(`🔍 Checking ${changedFiles.length} TypeScript files for risky error logging changes...\n`);

let fixedFiles = 0;

changedFiles.forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    let modified = false;
    let lines = content.split('\n');

    // Look for the pattern: "// Error:" followed by error message
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.trim().match(/^\/\//) && line.includes('Error:')) {
        // Check if the previous line was a console.error that got replaced
        if (i > 0) {
          const prevLine = lines[i - 1];
          if (prevLine.includes('return') || prevLine.includes('}')) {
            // This looks like a replaced console.error
            const errorMessage = line.replace(/^.*\/\/ Error:/, '').trim();
            lines[i] = `    console.error('${errorMessage}', error)`;
            modified = true;
            console.log(`✅ Fixed: ${file}:${i + 1}`);
          }
        }
      }
    }

    if (modified) {
      fs.writeFileSync(file, lines.join('\n'), 'utf8');
      fixedFiles++;
    }
  } catch (error) {
    console.log(`❌ Error processing ${file}:`, error.message);
  }
});

console.log(`\n🎉 Fixed error logging in ${fixedFiles} files`);
console.log(`📝 Next: Review the remaining changes and commit in logical groups`);
