'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

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
import type { BusinessProfile, SocialLinks } from '@/stores/business-settings.store'
import { useTabDirtyStore } from '@/stores/tab-dirty.store'
import { BrandedSpinner } from '@/bookly/components/atoms/branded-spinner'
import { ConfirmChangesDialog } from '@/bookly/components/molecules/confirm-changes-dialog'
import type { FieldChange } from '@/bookly/components/molecules/confirm-changes-dialog'

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

// Sections that have their own draft state
type Section = 'identity' | 'contact' | 'regional' | 'social'

/** Compute the list of changed fields between original and draft objects */
function getDiff<T extends object>(labels: Partial<Record<keyof T, string>>, original: T, draft: T): FieldChange[] {
  return (Object.keys(labels) as Array<keyof T>)
    .filter(
      key =>
        String((original as Record<string, unknown>)[key as string] ?? '') !==
        String((draft as Record<string, unknown>)[key as string] ?? '')
    )
    .map(key => ({
      field: labels[key] as string,
      from: String((original as Record<string, unknown>)[key as string] ?? ''),
      to: String((draft as Record<string, unknown>)[key as string] ?? '')
    }))
}

// ─────────────────────────────────────────────────────────────────────────────
// Section Save/Cancel action buttons (shown when section is dirty)
// ─────────────────────────────────────────────────────────────────────────────
interface SectionActionsProps {
  isDirty: boolean
  isSaving: boolean
  onSave: () => void
  onCancel: () => void
}

