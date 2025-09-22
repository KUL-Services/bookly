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
  Alert,
  Grid,
  Chip
} from '@mui/material'
import { CloudUpload, Delete, Add } from '@mui/icons-material'
import { MediaService } from '@/lib/api'

interface GalleryUploadProps {
  currentImageIds?: string[]
  currentImageUrls?: string[]
  onImagesUploaded: (imageIds: string[]) => void
  onImageDeleted?: (imageId: string) => void
  label?: string
  description?: string
  maxImages?: number
  maxSizeMB?: number
  imageWidth?: number
  imageHeight?: number
  className?: string
  disabled?: boolean
}

export const GalleryUpload = ({
  currentImageIds = [],
  currentImageUrls = [],
  onImagesUploaded,
  onImageDeleted,
  label = "Upload Gallery Images",
  description = "Click to upload or drag and drop multiple images",
  maxImages = 10,
  maxSizeMB = 5,
  imageWidth = 150,
  imageHeight = 150,
  className = "",
  disabled = false
}: GalleryUploadProps) => {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFilesSelect = (files: FileList) => {
    if (disabled) return

    const fileArray = Array.from(files)
    const availableSlots = maxImages - currentImageUrls.length

    if (fileArray.length > availableSlots) {
      setError(`You can only upload ${availableSlots} more image(s). Maximum ${maxImages} images allowed.`)
      return
    }

    setError(null)

    // Validate all files
    const validation = MediaService.validateImageFiles(fileArray, maxSizeMB)
    if (!validation.isValid) {
      setError(validation.errors.join('\n'))
      return
    }

    uploadFiles(fileArray)
  }

  const uploadFiles = async (files: File[]) => {
    setUploading(true)
    setError(null)
    setUploadProgress(`Uploading ${files.length} image(s)...`)

    try {
      const result = await MediaService.uploadMultipleFiles(files)

      if (result.success) {
        const newImageIds = [...currentImageIds, ...result.assetFileIds]
        onImagesUploaded(newImageIds)
        setUploadProgress(`Successfully uploaded ${result.assetFileIds.length} image(s)`)
        setTimeout(() => setUploadProgress(null), 2000)
      } else {
        setError(result.errors?.join('\n') || 'Upload failed')
      }
    } catch (err) {
      console.error('Upload error:', err)
      setError('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      handleFilesSelect(files)
    }
    // Reset input value so same files can be selected again
    event.target.value = ''
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    setDragOver(false)

    const files = event.dataTransfer.files
    if (files && files.length > 0) {
      handleFilesSelect(files)
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

  const handleDelete = async (imageId: string) => {
    if (disabled) return

    try {
      await MediaService.deleteAsset(imageId)
      onImageDeleted?.(imageId)
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

  const canAddMore = currentImageUrls.length < maxImages

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileInputChange}
        style={{ display: 'none' }}
        disabled={disabled}
      />

      <Box mb={2}>
        <Typography variant="h6" gutterBottom>
          {label}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {description}
        </Typography>
        <Box display="flex" gap={1} flexWrap="wrap" alignItems="center">
          <Chip
            label={`${currentImageUrls.length}/${maxImages} images`}
            size="small"
            color={currentImageUrls.length >= maxImages ? "error" : "default"}
          />
          <Chip label={`Max ${maxSizeMB}MB each`} size="small" variant="outlined" />
        </Box>
      </Box>

      <Grid container spacing={2}>
        {/* Existing Images */}
        {currentImageUrls.map((imageUrl, index) => {
          const imageId = currentImageIds[index]
          return (
            <Grid item key={imageId || index}>
              <Card
                sx={{
                  width: imageWidth,
                  height: imageHeight,
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
                  p: 0,
                  '&:last-child': { pb: 0 }
                }}>
                  <Box
                    sx={{
                      width: '100%',
                      height: '100%',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    <img
                      src={imageUrl}
                      alt={`Gallery image ${index + 1}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />

                    {!disabled && onImageDeleted && imageId && (
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(imageId)}
                        color="error"
                        sx={{
                          position: 'absolute',
                          top: 4,
                          right: 4,
                          backgroundColor: 'rgba(255,255,255,0.9)',
                          '&:hover': { backgroundColor: 'rgba(255,255,255,1)' }
                        }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )
        })}

        {/* Add More Button */}
        {canAddMore && (
          <Grid item>
            <Card
              onClick={openFileDialog}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              sx={{
                width: imageWidth,
                height: imageHeight,
                cursor: disabled ? 'not-allowed' : 'pointer',
                border: dragOver ? '2px dashed #1976d2' : '2px dashed #ccc',
                backgroundColor: dragOver ? '#f5f5f5' : 'transparent',
                opacity: disabled ? 0.6 : 1
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
                  <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
                    <CircularProgress size={24} />
                    <Typography variant="caption" textAlign="center">
                      Uploading...
                    </Typography>
                  </Box>
                ) : (
                  <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
                    <Add sx={{ fontSize: 32, color: 'text.secondary' }} />
                    <Typography variant="caption" textAlign="center">
                      Add Images
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {uploadProgress && (
        <Alert severity="info" sx={{ mt: 2 }}>
          {uploadProgress}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 2 }} style={{ whiteSpace: 'pre-line' }}>
          {error}
        </Alert>
      )}

      {!canAddMore && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          Maximum number of images ({maxImages}) reached. Delete some images to add new ones.
        </Alert>
      )}
    </div>
  )
}

export default GalleryUpload