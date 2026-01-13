'use client'

import { useState, useRef } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'
import Avatar from '@mui/material/Avatar'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Alert from '@mui/material/Alert'

// Store
import { useBusinessSettingsStore } from '@/stores/business-settings.store'

const TIMEZONES = [
  { value: 'Africa/Cairo', label: 'Cairo (GMT+2)' },
  { value: 'Asia/Riyadh', label: 'Riyadh (GMT+3)' },
  { value: 'Asia/Dubai', label: 'Dubai (GMT+4)' },
  { value: 'Europe/London', label: 'London (GMT+0/+1)' },
  { value: 'America/New_York', label: 'New York (GMT-5/-4)' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (GMT-8/-7)' }
]

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'ar', label: 'العربية (Arabic)' },
  { value: 'fr', label: 'Français (French)' }
]

const BusinessProfileTab = () => {
  const { businessProfile, socialLinks, updateBusinessProfile, updateSocialLinks } = useBusinessSettingsStore()
  const logoInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)
  const [slugError, setSlugError] = useState<string | null>(null)

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // In production, this would upload to server and get URL back
      const reader = new FileReader()
      reader.onloadend = () => {
        updateBusinessProfile({ logo: reader.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        updateBusinessProfile({ coverImage: reader.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSlugChange = (value: string) => {
    // Sanitize slug: lowercase, no spaces, only alphanumeric and hyphens
    const sanitized = value
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')

    if (value !== sanitized) {
      setSlugError('URL can only contain lowercase letters, numbers, and hyphens')
    } else {
      setSlugError(null)
    }

    updateBusinessProfile({ publicUrlSlug: sanitized })
  }

  return (
    <Grid container spacing={6}>
      {/* Business Identity */}
      <Grid item xs={12}>
        <Card>
          <CardHeader
            title='Business Identity'
            subheader={
              <Typography variant='body2' color='text.secondary' sx={{ fontFamily: 'var(--font-fira-code)' }}>
                Your business name, logo, and basic information
              </Typography>
            }
          />
          <CardContent>
            <Grid container spacing={4}>
              {/* Logo & Cover Section */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 4, flexWrap: 'wrap' }}>
                  {/* Logo */}
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography
                      variant='body2'
                      color='text.secondary'
                      sx={{ mb: 1, fontFamily: 'var(--font-fira-code)' }}
                    >
                      Business Logo
                    </Typography>
                    <Box sx={{ position: 'relative', display: 'inline-block' }}>
                      <Avatar
                        src={businessProfile.logo || undefined}
                        alt={businessProfile.name}
                        sx={{
                          width: 100,
                          height: 100,
                          fontSize: '2rem',
                          bgcolor: 'primary.main',
                          cursor: 'pointer'
                        }}
                        onClick={() => logoInputRef.current?.click()}
                      >
                        {businessProfile.name ? businessProfile.name[0].toUpperCase() : 'B'}
                      </Avatar>
                      <IconButton
                        size='small'
                        sx={{
                          position: 'absolute',
                          bottom: 0,
                          right: 0,
                          bgcolor: 'background.paper',
                          boxShadow: 1,
                          '&:hover': { bgcolor: 'action.hover' }
                        }}
                        onClick={() => logoInputRef.current?.click()}
                      >
                        <i className='ri-camera-line' style={{ fontSize: '1rem' }} />
                      </IconButton>
                    </Box>
                    <input ref={logoInputRef} type='file' accept='image/*' hidden onChange={handleLogoChange} />
                    <Typography
                      variant='caption'
                      display='block'
                      color='text.secondary'
                      sx={{ mt: 1, fontFamily: 'var(--font-fira-code)' }}
                    >
                      Recommended: 200x200px
                    </Typography>
                  </Box>

                  {/* Cover Image */}
                  <Box sx={{ flex: 1, minWidth: 200 }}>
                    <Typography
                      variant='body2'
                      color='text.secondary'
                      sx={{ mb: 1, fontFamily: 'var(--font-fira-code)' }}
                    >
                      Cover Image
                    </Typography>
                    <Box
                      sx={{
                        width: '100%',
                        height: 120,
                        borderRadius: 2,
                        bgcolor: businessProfile.coverImage ? 'transparent' : 'action.hover',
                        backgroundImage: businessProfile.coverImage ? `url(${businessProfile.coverImage})` : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        border: '2px dashed',
                        borderColor: 'divider'
                      }}
                      onClick={() => coverInputRef.current?.click()}
                    >
                      {!businessProfile.coverImage && (
                        <Box sx={{ textAlign: 'center' }}>
                          <i
                            className='ri-image-add-line'
                            style={{ fontSize: '2rem', color: 'var(--mui-palette-text-secondary)' }}
                          />
                          <Typography
                            variant='caption'
                            display='block'
                            color='text.secondary'
                            sx={{ fontFamily: 'var(--font-fira-code)' }}
                          >
                            Click to upload cover image
                          </Typography>
                        </Box>
                      )}
                    </Box>
                    <input ref={coverInputRef} type='file' accept='image/*' hidden onChange={handleCoverChange} />
                    <Typography
                      variant='caption'
                      display='block'
                      color='text.secondary'
                      sx={{ mt: 1, fontFamily: 'var(--font-fira-code)' }}
                    >
                      Recommended: 1200x400px
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Divider />
              </Grid>

              {/* Business Name & Description */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label='Business Name'
                  value={businessProfile.name}
                  onChange={e => updateBusinessProfile({ name: e.target.value })}
                  placeholder='e.g., Luxe Beauty Salon'
                  size='small'
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label='Public URL Slug'
                  value={businessProfile.publicUrlSlug}
                  onChange={e => handleSlugChange(e.target.value)}
                  placeholder='luxe-beauty-salon'
                  size='small'
                  error={!!slugError}
                  helperText={slugError || `bookly.com/${businessProfile.publicUrlSlug || 'your-business'}`}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position='start'>
                        <Typography variant='body2' color='text.secondary' sx={{ fontFamily: 'var(--font-fira-code)' }}>
                          bookly.com/
                        </Typography>
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label='Business Description'
                  value={businessProfile.description}
                  onChange={e => updateBusinessProfile({ description: e.target.value })}
                  placeholder='Tell customers about your business, services, and what makes you unique...'
                  multiline
                  rows={3}
                  size='small'
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Contact Information */}
      <Grid item xs={12} md={6}>
        <Card sx={{ height: '100%' }}>
          <CardHeader
            title='Contact Information'
            subheader={
              <Typography variant='body2' color='text.secondary' sx={{ fontFamily: 'var(--font-fira-code)' }}>
                How customers can reach you
              </Typography>
            }
          />
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                fullWidth
                label='Business Email'
                type='email'
                value={businessProfile.email}
                onChange={e => updateBusinessProfile({ email: e.target.value })}
                placeholder='contact@yourbusiness.com'
                size='small'
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <i className='ri-mail-line' />
                    </InputAdornment>
                  )
                }}
              />

              <TextField
                fullWidth
                label='Phone Number'
                value={businessProfile.phone}
                onChange={e => updateBusinessProfile({ phone: e.target.value })}
                placeholder='+20 123 456 7890'
                size='small'
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <i className='ri-phone-line' />
                    </InputAdornment>
                  )
                }}
              />

              <TextField
                fullWidth
                label='Website'
                value={businessProfile.website}
                onChange={e => updateBusinessProfile({ website: e.target.value })}
                placeholder='https://www.yourbusiness.com'
                size='small'
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <i className='ri-global-line' />
                    </InputAdornment>
                  )
                }}
              />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Regional Settings */}
      <Grid item xs={12} md={6}>
        <Card sx={{ height: '100%' }}>
          <CardHeader
            title='Regional Settings'
            subheader={
              <Typography variant='body2' color='text.secondary' sx={{ fontFamily: 'var(--font-fira-code)' }}>
                Timezone and language preferences
              </Typography>
            }
          />
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <FormControl fullWidth size='small'>
                <InputLabel>Timezone</InputLabel>
                <Select
                  value={businessProfile.timezone}
                  label='Timezone'
                  onChange={e => updateBusinessProfile({ timezone: e.target.value })}
                >
                  {TIMEZONES.map(tz => (
                    <MenuItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth size='small'>
                <InputLabel>Language</InputLabel>
                <Select
                  value={businessProfile.language}
                  label='Language'
                  onChange={e => updateBusinessProfile({ language: e.target.value })}
                >
                  {LANGUAGES.map(lang => (
                    <MenuItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Alert severity='info' sx={{ fontSize: '0.875rem', fontFamily: 'var(--font-fira-code)' }}>
                <strong>Note:</strong> Timezone affects booking times and calendar display. Language affects your public
                booking page.
              </Alert>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Social Media Links */}
      <Grid item xs={12}>
        <Card>
          <CardHeader
            title='Social Media'
            subheader={
              <Typography variant='body2' color='text.secondary' sx={{ fontFamily: 'var(--font-fira-code)' }}>
                Connect your social media profiles
              </Typography>
            }
          />
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  label='Facebook'
                  value={socialLinks.facebook}
                  onChange={e => updateSocialLinks({ facebook: e.target.value })}
                  placeholder='https://facebook.com/yourbusiness'
                  size='small'
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position='start'>
                        <i className='ri-facebook-fill' style={{ color: '#1877F2' }} />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  label='Instagram'
                  value={socialLinks.instagram}
                  onChange={e => updateSocialLinks({ instagram: e.target.value })}
                  placeholder='https://instagram.com/yourbusiness'
                  size='small'
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position='start'>
                        <i className='ri-instagram-fill' style={{ color: '#E4405F' }} />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  label='TikTok'
                  value={socialLinks.tiktok}
                  onChange={e => updateSocialLinks({ tiktok: e.target.value })}
                  placeholder='https://tiktok.com/@yourbusiness'
                  size='small'
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position='start'>
                        <i className='ri-tiktok-fill' />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  label='Twitter / X'
                  value={socialLinks.twitter}
                  onChange={e => updateSocialLinks({ twitter: e.target.value })}
                  placeholder='https://twitter.com/yourbusiness'
                  size='small'
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position='start'>
                        <i className='ri-twitter-x-fill' />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  label='YouTube'
                  value={socialLinks.youtube}
                  onChange={e => updateSocialLinks({ youtube: e.target.value })}
                  placeholder='https://youtube.com/@yourbusiness'
                  size='small'
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position='start'>
                        <i className='ri-youtube-fill' style={{ color: '#FF0000' }} />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  label='LinkedIn'
                  value={socialLinks.linkedin}
                  onChange={e => updateSocialLinks({ linkedin: e.target.value })}
                  placeholder='https://linkedin.com/company/yourbusiness'
                  size='small'
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position='start'>
                        <i className='ri-linkedin-fill' style={{ color: '#0A66C2' }} />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default BusinessProfileTab
