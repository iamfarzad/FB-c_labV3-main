#!/usr/bin/env node

/**
 * Script to clean up redundant API routes after src/ migration
 * Usage: node scripts/cleanup-redundant-api-routes.js
 */

const fs = require('fs')
const path = require('path')

// Routes to delete (redundant after src/ migration)
const ROUTES_TO_DELETE = [
  // Legacy intelligence routes (replaced by v2)
  'app/api/intelligence/intent/route.ts',
  'app/api/intelligence/lead-research/route.ts',
  'app/api/intelligence/suggestions/route.ts',
  'app/api/intelligence/education/route.ts',
  'app/api/intelligence/context/route.ts',
  'app/api/intelligence/session-init/route.ts',
  
  // Redundant tool routes (functionality moved to src/)
  'app/api/tools/calc/route.ts',
  'app/api/tools/code/route.ts',
  'app/api/tools/doc/route.ts',
  'app/api/tools/roi/route.ts',
  'app/api/tools/screen/route.ts',
  'app/api/tools/search/route.ts',
  'app/api/tools/task-generator/route.ts',
  'app/api/tools/translate/route.ts',
  'app/api/tools/url/route.ts',
  'app/api/tools/voice-transcript/route.ts',
  'app/api/tools/web-preview/route.ts',
  'app/api/tools/webcam/route.ts',
  
  // Legacy analysis routes (if they exist)
  'app/api/analyze-document/route.ts',
  'app/api/analyze-image/route.ts',
  'app/api/analyze-screenshot/route.ts',
]

// Routes to keep (still needed)
const ROUTES_TO_KEEP = [
  'app/api/chat/route.ts',
  'app/api/intelligence-v2/route.ts',
  'app/api/ai-stream/route.ts',
  'app/api/video-to-app/route.ts',
  'app/api/upload/route.ts',
  'app/api/export-summary/route.ts',
  'app/api/send-pdf-summary/route.ts',
  'app/api/send-lead-email/route.ts',
  'app/api/send-artifact-link/route.ts',
  'app/api/consent/route.ts',
  'app/api/contact/route.ts',
  'app/api/workshop-waitlist/route.ts',
  'app/api/meetings/route.ts',
  'app/api/meetings/book/route.ts',
  'app/api/meetings/booked-slots/route.ts',
  'app/api/meetings/[id]/status/route.ts',
  'app/api/lead-upsert/route.ts',
  'app/api/lead-search-results/[leadId]/route.ts',
  'app/api/artifacts/[id]/link-lead/route.ts',
  'app/api/leads/[id]/engagement/route.ts',
  'app/api/cleanup-activities/route.ts',
  'app/api/demo-status/route.ts',
  'app/api/educational-content/route.ts',
  'app/api/webhook/route.ts',
  'app/api/webhooks/resend/route.ts',
]

function deleteFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
      console.log(`✅ Deleted: ${filePath}`)
      return true
    } else {
      console.log(`⚠️  Not found: ${filePath}`)
      return false
    }
  } catch (error) {
    console.error(`❌ Error deleting ${filePath}:`, error.message)
    return false
  }
}

function cleanupEmptyDirectories(dirPath) {
  try {
    const files = fs.readdirSync(dirPath)
    if (files.length === 0) {
      fs.rmdirSync(dirPath)
      console.log(`🗑️  Removed empty directory: ${dirPath}`)
      return true
    }
  } catch (error) {
    // Directory doesn't exist or can't be read
  }
  return false
}

async function main() {
  console.log('🧹 Cleaning up redundant API routes...\n')
  
  let deletedCount = 0
  let notFoundCount = 0
  
  // Delete redundant routes
  for (const route of ROUTES_TO_DELETE) {
    const wasDeleted = deleteFile(route)
    if (wasDeleted) {
      deletedCount++
    } else {
      notFoundCount++
    }
  }
  
  // Clean up empty directories
  console.log('\n🗂️  Cleaning up empty directories...')
  const directoriesToCheck = [
    'app/api/intelligence',
    'app/api/tools',
    'app/api/analyze-document',
    'app/api/analyze-image',
    'app/api/analyze-screenshot'
  ]
  
  for (const dir of directoriesToCheck) {
    cleanupEmptyDirectories(dir)
  }
  
  // Summary
  console.log('\n📊 Cleanup Summary:')
  console.log(`✅ Deleted: ${deletedCount} files`)
  console.log(`⚠️  Not found: ${notFoundCount} files`)
  console.log(`📁 Kept: ${ROUTES_TO_KEEP.length} essential routes`)
  
  console.log('\n🎯 Next steps:')
  console.log('1. Test the application to ensure no broken imports')
  console.log('2. Update any frontend code that might reference deleted routes')
  console.log('3. Update middleware.ts if it references deleted routes')
  console.log('4. Consider consolidating admin routes if needed')
}

if (require.main === module) {
  main().catch(console.error)
}

module.exports = { ROUTES_TO_DELETE, ROUTES_TO_KEEP }