const SectionActions = ({ isDirty, isSaving, onSave, onCancel }: SectionActionsProps) => {
  if (!isDirty) return null
  return (
    <Box sx={{ display: 'flex', gap: 1 }}>
      <Button size='small' variant='outlined' color='secondary' onClick={onCancel} disabled={isSaving}>
        Cancel
      </Button>
      <Button
        size='small'
        variant='contained'
        onClick={onSave}
        disabled={isSaving}
        startIcon={isSaving ? <BrandedSpinner size={14} color='inherit' /> : <i className='ri-save-2-line' />}
      >
        {isSaving ? 'Saving...' : 'Save'}
      </Button>
    </Box>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Tab Component
// ─────────────────────────────────────────────────────────────────────────────

const BusinessProfileTab = () => {
  const {
    businessProfile,
    socialLinks,
    updateBusinessProfile,
    updateSocialLinks,
    saveBusinessProfileSection,
    isSaving
  } = useBusinessSettingsStore()

  const logoInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)

  // ─── Per-section draft state ──────────────────────────────────────────────

  type IdentityDraft = Pick<BusinessProfile, 'name' | 'publicUrlSlug' | 'description' | 'logo' | 'coverImage'>
  type ContactDraft = Pick<BusinessProfile, 'email' | 'phone' | 'website'>
  type RegionalDraft = Pick<BusinessProfile, 'timezone' | 'language'>
  type SocialDraft = SocialLinks

  const [identityDraft, setIdentityDraft] = useState<IdentityDraft>({
    name: businessProfile.name,
    publicUrlSlug: businessProfile.publicUrlSlug,
    description: businessProfile.description,
    logo: businessProfile.logo,
    coverImage: businessProfile.coverImage
  })

  const [contactDraft, setContactDraft] = useState<ContactDraft>({
    email: businessProfile.email,
    phone: businessProfile.phone,
    website: businessProfile.website
  })

  const [regionalDraft, setRegionalDraft] = useState<RegionalDraft>({
    timezone: businessProfile.timezone,
    language: businessProfile.language
  })

  const [socialDraft, setSocialDraft] = useState<SocialDraft>({ ...socialLinks })

  // ─── Slug validation ───────────────────────────────────────────────────────
  const [slugError, setSlugError] = useState<string | null>(null)

  // ─── Confirm dialog state ─────────────────────────────────────────────────
  const [confirmSection, setConfirmSection] = useState<Section | null>(null)

  // ─── Dirty detection ──────────────────────────────────────────────────────
  const isIdentityDirty =
    identityDraft.name !== businessProfile.name ||
    identityDraft.publicUrlSlug !== businessProfile.publicUrlSlug ||
    identityDraft.description !== businessProfile.description ||
    identityDraft.logo !== businessProfile.logo ||
    identityDraft.coverImage !== businessProfile.coverImage

  const isContactDirty =
    contactDraft.email !== businessProfile.email ||
    contactDraft.phone !== businessProfile.phone ||
    contactDraft.website !== businessProfile.website

  const isRegionalDirty =
    regionalDraft.timezone !== businessProfile.timezone || regionalDraft.language !== businessProfile.language

  const isSocialDirty = (Object.keys(socialDraft) as Array<keyof SocialLinks>).some(
    k => socialDraft[k] !== socialLinks[k]
  )

  // ─── Build changes list for each section (for dialog) ────────────────────

  const identityChanges = getDiff<IdentityDraft>(
    {
      name: 'Business Name',
      publicUrlSlug: 'Public URL Slug',
      description: 'Description',
      logo: 'Logo',
      coverImage: 'Cover Image'
    },
    {
      name: businessProfile.name,
      publicUrlSlug: businessProfile.publicUrlSlug,
      description: businessProfile.description,
      logo: businessProfile.logo ?? '',
      coverImage: businessProfile.coverImage ?? ''
    },
    { ...identityDraft, logo: identityDraft.logo ?? '', coverImage: identityDraft.coverImage ?? '' }
  )

  const contactChanges = getDiff<ContactDraft>(
    { email: 'Business Email', phone: 'Phone Number', website: 'Website' },
    { email: businessProfile.email, phone: businessProfile.phone, website: businessProfile.website },
    contactDraft
  )

  const regionalChanges = getDiff<RegionalDraft>(
    { timezone: 'Timezone', language: 'Language' },
    { timezone: businessProfile.timezone, language: businessProfile.language },
    regionalDraft
  )

  const socialChanges = getDiff<SocialDraft>(
    {
      facebook: 'Facebook',
      instagram: 'Instagram',
      tiktok: 'TikTok',
      twitter: 'Twitter / X',
      youtube: 'YouTube',
      linkedin: 'LinkedIn'
    },
    socialLinks,
    socialDraft
  )

  // ─── Cancel handlers (reset draft ← store) ────────────────────────────────

  const cancelIdentity = useCallback(() => {
    setIdentityDraft({
      name: businessProfile.name,
      publicUrlSlug: businessProfile.publicUrlSlug,
      description: businessProfile.description,
      logo: businessProfile.logo,
      coverImage: businessProfile.coverImage
    })
    setSlugError(null)
  }, [businessProfile])

  const cancelContact = useCallback(() => {
    setContactDraft({ email: businessProfile.email, phone: businessProfile.phone, website: businessProfile.website })
  }, [businessProfile])

  const cancelRegional = useCallback(() => {
    setRegionalDraft({ timezone: businessProfile.timezone, language: businessProfile.language })
  }, [businessProfile])

  const cancelSocial = useCallback(() => {
    setSocialDraft({ ...socialLinks })
  }, [socialLinks])

  // ─── Register overall tab dirty state with the tab-dirty store ───────────
  const isAnyDirty = isIdentityDirty || isContactDirty || isRegionalDirty || isSocialDirty

  const resetAll = useCallback(() => {
    cancelIdentity()
    cancelContact()
    cancelRegional()
    cancelSocial()
  }, [cancelIdentity, cancelContact, cancelRegional, cancelSocial])

  // Keep refs for things that change on every render so our effect stays stable
  const isAnyDirtyRef = useRef(isAnyDirty)
  isAnyDirtyRef.current = isAnyDirty
  const resetAllRef = useRef(resetAll)
  resetAllRef.current = resetAll
  const updateBusinessProfileRef = useRef(updateBusinessProfile)
  updateBusinessProfileRef.current = updateBusinessProfile
  const updateSocialLinksRef = useRef(updateSocialLinks)
  updateSocialLinksRef.current = updateSocialLinks
  const saveBusinessProfileSectionRef = useRef(saveBusinessProfileSection)
  saveBusinessProfileSectionRef.current = saveBusinessProfileSection
  type DraftsRef = {
    identity: typeof identityDraft
    contact: typeof contactDraft
    regional: typeof regionalDraft
    social: typeof socialDraft
    flags: { identity: boolean; contact: boolean; regional: boolean; social: boolean }
  }
  const draftsRef = useRef<DraftsRef>({
    identity: identityDraft,
    contact: contactDraft,
    regional: regionalDraft,
    social: socialDraft,
    flags: { identity: isIdentityDirty, contact: isContactDirty, regional: isRegionalDirty, social: isSocialDirty }
  })
  draftsRef.current = {
    identity: identityDraft,
    contact: contactDraft,
    regional: regionalDraft,
    social: socialDraft,
    flags: { identity: isIdentityDirty, contact: isContactDirty, regional: isRegionalDirty, social: isSocialDirty }
  }

  const { register, unregister } = useTabDirtyStore()

  useEffect(() => {
    register('business-profile', {
      get isDirty() {
        return isAnyDirtyRef.current
      },
      reset: () => resetAllRef.current(),
      save: async () => {
        const { identity, contact, regional, social, flags } = draftsRef.current
        if (flags.identity) updateBusinessProfileRef.current(identity)
        if (flags.contact) updateBusinessProfileRef.current(contact)
        if (flags.regional) updateBusinessProfileRef.current(regional)
        if (flags.social) updateSocialLinksRef.current(social)
        await new Promise(r => setTimeout(r, 30))
        await saveBusinessProfileSectionRef.current()
        resetAllRef.current()
      }
    })
    // Re-register only when isDirty flips, not on every render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAnyDirty, register])

  useEffect(() => {
    return () => unregister('business-profile')
  }, [unregister])

  // ─── Confirm save for a given section ────────────────────────────────────

  const handleConfirmSave = async () => {
    if (!confirmSection) return

    // Push the relevant draft into the Zustand store
    if (confirmSection === 'identity') {
      updateBusinessProfile(identityDraft)
    } else if (confirmSection === 'contact') {
      updateBusinessProfile(contactDraft)
    } else if (confirmSection === 'regional') {
      updateBusinessProfile(regionalDraft)
    } else if (confirmSection === 'social') {
      updateSocialLinks(socialDraft)
    }

    // Close dialog first so the user can see the snackbar
    setConfirmSection(null)

    // Persist — saveBusinessProfileSection reads the latest store state
    // We use a short delay to let Zustand flush the state update
    await new Promise(r => setTimeout(r, 30))
    await saveBusinessProfileSection()
  }

  // ─── Slug sanitizer ───────────────────────────────────────────────────────

  const handleSlugChange = (value: string) => {
    const sanitized = value
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
    setSlugError(value !== sanitized ? 'URL can only contain lowercase letters, numbers, and hyphens' : null)
    setIdentityDraft(prev => ({ ...prev, publicUrlSlug: sanitized }))
  }

  // ─── Image handlers ───────────────────────────────────────────────────────

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => setIdentityDraft(prev => ({ ...prev, logo: reader.result as string }))
    reader.readAsDataURL(file)
  }

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => setIdentityDraft(prev => ({ ...prev, coverImage: reader.result as string }))
    reader.readAsDataURL(file)
  }

  // ─── Confirmation dialog config ────────────────────────────────────────────

  const dialogConfig: Record<Section, { title: string; changes: FieldChange[] }> = {
    identity: { title: 'Save Business Identity', changes: identityChanges },
    contact: { title: 'Save Contact Information', changes: contactChanges },
    regional: { title: 'Save Regional Settings', changes: regionalChanges },
    social: { title: 'Save Social Media Links', changes: socialChanges }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <>
      <Grid container spacing={6}>
        {/* ── Business Identity ─────────────────────────────────────────────── */}
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title='Business Identity'
              subheader={
                <Typography variant='body2' color='text.secondary' sx={{ fontFamily: 'var(--font-fira-code)' }}>
                  Your business name, logo, and basic information
                </Typography>
              }
              action={
                <SectionActions
                  isDirty={isIdentityDirty}
                  isSaving={isSaving}
                  onSave={() => setConfirmSection('identity')}
                  onCancel={cancelIdentity}
                />
              }
            />
            <CardContent>
              <Grid container spacing={4}>
                {/* Logo & Cover */}
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
                          src={identityDraft.logo || undefined}
                          alt={identityDraft.name}
                          sx={{ width: 100, height: 100, fontSize: '2rem', bgcolor: 'primary.main', cursor: 'pointer' }}
                          onClick={() => logoInputRef.current?.click()}
                        >
                          {identityDraft.name ? identityDraft.name[0].toUpperCase() : 'B'}
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
                          bgcolor: identityDraft.coverImage ? 'transparent' : 'action.hover',
                          backgroundImage: identityDraft.coverImage ? `url(${identityDraft.coverImage})` : 'none',
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
                        {!identityDraft.coverImage && (
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

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label='Business Name'
                    size='small'
                    value={identityDraft.name}
                    onChange={e => setIdentityDraft(prev => ({ ...prev, name: e.target.value }))}
                    placeholder='e.g., Luxe Beauty Salon'
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label='Public URL Slug'
                    size='small'
                    value={identityDraft.publicUrlSlug}
                    onChange={e => handleSlugChange(e.target.value)}
                    placeholder='luxe-beauty-salon'
                    error={!!slugError}
                    helperText={slugError || `zerv.app/${identityDraft.publicUrlSlug || 'your-business'}`}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position='start'>
                          <Typography
                            variant='body2'
                            color='text.secondary'
                            sx={{ fontFamily: 'var(--font-fira-code)' }}
                          >
                            zerv.app/
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
                    size='small'
                    multiline
                    rows={3}
                    value={identityDraft.description}
                    onChange={e => setIdentityDraft(prev => ({ ...prev, description: e.target.value }))}
                    placeholder='Tell customers about your business, services, and what makes you unique...'
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* ── Contact Information ───────────────────────────────────────────── */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardHeader
              title='Contact Information'
              subheader={
                <Typography variant='body2' color='text.secondary' sx={{ fontFamily: 'var(--font-fira-code)' }}>
                  How customers can reach you
                </Typography>
              }
              action={
                <SectionActions
                  isDirty={isContactDirty}
                  isSaving={isSaving}
                  onSave={() => setConfirmSection('contact')}
                  onCancel={cancelContact}
                />
              }
            />
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <TextField
                  fullWidth
                  label='Business Email'
                  type='email'
                  size='small'
                  value={contactDraft.email}
                  onChange={e => setContactDraft(prev => ({ ...prev, email: e.target.value }))}
                  placeholder='contact@yourbusiness.com'
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
                  size='small'
                  value={contactDraft.phone}
                  onChange={e => setContactDraft(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder='+20 123 456 7890'
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
                  size='small'
                  value={contactDraft.website}
                  onChange={e => setContactDraft(prev => ({ ...prev, website: e.target.value }))}
                  placeholder='https://www.yourbusiness.com'
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

        {/* ── Regional Settings ─────────────────────────────────────────────── */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardHeader
              title='Regional Settings'
              subheader={
                <Typography variant='body2' color='text.secondary' sx={{ fontFamily: 'var(--font-fira-code)' }}>
                  Timezone and language preferences
                </Typography>
              }
              action={
                <SectionActions
                  isDirty={isRegionalDirty}
                  isSaving={isSaving}
                  onSave={() => setConfirmSection('regional')}
                  onCancel={cancelRegional}
                />
              }
            />
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <FormControl fullWidth size='small'>
                  <InputLabel>Timezone</InputLabel>
                  <Select
                    value={regionalDraft.timezone}
                    label='Timezone'
                    onChange={e => setRegionalDraft(prev => ({ ...prev, timezone: e.target.value }))}
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
                    value={regionalDraft.language}
                    label='Language'
                    onChange={e => setRegionalDraft(prev => ({ ...prev, language: e.target.value }))}
                  >
                    {LANGUAGES.map(lang => (
                      <MenuItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Alert severity='info' sx={{ fontSize: '0.875rem', fontFamily: 'var(--font-fira-code)' }}>
                  <strong>Note:</strong> Timezone affects booking times and calendar display. Language affects your
                  public booking page.
                </Alert>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* ── Social Media ──────────────────────────────────────────────────── */}
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title='Social Media'
              subheader={
                <Typography variant='body2' color='text.secondary' sx={{ fontFamily: 'var(--font-fira-code)' }}>
                  Connect your social media profiles
                </Typography>
              }
              action={
                <SectionActions
                  isDirty={isSocialDirty}
                  isSaving={isSaving}
                  onSave={() => setConfirmSection('social')}
                  onCancel={cancelSocial}
                />
              }
            />
            <CardContent>
              <Grid container spacing={3}>
                {(
                  [
                    {
                      key: 'facebook',
                      label: 'Facebook',
                      icon: 'ri-facebook-fill',
                      color: '#1877F2',
                      placeholder: 'https://facebook.com/yourbusiness'
                    },
                    {
                      key: 'instagram',
                      label: 'Instagram',
                      icon: 'ri-instagram-fill',
                      color: '#E4405F',
                      placeholder: 'https://instagram.com/yourbusiness'
                    },
                    {
                      key: 'tiktok',
                      label: 'TikTok',
                      icon: 'ri-tiktok-fill',
                      color: undefined,
                      placeholder: 'https://tiktok.com/@yourbusiness'
                    },
                    {
                      key: 'twitter',
                      label: 'Twitter / X',
                      icon: 'ri-twitter-x-fill',
                      color: undefined,
                      placeholder: 'https://twitter.com/yourbusiness'
                    },
                    {
                      key: 'youtube',
                      label: 'YouTube',
                      icon: 'ri-youtube-fill',
                      color: '#FF0000',
                      placeholder: 'https://youtube.com/@yourbusiness'
                    },
                    {
                      key: 'linkedin',
                      label: 'LinkedIn',
                      icon: 'ri-linkedin-fill',
                      color: '#0A66C2',
                      placeholder: 'https://linkedin.com/company/yourbusiness'
                    }
                  ] as const
                ).map(social => (
                  <Grid key={social.key} item xs={12} sm={6} md={4}>
                    <TextField
                      fullWidth
                      label={social.label}
                      size='small'
                      value={socialDraft[social.key as keyof SocialDraft]}
                      onChange={e => setSocialDraft(prev => ({ ...prev, [social.key]: e.target.value }))}
                      placeholder={social.placeholder}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position='start'>
                            <i className={social.icon} style={social.color ? { color: social.color } : undefined} />
                          </InputAdornment>
                        )
                      }}
                    />
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ── Confirm Changes Dialog ─────────────────────────────────────────── */}
      {confirmSection && (
        <ConfirmChangesDialog
          open
          title={dialogConfig[confirmSection].title}
          changes={dialogConfig[confirmSection].changes}
          onConfirm={handleConfirmSave}
          onCancel={() => setConfirmSection(null)}
          isSaving={isSaving}
        />
      )}
    </>
  )
}

export default BusinessProfileTab
