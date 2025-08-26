/**
 * Comprehensive example of unified multimodal AI integration
 * Demonstrates how all modalities work together seamlessly
 */

import { multimodalClient, MultimodalClient } from '@/src/core/multimodal-client'

// Example: Complete multimodal session
export async function exampleMultimodalSession() {
  const sessionId = 'session_' + Date.now()
  const userId = 'user_123'

  try {
    // 1. TEXT MODALITY - Send initial text message
    console.log('📝 Sending text message...')
    const textResult = await multimodalClient.sendText({
      sessionId,
      userId,
      content: 'Hello, I need help analyzing some images and documents.'
    })
    console.log('Text result:', textResult)

    // 2. FILE UPLOAD MODALITY - Upload and auto-analyze image
    console.log('📤 Uploading image file...')
    const imageFile = new File(['fake image data'], 'screenshot.png', { type: 'image/png' })

    // Convert file to base64 for multimodal processing
    const imageBase64 = await MultimodalClient.fileToBase64(imageFile)

    const uploadResult = await multimodalClient.uploadFile({
      sessionId,
      userId,
      file: imageFile,
      autoAnalyze: true
    })
    console.log('Upload result:', uploadResult)

    // 3. VISION MODALITY - Send visual analysis
    console.log('👁️ Analyzing uploaded image...')
    const visionResult = await multimodalClient.sendVision({
      sessionId,
      userId,
      content: 'This appears to be a user interface screenshot showing a dashboard',
      imageData: imageBase64,
      imageType: 'image/png',
      imageSize: imageFile.size
    })
    console.log('Vision result:', visionResult)

    // 4. VOICE MODALITY - Add voice transcription
    console.log('🎤 Adding voice transcription...')
    const voiceResult = await multimodalClient.sendVoice({
      sessionId,
      userId,
      transcription: 'Can you help me understand what this interface is showing?',
      duration: 3.2
    })
    console.log('Voice result:', voiceResult)

    // 5. GET CONTEXT SUMMARY - See all modalities together
    console.log('📊 Getting multimodal context summary...')
    const contextResult = await multimodalClient.getContext(sessionId)
    console.log('Context summary:', contextResult)

    return {
      sessionId,
      results: {
        text: textResult,
        upload: uploadResult,
        vision: visionResult,
        voice: voiceResult,
        context: contextResult
      }
    }

  } catch (error) {
    console.error('Multimodal session error:', error)
    throw error
  }
}

// Example: Direct image analysis workflow
export async function exampleImageAnalysis() {
  const sessionId = 'analysis_' + Date.now()

  try {
    // Capture or upload image
    const imageData = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABA...' // Base64 image data

    // Analyze with webcam tool
    const analysisResult = await multimodalClient.analyzeImage(imageData, {
      sessionId,
      userId: 'user_123'
    })

    console.log('Image analysis:', analysisResult)

    // Send analysis to multimodal context
    if (analysisResult.ok && analysisResult.output?.analysis) {
      const visionResult = await multimodalClient.sendVision({
        sessionId,
        content: analysisResult.output.analysis,
        imageData,
        imageType: 'image/jpeg',
        imageSize: imageData.length
      })

      console.log('Vision context added:', visionResult)
    }

    return { analysis: analysisResult }

  } catch (error) {
    console.error('Image analysis error:', error)
    throw error
  }
}

// Example: File upload with conditional analysis
export async function exampleSmartFileUpload() {
  const sessionId = 'upload_' + Date.now()

  try {
    // Create a mock file (in real usage, this would come from file input)
    const file = new File(['document content'], 'report.pdf', { type: 'application/pdf' })

    // Check if file is analyzable
    if (MultimodalClient.isAnalyzableFile(file.type)) {
      console.log('📷 File is image/video - will auto-analyze')

      // Upload and auto-analyze
      const uploadResult = await multimodalClient.uploadFile({
        sessionId,
        userId: 'user_123',
        file,
        autoAnalyze: true
      })

      console.log('Smart upload result:', uploadResult)
      return uploadResult

    } else {
      console.log('📄 File is document/text - standard upload')

      // Standard upload without analysis
      const uploadResult = await multimodalClient.uploadFile({
        sessionId,
        userId: 'user_123',
        file,
        autoAnalyze: false
      })

      console.log('Standard upload result:', uploadResult)
      return uploadResult
    }

  } catch (error) {
    console.error('Smart upload error:', error)
    throw error
  }
}

// Example: Real-time multimodal conversation
export class MultimodalConversation {
  private sessionId: string
  private userId: string

  constructor(sessionId: string, userId: string) {
    this.sessionId = sessionId
    this.userId = userId
  }

  async addTextMessage(content: string) {
    return multimodalClient.sendText({
      sessionId: this.sessionId,
      userId: this.userId,
      content
    })
  }

  async addImageAnalysis(imageData: string, analysis: string) {
    return multimodalClient.sendVision({
      sessionId: this.sessionId,
      userId: this.userId,
      content: analysis,
      imageData,
      imageType: 'image/jpeg',
      imageSize: imageData.length
    })
  }

  async addVoiceMessage(transcription: string, duration: number) {
    return multimodalClient.sendVoice({
      sessionId: this.sessionId,
      userId: this.userId,
      transcription,
      duration
    })
  }

  async getConversationSummary() {
    return multimodalClient.getContext(this.sessionId)
  }
}

// Example usage of conversation class
export async function exampleConversationFlow() {
  const conversation = new MultimodalConversation('conv_' + Date.now(), 'user_123')

  try {
    // Add text message
    await conversation.addTextMessage('I need help with this interface design')

    // Add image analysis
    const imageData = 'data:image/png;base64,iVBORw0KGgoAAAANS...' // Base64 image
    await conversation.addImageAnalysis(imageData, 'Modern dashboard with navigation menu')

    // Add voice follow-up
    await conversation.addVoiceMessage('What do you think of this layout?', 2.8)

    // Get complete context
    const summary = await conversation.getConversationSummary()
    console.log('Conversation summary:', summary)

    return summary

  } catch (error) {
    console.error('Conversation flow error:', error)
    throw error
  }
}

// Example: Web component integration
export function useMultimodalUpload() {
  const handleFileUpload = async (files: FileList) => {
    const sessionId = 'upload_' + Date.now()

    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      try {
        // Convert to base64 if needed for multimodal processing
        const base64Data = await MultimodalClient.fileToBase64(file)

        // Upload file
        const uploadResult = await multimodalClient.uploadFile({
          sessionId,
          file,
          autoAnalyze: true
        })

        console.log(`File ${file.name} uploaded:`, uploadResult)

        // If it's an image/video, the analysis was already triggered
        // If it's a document, you might want to trigger document analysis separately

      } catch (error) {
        console.error(`Upload failed for ${file.name}:`, error)
      }
    }
  }

  return { handleFileUpload }
}

console.log('🎯 Multimodal integration examples loaded!')
console.log('Available functions:')
console.log('- exampleMultimodalSession()')
console.log('- exampleImageAnalysis()')
console.log('- exampleSmartFileUpload()')
console.log('- exampleConversationFlow()')
console.log('- useMultimodalUpload()')
