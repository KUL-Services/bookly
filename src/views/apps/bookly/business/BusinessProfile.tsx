'use client'

import { useState, useEffect } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Avatar from '@mui/material/Avatar'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Divider from '@mui/material/Divider'
import Box from '@mui/material/Box'

// API Imports
import { BusinessService, MediaService } from '@/lib/api'
import type { Business } from '@/lib/api'

// Component Imports
import { FormSkeleton, ButtonLoader } from '@/components/LoadingStates'
import ImageUpload from '@/components/media/ImageUpload'

// i18n Imports
import { useParams } from 'next/navigation'
import initTranslations from '@/app/i18n/i18n'

const BusinessProfile = () => {
  const params = useParams<{ lang: string }>()
  const [t, setT] = useState<any>(() => (key: string) => key)
  const [business, setBusiness] = useState<Business | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    description: '',
    logo: ''
  })

  const fetchBusinessProfile = async () => {
    try {
      setLoading(true)
      // Note: This should fetch the current business's own profile
      // For now, we'll use the first business as a placeholder
      const response = await BusinessService.getApprovedBusinesses()

      if (response.data && response.data.length > 0) {
        const businessData = response.data[0] // In real implementation, this would be the current business
        setBusiness(businessData)
        setFormData({
          name: businessData.name,
          email: businessData.email || '',
          description: businessData.description || '',
          logo: businessData.logo || ''
        })
      }
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch business profile')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const initializeTranslations = async () => {
      const { t: tFn } = await initTranslations(params?.lang || 'en', ['common'])
      setT(() => tFn)
    }
    initializeTranslations()
  }, [params?.lang])

  useEffect(() => {
    fetchBusinessProfile()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!business) return

    try {
      setSaving(true)
      setError(null)
      setSuccess(null)

      // Submit change request
      const response = await BusinessService.updateBusiness(business.id, formData)

      if (response.error) {
        throw new Error(response.error)
      }

      setSuccess(t('business.profile.successMessage'))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit change request')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleLogoUploaded = (imageId: string) => {
    setFormData(prev => ({ ...prev, logo: imageId }))
  }

  const handleLogoDeleted = async () => {
    if (formData.logo) {
      try {
        await MediaService.deleteAsset(formData.logo)
        console.log('✅ Deleted business logo:', formData.logo)
      } catch (error) {
        console.warn('Failed to delete business logo:', error)
        // Don't block the UI, just log the warning
      }
    }
    setFormData(prev => ({ ...prev, logo: '' }))
  }

  if (loading) {
    return (
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <CardHeader title={t('business.profile.title')} subheader={t('business.profile.subtitle')} />
            <CardContent>
              <FormSkeleton fields={5} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    )
  }

  if (!business) {
    return (
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Alert severity='error'>
                {t('business.profile.noProfile')}
              </Alert>
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
            title={t('business.profile.title')}
            subheader={t('business.profile.subtitle')}
          />
          <CardContent>
            {error && (
              <Alert severity='error' className='mb-4'>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity='success' className='mb-4'>
                {success}
              </Alert>
            )}

            {/* Current Business Info */}
            <Box className='mb-6'>
              <Typography variant='h6' className='mb-4'>{t('business.profile.currentInfo')}</Typography>
              <div className='flex items-center gap-4 mb-4'>
                <Avatar
                  src={business.logoUrl}
                  alt={business.name}
                  className='w-16 h-16'
                >
                  {business.name.charAt(0).toUpperCase()}
                </Avatar>
                <div>
                  <Typography variant='h6'>{business.name}</Typography>
                  <Typography variant='body2' color='textSecondary'>
                    {business.email || t('business.profile.noEmail')}
                  </Typography>
                  <Typography variant='caption' color='textSecondary'>
                    {t('business.profile.created')} {new Date(business.createdAt).toLocaleDateString()}
                  </Typography>
                </div>
              </div>
              {business.description && (
                <Typography variant='body2' className='mb-2'>
                  {business.description}
                </Typography>
              )}
            </Box>

            <Divider className='mb-6' />

            {/* Change Request Form */}
            <Typography variant='h6' className='mb-4'>{t('business.profile.requestChanges')}</Typography>
            <form onSubmit={handleSubmit} className='space-y-4'>
              <TextField
                fullWidth
                label={t('business.profile.businessName')}
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />

              <TextField
                fullWidth
                label={t('business.profile.businessEmail')}
                type='email'
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />

              <TextField
                fullWidth
                label={t('business.profile.businessDescription')}
                multiline
                rows={4}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
              />

              <Box>
                <Typography variant='subtitle2' className='mb-2'>{t('business.profile.businessLogo')}</Typography>
                <ImageUpload
                  currentImageUrl={business.logoUrl || null}
                  onImageUploaded={handleLogoUploaded}
                  onImageDeleted={handleLogoDeleted}
                  label={t('business.profile.uploadLogo')}
                  description={t('business.profile.logoDescription')}
                  maxSizeMB={2}
                  width={200}
                  height={200}
                />
              </Box>

              <div className='flex gap-3 pt-4'>
                <Button
                  type='submit'
                  variant='contained'
                  disabled={saving}
                  startIcon={saving ? <CircularProgress size={16} /> : <i className='ri-save-line' />}
                >
                  {saving ? t('business.profile.submitting') : t('business.profile.submitRequest')}
                </Button>

                <Button
                  variant='outlined'
                  onClick={() => {
                    setFormData({
                      name: business.name,
                      email: business.email || '',
                      description: business.description || '',
                      logo: business.logo || ''
                    })
                    setError(null)
                    setSuccess(null)
                  }}
                >
                  {t('business.profile.reset')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default BusinessProfile