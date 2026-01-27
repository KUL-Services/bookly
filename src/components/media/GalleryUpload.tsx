'use client'

import { useState, useRef, useEffect } from 'react'
import { Button, Card, CardContent, Typography, Box, IconButton, Alert, Grid, Chip } from '@mui/material'
import { CloudUpload, Delete, Add } from '@mui/icons-material'
import { MediaService } from '@/lib/api'
import { BrandedSpinner } from '@/bookly/components/atoms/branded-spinner'

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
  label = 'Upload Gallery Images',
  description = 'Click to upload or drag and drop multiple images',
  maxImages = 10,
  maxSizeMB = 5,
  imageWidth = 150,
  imageHeight = 150,
  className = '',
  disabled = false
}: GalleryUploadProps) => {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState<string | null>(null)
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      previewUrls.forEach(url => URL.revokeObjectURL(url))
    }
  }, [previewUrls])

  const handleFilesSelect = (files: FileList) => {
    if (disabled) return

    const fileArray = Array.from(files)
    const totalCurrentImages = currentImageUrls.length + previewUrls.length
    const availableSlots = maxImages - totalCurrentImages

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

    // Create preview URLs immediately
    const newPreviewUrls = fileArray.map(file => URL.createObjectURL(file))
    setPreviewUrls(prev => [...prev, ...newPreviewUrls])

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

        // Don't clear preview URLs immediately - keep them visible
        // They will be cleared when the dialog is closed or on unmount
        // This way users can see their uploaded images until real URLs are available

        setUploadProgress(`Successfully uploaded ${result.assetFileIds.length} image(s)`)
        setTimeout(() => setUploadProgress(null), 2000)
      } else {
        setError(result.errors?.join('\n') || 'Upload failed')

        // Clear preview URLs on error too
        previewUrls.forEach(url => URL.revokeObjectURL(url))
        setPreviewUrls([])
      }
    } catch (err) {
      console.error('Upload error:', err)
      setError('Upload failed. Please try again.')

      // Clear preview URLs on error
      previewUrls.forEach(url => URL.revokeObjectURL(url))
      setPreviewUrls([])
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

  const handleDeletePreview = (previewIndex: number) => {
    if (disabled) return

    // Clean up the object URL
    URL.revokeObjectURL(previewUrls[previewIndex])

    // Remove from preview URLs
    setPreviewUrls(prev => prev.filter((_, index) => index !== previewIndex))
  }

  const openFileDialog = () => {
    if (!disabled) {
      fileInputRef.current?.click()
    }
  }

  const canAddMore = currentImageUrls.length + previewUrls.length < maxImages

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type='file'
        accept='image/*'
        multiple
        onChange={handleFileInputChange}
        style={{ display: 'none' }}
        disabled={disabled}
      />

      <Box mb={2}>
        <Typography variant='h6' gutterBottom>
          {label}
        </Typography>
        <Typography variant='body2' color='text.secondary' gutterBottom>
          {description}
        </Typography>
        <Box display='flex' gap={1} flexWrap='wrap' alignItems='center'>
          <Chip
            label={`${currentImageUrls.length + previewUrls.length}/${maxImages} images`}
            size='small'
            color={currentImageUrls.length + previewUrls.length >= maxImages ? 'error' : 'default'}
          />
          <Chip label={`Max ${maxSizeMB}MB each`} size='small' variant='outlined' />
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
                <CardContent
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    p: 0,
                    '&:last-child': { pb: 0 }
                  }}
                >
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
                        size='small'
                        onClick={() => handleDelete(imageId)}
                        color='error'
                        sx={{
                          position: 'absolute',
                          top: 4,
                          right: 4,
                          backgroundColor: 'rgba(255,255,255,0.9)',
                          '&:hover': { backgroundColor: 'rgba(255,255,255,1)' }
                        }}
                      >
                        <Delete fontSize='small' />
                      </IconButton>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )
        })}

        {/* Preview Images (newly uploaded) */}
        {previewUrls.map((previewUrl, index) => (
          <Grid item key={`preview-${index}`}>
            <Card
              sx={{
                width: imageWidth,
                height: imageHeight,
                position: 'relative',
                overflow: 'hidden',
                opacity: uploading ? 0.7 : 1
              }}
            >
              <CardContent
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  p: 0,
                  '&:last-child': { pb: 0 }
                }}
              >
                <Box
                  sx={{
                    width: '100%',
                    height: '100%',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <img
                    src={previewUrl}
                    alt={`Uploading image ${index + 1}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />

                  {/* Show upload progress overlay */}
                  {uploading && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column',
                        color: 'white'
                      }}
                    >
                      <BrandedSpinner size={24} sx={{ mb: 1 }} />
                      <Typography variant='caption'>Uploading...</Typography>
                    </Box>
                  )}

                  {!disabled && !uploading && (
                    <IconButton
                      size='small'
                      onClick={() => handleDeletePreview(index)}
                      color='error'
                      sx={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        backgroundColor: 'rgba(255,255,255,0.9)',
                        '&:hover': { backgroundColor: 'rgba(255,255,255,1)' }
                      }}
                    >
                      <Delete fontSize='small' />
                    </IconButton>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}

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
                border: dragOver ? '2px dashed #0a2c24' : '2px dashed #ccc',
                backgroundColor: dragOver ? '#f5f5f5' : 'transparent',
                opacity: disabled ? 0.6 : 1
              }}
            >
              <CardContent
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  p: 2,
                  '&:last-child': { pb: 2 }
                }}
              >
                {uploading ? (
                  <Box display='flex' flexDirection='column' alignItems='center' gap={1}>
                    <BrandedSpinner size={24} />
                    <Typography variant='caption' textAlign='center'>
                      Uploading...
                    </Typography>
                  </Box>
                ) : (
                  <Box display='flex' flexDirection='column' alignItems='center' gap={1}>
                    <Add sx={{ fontSize: 32, color: 'text.secondary' }} />
                    <Typography variant='caption' textAlign='center'>
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
        <Alert severity='info' sx={{ mt: 2 }}>
          {uploadProgress}
        </Alert>
      )}

      {error && (
        <Alert severity='error' sx={{ mt: 2 }} style={{ whiteSpace: 'pre-line' }}>
          {error}
        </Alert>
      )}

      {!canAddMore && (
        <Alert severity='warning' sx={{ mt: 2 }}>
          Maximum number of images ({maxImages}) reached. Delete some images to add new ones.
        </Alert>
      )}
    </div>
  )
}

export default GalleryUpload
