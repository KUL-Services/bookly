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
import type { MediaFile } from '@/lib/api'

const MediaManagement = () => {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const fetchMedia = async () => {
    try {
      setLoading(true)
      // Note: This endpoint might not exist yet, so we'll show placeholder
      // const response = await MediaService.getMediaFiles()
      // setMediaFiles(response.data || [])
      setMediaFiles([])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch media')
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
      const formData = new FormData()
      formData.append('file', file)

      const response = await MediaService.uploadMedia(formData)
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
      const response = await MediaService.deleteMedia(id)
      if (response.error) {
        throw new Error(response.error)
      }
      await fetchMedia() // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete media')
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
                        image={media.url}
                        alt={media.filename}
                        className='object-cover'
                      />
                      <CardContent>
                        <Typography variant='subtitle2' className='truncate'>
                          {media.filename}
                        </Typography>
                        <Typography variant='caption' color='textSecondary'>
                          {media.fileSize ? `${(media.fileSize / 1024).toFixed(1)} KB` : 'Unknown size'}
                        </Typography>
                      </CardContent>
                      <Box className='absolute top-2 right-2'>
                        <IconButton
                          size='small'
                          color='error'
                          onClick={() => handleDeleteMedia(media.id)}
                          className='bg-white/80 hover:bg-white'
                        >
                          <i className='ri-delete-bin-line' />
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