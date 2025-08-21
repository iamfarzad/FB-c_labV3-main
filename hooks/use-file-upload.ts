"use client"

import { useState, useCallback, useRef } from "react"
import { useToast } from "@/components/ui/use-toast"

interface UseFileUploadOptions {
  // File validation options
  allowedTypes?: string[]
  maxSize?: number // in bytes, default 10MB
  maxFiles?: number

  // Upload behavior options
  uploadToServer?: boolean // default true for non-images
  convertImagesToBase64?: boolean // default true for images

  // UI options
  showToasts?: boolean // default true

  // Context options
  context?: 'chat' | 'general' // affects activity logging

  // Callback options
  onUploadStart?: (files: File[]) => void
  onUploadProgress?: (progress: number) => void
  onUploadComplete?: (results: FileUploadResult[]) => void
  onUploadError?: (error: Error) => void
}

interface FileUploadResult {
  file: File
  url?: string // Server upload result
  data?: string // Base64 data for images
  error?: string // Error message if failed
}

interface FileUploadState {
  isUploading: boolean
  progress: number // 0-100
  uploadedFiles: FileUploadResult[]
  error: Error | null
}

export function useFileUpload(options: UseFileUploadOptions = {}) {
  const {
    allowedTypes = ["*/*"],
    maxSize = 10 * 1024 * 1024, // 10MB default
    maxFiles = 1,
    uploadToServer = true,
    convertImagesToBase64 = true,
    showToasts = true,
    context = 'general',
    onUploadStart,
    onUploadProgress,
    onUploadComplete,
    onUploadError,
  } = options

  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [state, setState] = useState<FileUploadState>({
    isUploading: false,
    progress: 0,
    uploadedFiles: [],
    error: null,
  })

  const validateFile = useCallback(
    (file: File): string | null => {
      // Check file size
      if (file.size > maxSize) {
        return `File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`
      }

      // Check file type
      if (allowedTypes.length > 0 && !allowedTypes.includes("*/*")) {
        const isAllowed = allowedTypes.some((type) => {
          if (type.endsWith("/*")) {
            return file.type.startsWith(type.slice(0, -1))
          }
          return file.type === type || file.name.toLowerCase().endsWith(type.replace(".", ""))
        })

        if (!isAllowed) {
          return `File type not allowed. Allowed types: ${allowedTypes.join(", ")}`
        }
      }

      return null
    },
    [allowedTypes, maxSize],
  )

  const uploadFile = useCallback(
    async (file: File): Promise<FileUploadResult> => {
      const validationError = validateFile(file)
      if (validationError) {
        return { file, error: validationError }
      }

      try {
        // Handle images
        if (file.type.startsWith("image/")) {
          if (convertImagesToBase64) {
            const data = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader()
              reader.onload = () => resolve(reader.result as string)
              reader.onerror = reject
              reader.readAsDataURL(file)
            })
            return { file, data }
          }
        }

        // Handle other files - upload to server
        if (uploadToServer) {
          const formData = new FormData()
          formData.append("file", file)

          const response = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          })

          if (!response.ok) {
            throw new Error(`Upload failed: ${response.statusText}`)
          }

          const result = await response.json()
          return { file, url: result.url }
        }

        // If no upload needed, just return the file
        return { file }
      } catch (error) {
        console.error("File upload error:", error)
        return {
          file,
          error: error instanceof Error ? error.message : "Upload failed",
        }
      }
    },
    [validateFile, convertImagesToBase64, uploadToServer],
  )

  const uploadFiles = useCallback(
    async (files: File[]): Promise<FileUploadResult[]> => {
      if (files.length > maxFiles) {
        throw new Error(`Maximum ${maxFiles} file(s) allowed`)
      }

      const results: FileUploadResult[] = []

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const progress = ((i + 1) / files.length) * 100

        setState((prev) => ({ ...prev, progress }))
        onUploadProgress?.(progress)

        const result = await uploadFile(file)
        results.push(result)

        // Log activity for chat context
        if (context === 'chat' && result.url) {
          // This would integrate with chat activity logging
          console.info(`📎 File uploaded: ${file.name}`)
        }
      }

      return results
    },
    [maxFiles, uploadFile, onUploadProgress, context],
  )

  const handleFileSelect = useCallback(
    async (files: File[] | FileList) => {
      const fileArray = Array.from(files)

      if (fileArray.length === 0) return

      setState((prev) => ({
        ...prev,
        isUploading: true,
        progress: 0,
        error: null,
      }))

      try {
        onUploadStart?.(fileArray)
        const results = await uploadFiles(fileArray)

        setState((prev) => ({
          ...prev,
          uploadedFiles: [...prev.uploadedFiles, ...results],
          isUploading: false,
          progress: 100,
        }))

        onUploadComplete?.(results)

        // Show toasts if enabled
        if (showToasts) {
          const successCount = results.filter((r) => !r.error).length
          const errorCount = results.filter((r) => r.error).length

          if (successCount > 0) {
            toast({
              title: "Upload Complete",
              description: `${successCount} file(s) uploaded successfully`,
            })
          }

          if (errorCount > 0) {
            toast({
              title: "Upload Errors",
              description: `${errorCount} file(s) failed to upload`,
              variant: "destructive",
            })
          }
        }
      } catch (error) {
        const err = error instanceof Error ? error : new Error("Upload failed")
        setState((prev) => ({
          ...prev,
          error: err,
          isUploading: false,
        }))
        onUploadError?.(err)

        if (showToasts) {
          toast({
            title: "Upload Failed",
            description: err.message,
            variant: "destructive",
          })
        }
      }
    },
    [uploadFiles, onUploadStart, onUploadComplete, onUploadError, showToasts, toast],
  )

  const openFileDialog = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const clearUploads = useCallback(() => {
    setState((prev) => ({
      ...prev,
      uploadedFiles: [],
      error: null,
      progress: 0,
    }))
  }, [])

  const removeFile = useCallback((index: number) => {
    setState((prev) => ({
      ...prev,
      uploadedFiles: prev.uploadedFiles.filter((_, i) => i !== index),
    }))
  }, [])

  return {
    ...state,
    fileInputRef,
    handleFileSelect,
    openFileDialog,
    clearUploads,
    removeFile,
    validateFile,
  }
}
