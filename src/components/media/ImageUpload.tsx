'use client'

import { useState, useRef, useEffect } from 'react'
import {
  Button,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  IconButton,
  Alert
} from '@mui/material'
import { CloudUpload, Delete, Edit } from '@mui/icons-material'
import { MediaService } from '@/lib/api'

interface ImageUploadProps {
  currentImageUrl?: string | null // Changed from currentImageId to currentImageUrl
  onImageUploaded: (imageId: string) => void
  onImageDeleted?: () => void
  label?: string
  description?: string
  maxSizeMB?: number
  width?: number
  height?: number
  className?: string
  disabled?: boolean
}

export const ImageUpload = ({
  currentImageUrl,
  onImageUploaded,
  onImageDeleted,
  label = "Upload Image",
  description = "Click to upload or drag and drop",
  maxSizeMB = 5,
  width = 200,
  height = 200,
  className = "",
  disabled = false
}: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const handleFileSelect = (file: File) => {
    if (disabled) return

    setError(null)

    // Validate file
    const validation = MediaService.validateImageFile(file, maxSizeMB)
    if (!validation.isValid) {
      setError(validation.error!)
      return
    }

    // Create preview URL immediately
    const fileUrl = URL.createObjectURL(file)
    setPreviewUrl(fileUrl)

    uploadFile(file)
  }

  const uploadFile = async (file: File) => {
    setUploading(true)
    setError(null)

    try {
      const result = await MediaService.uploadFile(file)

      if (result.success) {
        onImageUploaded(result.assetFileId)
      } else {
        setError(result.error || 'Upload failed')
      }
    } catch (err) {
      console.error('Upload error:', err)
      setError('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
    // Reset input value so same file can be selected again
    event.target.value = ''
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    setDragOver(false)

    const file = event.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault()
    setDragOver(false)
  }

  const handleDelete = async () => {
    if ((!currentImageUrl && !previewUrl) || disabled) return

    // Clean up preview URL if it exists
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }

    // Since we're working with URLs now, we just call the delete callback
    // The parent component should handle the actual deletion logic
    onImageDeleted?.()
  }

  const openFileDialog = () => {
    if (!disabled) {
      fileInputRef.current?.click()
    }
  }

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        style={{ display: 'none' }}
        disabled={disabled}
      />

      <Card
        onClick={currentImageUrl || previewUrl ? undefined : openFileDialog}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        sx={{
          width: width,
          height: height,
          cursor: disabled ? 'not-allowed' : (currentImageUrl || previewUrl ? 'default' : 'pointer'),
          border: dragOver ? '2px dashed #0a2c24' : '2px dashed #ccc',
          backgroundColor: dragOver ? '#f5f5f5' : 'transparent',
          opacity: disabled ? 0.6 : 1,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <CardContent sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: 2,
          '&:last-child': { pb: 2 }
        }}>
          {uploading ? (
            <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
              <CircularProgress />
              <Typography variant="body2" color="text.secondary">
                Uploading...
              </Typography>
            </Box>
          ) : currentImageUrl || previewUrl ? (
            <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
              <img
                src={previewUrl || currentImageUrl}
                alt="Current image"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '8px'
                }}
                onError={(e) => {
                  // Fallback if image fails to load
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                  target.nextElementSibling?.removeAttribute('style')
                }}
              />
              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: '#f0f0f0',
                  display: 'none', // Hidden by default, shown if image fails to load
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 1,
                  position: 'absolute',
                  top: 0,
                  left: 0
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Failed to load image
                </Typography>
              </Box>

              {!disabled && (
                <Box sx={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  display: 'flex',
                  gap: 1
                }}>
                  <IconButton
                    size="small"
                    onClick={openFileDialog}
                    sx={{
                      backgroundColor: 'rgba(255,255,255,0.9)',
                      '&:hover': { backgroundColor: 'rgba(255,255,255,1)' }
                    }}
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                  {onImageDeleted && (
                    <IconButton
                      size="small"
                      onClick={handleDelete}
                      color="error"
                      sx={{
                        backgroundColor: 'rgba(255,255,255,0.9)',
                        '&:hover': { backgroundColor: 'rgba(255,255,255,1)' }
                      }}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  )}
                </Box>
              )}
            </Box>
          ) : (
            <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
              <CloudUpload sx={{ fontSize: 48, color: 'text.secondary' }} />
              <Typography variant="subtitle2" textAlign="center">
                {label}
              </Typography>
              <Typography variant="body2" color="text.secondary" textAlign="center">
                {description}
              </Typography>
              <Typography variant="caption" color="text.secondary" textAlign="center">
                Max size: {maxSizeMB}MB
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mt: 1 }}>
          {error}
        </Alert>
      )}
    </div>
  )
}

export default ImageUpload