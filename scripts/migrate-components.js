#!/usr/bin/env node

/**
 * Script to migrate components to use new design system
 * Usage: node scripts/migrate-components.js
 */

const fs = require('fs')
const path = require('path')
const { glob } = require('glob')

// Import mappings for components
const IMPORT_MAPPINGS = {
  // Design system
  '@/lib/utils': '@/src/core/utils',
  '@/lib/flags': '@/src/core/flags',
  '@/lib/config': '@/src/core/config',
  
  // Services
  '@/lib/supabase/client': '@/src/services/storage/supabase',
  '@/lib/services/google-search-service': '@/src/services/search/google',
  '@/lib/email-service': '@/src/services/email/resend',
  
  // Intelligence
  '@/lib/intelligence/intent-detector': '@/src/core/intelligence',
  '@/lib/intelligence/conversational-intelligence': '@/src/core/intelligence',
  
  // Types
  '@/types/intelligence': '@/src/core/types/intelligence',
  '@/types/chat': '@/src/core/types/chat',
  
  // Education
  '@/lib/education/modules': '@/src/core/education/modules'
}

// Component replacements
const COMPONENT_REPLACEMENTS = {
  // Old button imports to new
  "import { Button } from '@/components/ui/primitives/button'": "import { Button } from '@/components/ui/button'",
"import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/primitives/card'": "import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'",
  
  // Legacy button variants
  'from "@/components/ui/primitives/button"': 'from "@/components/ui/button"',
'from "@/components/ui/primitives/card"': 'from "@/components/ui/card"'
}

async function migrateComponent(filePath) {
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

    // Update component imports
    for (const [oldImport, newImport] of Object.entries(COMPONENT_REPLACEMENTS)) {
      if (updatedContent.includes(oldImport)) {
        updatedContent = updatedContent.replace(new RegExp(oldImport.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newImport)
        hasChanges = true
        console.log(`  ✅ Component: Updated to new design system import`)
      }
    }

    // Update function calls
    if (updatedContent.includes('getSupabase(')) {
      updatedContent = updatedContent.replace(/getSupabase\(\)/g, 'getSupabaseStorage()')
      hasChanges = true
      console.log(`  ✅ Function: getSupabase() → getSupabaseStorage()`)
    }

    if (updatedContent.includes('supabaseService')) {
      updatedContent = updatedContent.replace(/supabaseService/g, 'getSupabaseStorage().getServiceClient()')
      hasChanges = true
      console.log(`  ✅ Function: supabaseService → getSupabaseStorage().getServiceClient()`)
    }

    // Write back if changes were made
    if (hasChanges) {
      fs.writeFileSync(filePath, updatedContent, 'utf8')
      console.log(`  ✨ Component migrated successfully`)
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
  console.log('🔄 Migrating components to new design system...\n')

  // Find all component files
  const componentFiles = await glob('components/**/*.{ts,tsx}', {
    ignore: [
      '**/ui/primitives/**', // Skip (deleted - now using standard Shadcn components)
      '**/ui/patterns/**',
      '**/ui/layouts/**',
      '**/*.test.ts',
      '**/*.test.tsx'
    ]
  })

  // Also migrate hooks
  const hookFiles = await glob('hooks/**/*.{ts,tsx}', {
    ignore: ['**/*.test.ts', '**/*.test.tsx']
  })

  const allFiles = [...componentFiles, ...hookFiles]
  let totalFiles = 0
  let migratedFiles = 0

  for (const file of allFiles) {
    totalFiles++
    const wasMigrated = await migrateComponent(file)
    if (wasMigrated) {
      migratedFiles++
    }
  }

  console.log(`\n🎉 Component migration complete!`)
  console.log(`📊 Files checked: ${totalFiles}`)
  console.log(`✨ Files migrated: ${migratedFiles}`)
  console.log(`🎯 Already clean: ${totalFiles - migratedFiles}`)
  
  if (migratedFiles > 0) {
    console.log(`\n💡 Next steps:`)
    console.log(`1. Test the migrated components`)
    console.log(`2. Run TypeScript check: pnpm tsc --noEmit`)
    console.log(`3. Update components to use new design system variants`)
  }
}

if (require.main === module) {
  main().catch(console.error)
}

module.exports = { migrateComponent, IMPORT_MAPPINGS }