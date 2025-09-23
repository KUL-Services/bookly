'use client'

import { useState, useEffect } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import CardMedia from '@mui/material/CardMedia'

// API Imports
import { MediaService } from '@/lib/api'
import type { AssetFile } from '@/lib/api'

const MediaManagement = () => {
  const [mediaFiles, setMediaFiles] = useState<AssetFile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchMedia = async () => {
    try {
      setLoading(true)
      const response = await MediaService.getMediaFiles()

      if (response.error) {
        throw new Error(response.error)
      }

      setMediaFiles(response.data || [])
      setError(null)
    } catch (err) {
      console.warn('Failed to fetch media files, showing empty state:', err)
      // Don't show error to user since media library might be empty
      setMediaFiles([])
      setError(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMedia()
  }, [])

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)

      // Validate file first
      const validation = MediaService.validateImageFile(file)
      if (!validation.isValid) {
        throw new Error(validation.error)
      }

      const response = await MediaService.uploadFile(file)
      if (response.error) {
        throw new Error(response.error)
      }

      await fetchMedia() // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload file')
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteMedia = async (id: string) => {
    if (!confirm('Are you sure you want to delete this media file?')) {
      return
    }

    try {
      setDeletingId(id)
      const response = await MediaService.deleteAsset(id)
      if (response.error) {
        throw new Error(response.error)
      }

      // Immediately update UI by removing the deleted item
      setMediaFiles(prev => prev.filter(media => media.id !== id))
      console.log('✅ Successfully deleted media file and updated UI:', id)

      // Also try to refresh the full list (optional, for data consistency)
      try {
        await fetchMedia()
      } catch (refreshError) {
        console.warn('Failed to refresh media list after deletion, but UI was updated locally:', refreshError)
      }
    } catch (err) {
      console.error('Failed to delete media:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete media')
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return (
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <CardContent className='flex justify-center items-center py-12'>
              <CircularProgress />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    )
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader
            title='Media Library'
            subheader='Upload and manage media files'
            action={
              <Button
                variant='contained'
                component='label'
                disabled={uploading}
                startIcon={uploading ? <CircularProgress size={16} /> : <i className='ri-upload-line' />}
              >
                {uploading ? 'Uploading...' : 'Upload File'}
                <input
                  type='file'
                  hidden
                  accept='image/*,video/*'
                  onChange={handleFileUpload}
                />
              </Button>
            }
          />
          <CardContent>
            {error && (
              <Alert severity='error' className='mb-4'>
                {error}
              </Alert>
            )}

            {mediaFiles.length === 0 ? (
              <div className='text-center py-8'>
                <Typography variant='h6' color='textSecondary'>
                  No media files found
                </Typography>
                <Typography variant='body2' color='textSecondary'>
                  Upload your first media file to get started
                </Typography>
              </div>
            ) : (
              <Grid container spacing={3}>
                {mediaFiles.map((media) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={media.id}>
                    <Card className='relative'>
                      <CardMedia
                        component='img'
                        height='200'
                        image={media.uploadUrl}
                        alt={media.fileName}
                        className='object-cover'
                      />
                      <CardContent>
                        <Typography variant='subtitle2' className='truncate'>
                          {media.fileName}
                        </Typography>
                        <Typography variant='caption' color='textSecondary'>
                          {media.size ? `${(media.size / 1024).toFixed(1)} KB` : 'Unknown size'}
                        </Typography>
                        <Typography variant='caption' color='textSecondary' display='block'>
                          {media.mimeType}
                        </Typography>
                      </CardContent>
                      <Box className='absolute top-2 right-2'>
                        <IconButton
                          size='small'
                          color='error'
                          onClick={() => handleDeleteMedia(media.id)}
                          disabled={deletingId === media.id}
                          className='bg-white/80 hover:bg-white'
                        >
                          {deletingId === media.id ? (
                            <CircularProgress size={16} color='error' />
                          ) : (
                            <i className='ri-delete-bin-line' />
                          )}
                        </IconButton>
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default MediaManagement