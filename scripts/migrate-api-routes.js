#!/usr/bin/env node

/**
 * Script to migrate API routes to use src/ architecture
 * Usage: node scripts/migrate-api-routes.js
 */

const fs = require('fs')
const path = require('path')
const { glob } = require('glob')

// Import mappings from lib/ to src/
const IMPORT_MAPPINGS = {
  // Core services
  '@/lib/supabase/server': '@/src/services/storage/supabase',
  '@/lib/supabase/client': '@/src/services/storage/supabase',
  '@/lib/services/google-search-service': '@/src/services/search/google',
  '@/lib/email-service': '@/src/services/email/resend',
  
  // Intelligence system
  '@/lib/intelligence/intent-detector': '@/src/core/intelligence',
  '@/lib/intelligence/lead-research': '@/src/core/intelligence',
  '@/lib/intelligence/conversational-intelligence': '@/src/core/intelligence',
  '@/lib/intelligence/role-detector': '@/src/core/intelligence',
  
  // Auth & Validation
  '@/lib/auth': '@/src/core/auth',
  '@/lib/validation': '@/src/core/validation',
  '@/lib/validation/admin': '@/src/core/validation',
  
  // Config & Utils
  '@/lib/config': '@/src/core/config',
  '@/lib/flags': '@/src/core/flags',
  '@/lib/utils': '@/src/core/utils',
  
  // Types
  '@/types/intelligence': '@/src/core/types/intelligence',
  '@/types/chat': '@/src/core/types/chat'
}

// Function mappings for renamed exports
const FUNCTION_MAPPINGS = {
  'getSupabase': 'getSupabaseStorage',
  'supabase': 'supabase', // Keep same
  'supabaseService': 'getSupabaseStorage().getServiceClient()',
  'detectIntent': 'detectIntent',
  'LeadResearchService': 'LeadResearchService',
  'ConversationalIntelligence': 'IntelligenceService'
}

async function migrateApiRoute(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    let updatedContent = content
    let hasChanges = false

    console.log(`\n📁 Migrating: ${filePath}`)

    // Update import statements
    for (const [oldPath, newPath] of Object.entries(IMPORT_MAPPINGS)) {
      const importRegex = new RegExp(`from ['"]${oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`, 'g')
      
      if (importRegex.test(updatedContent)) {
        updatedContent = updatedContent.replace(importRegex, `from '${newPath}'`)
        hasChanges = true
        console.log(`  ✅ Import: ${oldPath} → ${newPath}`)
      }
    }

    // Update function calls if needed
    for (const [oldFunc, newFunc] of Object.entries(FUNCTION_MAPPINGS)) {
      if (oldFunc !== newFunc && updatedContent.includes(oldFunc)) {
        // Only replace function calls, not imports
        const funcCallRegex = new RegExp(`\\b${oldFunc}\\(`, 'g')
        if (funcCallRegex.test(updatedContent)) {
          updatedContent = updatedContent.replace(funcCallRegex, `${newFunc}(`)
          hasChanges = true
          console.log(`  ✅ Function: ${oldFunc}() → ${newFunc}()`)
        }
      }
    }

    // Write back if changes were made
    if (hasChanges) {
      fs.writeFileSync(filePath, updatedContent, 'utf8')
      console.log(`  ✨ File migrated successfully`)
      return true
    } else {
      console.log(`  ⏭️  No migration needed`)
      return false
    }
    
  } catch (error) {
    console.error(`❌ Error migrating ${filePath}:`, error.message)
    return false
  }
}

async function main() {
  console.log('🔄 Migrating API routes to src/ architecture...\n')

  // Find all API route files
  const apiFiles = await glob('app/api/**/*.ts', {
    ignore: ['**/*.backup', '**/*.test.ts']
  })

  let totalFiles = 0
  let migratedFiles = 0

  for (const file of apiFiles) {
    totalFiles++
    const wasMigrated = await migrateApiRoute(file)
    if (wasMigrated) {
      migratedFiles++
    }
  }

  console.log(`\n🎉 API route migration complete!`)
  console.log(`📊 Files checked: ${totalFiles}`)
  console.log(`✨ Files migrated: ${migratedFiles}`)
  console.log(`🎯 Already clean: ${totalFiles - migratedFiles}`)
  
  if (migratedFiles > 0) {
    console.log(`\n💡 Next steps:`)
    console.log(`1. Test the migrated routes`)
    console.log(`2. Run TypeScript check: pnpm tsc --noEmit`)
    console.log(`3. Commit changes: git add . && git commit -m "Migrate API routes to src/ architecture"`)
  }
}

if (require.main === module) {
  main().catch(console.error)
}

module.exports = { migrateApiRoute, IMPORT_MAPPINGS }