'use client'

import { useState, useRef } from 'react'
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
  currentImageId?: string | null
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
  currentImageId,
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
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (file: File) => {
    if (disabled) return

    setError(null)

    // Validate file
    const validation = MediaService.validateImageFile(file, maxSizeMB)
    if (!validation.isValid) {
      setError(validation.error!)
      return
    }

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
    if (!currentImageId || disabled) return

    try {
      await MediaService.deleteAsset(currentImageId)
      onImageDeleted?.()
    } catch (err) {
      console.error('Delete error:', err)
      setError('Failed to delete image')
    }
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
        onClick={currentImageId ? undefined : openFileDialog}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        sx={{
          width: width,
          height: height,
          cursor: disabled ? 'not-allowed' : (currentImageId ? 'default' : 'pointer'),
          border: dragOver ? '2px dashed #1976d2' : '2px dashed #ccc',
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
          ) : currentImageId ? (
            <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
              {/* TODO: Replace with actual image once we have asset URL endpoint */}
              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: '#f0f0f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 1
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Image ID: {currentImageId.slice(0, 8)}...
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