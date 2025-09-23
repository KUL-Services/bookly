'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import Box from '@mui/material/Box'

// Icons
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'

// Components
import ImageUpload from '@/components/media/ImageUpload'

// API
import { BusinessService, AuthService, MediaService } from '@/lib/api'
import type { Business, SocialLink, BusinessChangeRequest } from '@/lib/api'

// Store
import { useAuthStore } from '@/stores/auth.store'

// Types
interface BusinessFormData {
  id: string
  name: string
  email: string
  description: string
  socialLinks: SocialLink[]
  logo: string | null
}

const initialFormData: Partial<BusinessFormData> = {
  name: '',
  email: '',
  description: '',
  socialLinks: [],
  logo: null
}

const supportedPlatforms = [
  'facebook',
  'instagram',
  'twitter',
  'linkedin',
  'youtube',
  'tiktok',
  'website'
]

const BusinessProfileSettings = () => {
  // Store
  const { materializeUser } = useAuthStore()

  // States
  const [formData, setFormData] = useState<BusinessFormData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [originalData, setOriginalData] = useState<BusinessFormData | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  // Load business data from auth store
  useEffect(() => {
    loadBusinessData()
  }, [materializeUser])

  const loadBusinessData = async () => {
    try {
      setLoading(true)
      setError(null)

      // First try to get updated business data from API
      try {
        const response = await AuthService.getAdminDetails()
        if (response.data && !response.error) {
          const adminDetails = response.data
          const business = adminDetails.business

          if (business) {
            const businessData: BusinessFormData = {
              id: business.id,
              name: business.name,
              email: business.email || '',
              description: business.description || '',
              socialLinks: business.socialLinks || [],
              logo: business.logo || null
            }

            setFormData(businessData)
            setOriginalData(businessData)
            return
          }
        }
      } catch (apiError) {
        console.warn('Failed to fetch from API, falling back to auth store data:', apiError)
      }

      // Fallback to auth store data if API fails
      if (!materializeUser?.business) {
        throw new Error('No business profile found. Please ensure you are logged in as a business admin.')
      }

      const business = materializeUser.business
      const businessData: BusinessFormData = {
        id: business.id,
        name: business.name,
        email: business.email || '',
        description: business.description || '',
        socialLinks: business.socialLinks || [],
        logo: business.logo || null
      }

      setFormData(businessData)
      setOriginalData(businessData)
    } catch (err) {
      console.error('Failed to load business data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load business profile')
    } finally {
      setLoading(false)
    }
  }

  const validateField = (field: keyof BusinessFormData, value: any): string | null => {
    switch (field) {
      case 'name':
        if (!value?.trim()) return 'Business name is required'
        if (value.trim().length < 2) return 'Business name must be at least 2 characters long'
        if (value.trim().length > 100) return 'Business name must be less than 100 characters'
        return null
      case 'email':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email address'
        return null
      case 'description':
        if (value && value.length > 1000) return 'Business description must be less than 1000 characters'
        return null
      default:
        return null
    }
  }

  const handleInputChange = (field: keyof BusinessFormData, value: any) => {
    if (!formData) return
    setFormData(prev => prev ? { ...prev, [field]: value } : prev)

    // Validate field and update field errors
    const fieldError = validateField(field, value)
    setFieldErrors(prev => ({
      ...prev,
      [field]: fieldError || ''
    }))

    // Clear global messages on any change
    setError(null)
    setSuccess(null)
  }

  const handleSocialLinkChange = (index: number, field: 'platform' | 'url', value: string) => {
    if (!formData) return

    const newSocialLinks = [...formData.socialLinks]
    newSocialLinks[index] = { ...newSocialLinks[index], [field]: value }
    handleInputChange('socialLinks', newSocialLinks)
  }

  const addSocialLink = () => {
    if (!formData) return

    const newSocialLinks = [...formData.socialLinks, { platform: '', url: '' }]
    handleInputChange('socialLinks', newSocialLinks)
  }

  const removeSocialLink = (index: number) => {
    if (!formData) return

    const newSocialLinks = formData.socialLinks.filter((_, i) => i !== index)
    handleInputChange('socialLinks', newSocialLinks)
  }

  const handleLogoUploaded = (imageId: string) => {
    handleInputChange('logo', imageId)
  }

  const handleLogoDeleted = async () => {
    if (formData?.logo) {
      try {
        await MediaService.deleteAsset(formData.logo)
        console.log('✅ Deleted business logo:', formData.logo)
      } catch (error) {
        console.warn('Failed to delete business logo:', error)
        // Don't block the UI, just log the warning
      }
    }
    handleInputChange('logo', null)
  }

  const validateForm = () => {
    const errors: string[] = []

    // Validate required fields
    if (!formData?.name.trim()) {
      errors.push('Business name is required')
    } else if (formData.name.trim().length < 2) {
      errors.push('Business name must be at least 2 characters long')
    } else if (formData.name.trim().length > 100) {
      errors.push('Business name must be less than 100 characters')
    }

    // Validate email
    if (formData?.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        errors.push('Please enter a valid email address')
      }
    }

    // Validate description length
    if (formData?.description && formData.description.length > 1000) {
      errors.push('Business description must be less than 1000 characters')
    }

    // Validate social links
    const validSocialLinks = formData?.socialLinks.filter(link =>
      link.platform.trim() && link.url.trim()
    ) || []

    for (const link of validSocialLinks) {
      // Check if platform is supported
      if (!supportedPlatforms.includes(link.platform)) {
        errors.push(`Unsupported social platform: ${link.platform}`)
        continue
      }

      // Validate URL format
      try {
        const url = new URL(link.url)
        if (!['http:', 'https:'].includes(url.protocol)) {
          errors.push(`Invalid URL protocol for ${link.platform}. Must be http or https`)
        }
      } catch {
        errors.push(`Invalid URL format for ${link.platform}: ${link.url}`)
      }
    }

    // Check for duplicate platforms
    const platforms = validSocialLinks.map(link => link.platform)
    const duplicates = platforms.filter((platform, index) => platforms.indexOf(platform) !== index)
    if (duplicates.length > 0) {
      errors.push(`Duplicate social platforms found: ${[...new Set(duplicates)].join(', ')}`)
    }

    return errors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData) return

    try {
      setSaving(true)
      setError(null)
      setSuccess(null)

      // Validate form
      const validationErrors = validateForm()
      if (validationErrors.length > 0) {
        throw new Error(validationErrors[0]) // Show first error
      }

      // Filter valid social links
      const validSocialLinks = formData.socialLinks.filter(link =>
        link.platform.trim() && link.url.trim()
      )

      // Prepare update data
      const updateData = {
        id: formData.id,
        name: formData.name.trim(),
        email: formData.email.trim() || undefined,
        description: formData.description.trim() || undefined,
        socialLinks: validSocialLinks,
        logo: formData.logo
      }

      // Submit update request
      const response = await BusinessService.updateBusiness(updateData)

      if (response.error) {
        throw new Error(response.error)
      }

      setSuccess('Business profile updated successfully! Changes are pending admin approval.')
      setOriginalData({ ...formData })
    } catch (err) {
      console.error('Update failed:', err)
      setError(err instanceof Error ? err.message : 'Failed to update business profile')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    if (originalData) {
      setFormData({ ...originalData })
      setError(null)
      setSuccess(null)
    }
  }

  const hasChanges = () => {
    if (!formData || !originalData) return false

    return JSON.stringify(formData) !== JSON.stringify(originalData)
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center py-8">
          <CircularProgress />
        </CardContent>
      </Card>
    )
  }

  if (!formData) {
    return (
      <Card>
        <CardContent>
          <Alert severity="error">
            Failed to load business profile. Please refresh the page and try again.
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="pb-4">
        <Typography variant="h5" className="mb-2">
          Business Profile Settings
        </Typography>
        <Typography variant="body2" color="textSecondary" className="mb-6">
          Update your business information. Changes require admin approval before going live.
        </Typography>

        {error && (
          <Alert severity="error" className="mb-4" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" className="mb-4" onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        {/* Business Logo */}
        <div className="flex max-sm:flex-col items-start gap-6 mb-6">
          <ImageUpload
            currentImageUrl={materializeUser?.business?.logoUrl || null}
            onImageUploaded={handleLogoUploaded}
            onImageDeleted={handleLogoDeleted}
            label="Upload Business Logo"
            description="Click to upload your business logo"
            maxSizeMB={2}
            width={120}
            height={120}
          />
          <div className="flex flex-grow flex-col gap-2">
            <Typography variant="h6">Business Logo</Typography>
            <Typography variant="body2" color="textSecondary">
              Upload your business logo. This will be displayed on your business profile and in search results.
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Recommended size: 400x400px. Max file size: 2MB. Supported formats: JPG, PNG, WebP, GIF
            </Typography>
          </div>
        </div>

        <Divider className="mb-6" />
      </CardContent>

      <CardContent>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={4}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" className="mb-4">
                Basic Information
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Business Name"
                value={formData.name}
                onChange={e => handleInputChange('name', e.target.value)}
                placeholder="Enter your business name"
                disabled={saving}
                error={!!fieldErrors.name}
                helperText={fieldErrors.name || ''}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="email"
                label="Business Email"
                value={formData.email}
                onChange={e => handleInputChange('email', e.target.value)}
                placeholder="business@example.com"
                disabled={saving}
                error={!!fieldErrors.email}
                helperText={fieldErrors.email || "Optional - Contact email for your business"}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Business Description"
                value={formData.description}
                onChange={e => handleInputChange('description', e.target.value)}
                placeholder="Describe your business and services..."
                disabled={saving}
                error={!!fieldErrors.description}
                helperText={fieldErrors.description || "Describe what makes your business special (optional)"}
              />
            </Grid>

            {/* Social Links */}
            <Grid item xs={12}>
              <Typography variant="h6" className="mb-4 mt-4">
                Social Media Links
              </Typography>
              <Typography variant="body2" color="textSecondary" className="mb-4">
                Add your social media profiles to help customers connect with you.
              </Typography>
            </Grid>

            {formData.socialLinks.map((link, index) => (
              <Grid item xs={12} key={index}>
                <Box className="flex gap-3 items-start">
                  <TextField
                    select
                    label="Platform"
                    value={link.platform}
                    onChange={e => handleSocialLinkChange(index, 'platform', e.target.value)}
                    disabled={saving}
                    className="min-w-[140px]"
                    SelectProps={{
                      native: true,
                    }}
                  >
                    <option value="">Select Platform</option>
                    {supportedPlatforms.map(platform => (
                      <option key={platform} value={platform}>
                        {platform.charAt(0).toUpperCase() + platform.slice(1)}
                      </option>
                    ))}
                  </TextField>

                  <TextField
                    fullWidth
                    label="URL"
                    value={link.url}
                    onChange={e => handleSocialLinkChange(index, 'url', e.target.value)}
                    placeholder="https://..."
                    disabled={saving}
                  />

                  <IconButton
                    onClick={() => removeSocialLink(index)}
                    disabled={saving}
                    color="error"
                    className="mt-2"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Grid>
            ))}

            <Grid item xs={12}>
              <Button
                startIcon={<AddIcon />}
                onClick={addSocialLink}
                disabled={saving}
                variant="outlined"
                className="mb-4"
              >
                Add Social Link
              </Button>
            </Grid>

            {/* Action Buttons */}
            <Grid item xs={12} className="flex gap-4 flex-wrap pt-6">
              <Button
                type="submit"
                variant="contained"
                disabled={saving || !hasChanges()}
                startIcon={saving ? <CircularProgress size={20} /> : undefined}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>

              <Button
                variant="outlined"
                color="secondary"
                onClick={handleReset}
                disabled={saving || !hasChanges()}
              >
                Reset Changes
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  )
}

export default BusinessProfileSettings