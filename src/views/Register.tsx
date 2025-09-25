'use client'

// React Imports
import { useState } from 'react'

// Next Imports
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

// MUI Imports
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Checkbox from '@mui/material/Checkbox'
import Button from '@mui/material/Button'
import FormControlLabel from '@mui/material/FormControlLabel'
import Divider from '@mui/material/Divider'

// Third-party Imports
import classnames from 'classnames'

// Type Imports
import type { Mode } from '@core/types'
import type { Locale } from '@configs/i18n'

// Component Imports
import Logo from '@components/layout/shared/Logo'

// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'
import { useSettings } from '@core/hooks/useSettings'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'
import { useAuthStore } from '@/stores/auth.store'

// API Imports
import { BusinessService } from '@/lib/api'
import type { RegisterBusinessRequest } from '@/lib/api'

const Register = ({ mode }: { mode: Mode }) => {
  // States
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [formData, setFormData] = useState({
    businessName: '',
    businessEmail: '',
    businessDescription: '',
    socialLinks: [{ platform: '', url: '' }],
    ownerName: '',
    ownerEmail: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({})
  const [success, setSuccess] = useState(false)

  // Vars
  const darkImg = '/images/pages/auth-v2-mask-2-dark.png'
  const lightImg = '/images/pages/auth-v2-mask-2-light.png'
  const darkIllustration = '/images/illustrations/auth/v2-register-dark.png'
  const lightIllustration = '/images/illustrations/auth/v2-register-light.png'
  const borderedDarkIllustration = '/images/illustrations/auth/v2-register-dark-border.png'
  const borderedLightIllustration = '/images/illustrations/auth/v2-register-light-border.png'

  // Hooks
  const { settings } = useSettings()
  const { lang: locale } = useParams()
  const router = useRouter()
  const authBackground = useImageVariant(mode, lightImg, darkImg)

  const characterIllustration = useImageVariant(
    mode,
    lightIllustration,
    darkIllustration,
    borderedLightIllustration,
    borderedDarkIllustration
  )

  const handleClickShowPassword = () => setIsPasswordShown(show => !show)
  const setUserType = useAuthStore(s => s.setUserType)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.businessName || !formData.ownerName || !formData.ownerEmail || !formData.password) {
      setError('Please fill in all required fields')
      return
    }

    setLoading(true)
    setError(null)
    setFieldErrors({})

    try {
      // Filter out empty social links
      const validSocialLinks = formData.socialLinks.filter(
        link => link.platform.trim() && link.url.trim()
      )

      const businessData: RegisterBusinessRequest = {
        name: formData.businessName,
        email: formData.businessEmail || undefined,
        description: formData.businessDescription || undefined,
        socialLinks: validSocialLinks.length > 0 ? validSocialLinks : undefined,
        owner: {
          name: formData.ownerName,
          email: formData.ownerEmail,
          password: formData.password
        }
      }

      const response = await BusinessService.registerBusiness(businessData)

      if (response.error) {
        throw new Error(response.error)
      }

      setSuccess(true)
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push(getLocalizedUrl('/login', locale as Locale))
      }, 2000)

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed'
      const errorMessageLower = errorMessage.toLowerCase()

      // Map API errors to field-specific errors
      if (errorMessageLower.includes('email already exists') ||
          errorMessageLower.includes('email already taken') ||
          errorMessageLower.includes('email is already in use') ||
          errorMessageLower.includes('user already exists')) {
        setFieldErrors({ ownerEmail: errorMessage })
      } else if (errorMessageLower.includes('invalid email') ||
                 errorMessageLower.includes('email format') ||
                 errorMessageLower.includes('please enter a valid email')) {
        setFieldErrors({ ownerEmail: errorMessage })
      } else if (errorMessageLower.includes('password')) {
        setFieldErrors({ password: errorMessage })
      } else if (errorMessageLower.includes('business name') ||
                 errorMessageLower.includes('name is required') ||
                 errorMessageLower.includes('business already exists')) {
        setFieldErrors({ businessName: errorMessage })
      } else {
        // General error for other cases
        setError(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='flex bs-full justify-center'>
      <div
        className={classnames(
          'flex bs-full items-center justify-center flex-1 min-bs-[100dvh] relative p-6 max-md:hidden',
          {
            'border-ie': settings.skin === 'bordered'
          }
        )}
      >
        <div className='pli-6 max-lg:mbs-40 lg:mbe-24'>
          <img
            src={characterIllustration}
            alt='character-illustration'
            className='max-bs-[650px] max-is-full bs-auto'
          />
        </div>
        <img src={authBackground} className='absolute bottom-[4%] z-[-1] is-full max-md:hidden' />
      </div>
      <div className='flex justify-center items-center bs-full bg-backgroundPaper !min-is-full p-6 md:!min-is-[unset] md:p-12 md:is-[480px]'>
        <Link
          href={getLocalizedUrl('/', locale as Locale)}
          className='absolute block-start-5 sm:block-start-[38px] inline-start-6 sm:inline-start-[38px]'
        >
          <Logo />
        </Link>

        <div className='flex flex-col gap-5 is-full sm:is-auto md:is-full sm:max-is-[400px] md:max-is-[unset] mbs-11 sm:mbs-14 md:mbs-0'>
          <div>
            <Typography variant='h4'>Register Your Business 🚀</Typography>
            <Typography className='mbs-1'>Create your business account to start managing bookings!</Typography>
          </div>

          {success ? (
            <div className='text-center py-8'>
              <Typography variant='h6' color='success.main' className='mb-2'>
                Registration Successful! ✅
              </Typography>
              <Typography>
                Your business has been registered and is pending approval. You'll be redirected to login...
              </Typography>
            </div>
          ) : (
            <form
              noValidate
              autoComplete='off'
              onSubmit={handleSubmit}
              className='flex flex-col gap-5'
            >
              <Typography variant='h6' color='primary'>Business Information</Typography>

              <TextField
                autoFocus
                fullWidth
                label='Business Name *'
                value={formData.businessName}
                onChange={e => {
                  setFormData(prev => ({ ...prev, businessName: e.target.value }))
                  if (fieldErrors.businessName) {
                    setFieldErrors(prev => ({ ...prev, businessName: '' }))
                  }
                }}
                required
                {...(fieldErrors.businessName && {
                  error: true,
                  helperText: fieldErrors.businessName
                })}
              />

              <TextField
                fullWidth
                label='Business Email'
                type='email'
                value={formData.businessEmail}
                onChange={e => setFormData(prev => ({ ...prev, businessEmail: e.target.value }))}
              />

              <TextField
                fullWidth
                label='Business Description'
                multiline
                rows={2}
                value={formData.businessDescription}
                onChange={e => setFormData(prev => ({ ...prev, businessDescription: e.target.value }))}
              />

              <div className='space-y-3'>
                <Typography variant='h6' color='primary'>Social Links</Typography>
                {formData.socialLinks.map((link, index) => (
                  <div key={index} className='flex gap-2 items-center'>
                    <TextField
                      label='Platform'
                      value={link.platform}
                      onChange={e => {
                        const newSocialLinks = [...formData.socialLinks]
                        newSocialLinks[index].platform = e.target.value
                        setFormData(prev => ({ ...prev, socialLinks: newSocialLinks }))
                      }}
                      className='flex-1'
                    />
                    <TextField
                      label='URL'
                      value={link.url}
                      onChange={e => {
                        const newSocialLinks = [...formData.socialLinks]
                        newSocialLinks[index].url = e.target.value
                        setFormData(prev => ({ ...prev, socialLinks: newSocialLinks }))
                      }}
                      className='flex-2'
                    />
                    <IconButton
                      onClick={() => {
                        const newSocialLinks = formData.socialLinks.filter((_, i) => i !== index)
                        setFormData(prev => ({ ...prev, socialLinks: newSocialLinks }))
                      }}
                      disabled={formData.socialLinks.length === 1}
                    >
                      <i className='ri-delete-bin-line' />
                    </IconButton>
                  </div>
                ))}
                <Button
                  variant='outlined'
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      socialLinks: [...prev.socialLinks, { platform: '', url: '' }]
                    }))
                  }}
                  className='w-full'
                >
                  Add Social Link
                </Button>
              </div>

              <Typography variant='h6' color='primary' className='mt-4'>Owner Information</Typography>

              <TextField
                fullWidth
                label='Owner Full Name *'
                value={formData.ownerName}
                onChange={e => setFormData(prev => ({ ...prev, ownerName: e.target.value }))}
                required
              />

              <TextField
                fullWidth
                label='Owner Email *'
                type='email'
                value={formData.ownerEmail}
                onChange={e => {
                  setFormData(prev => ({ ...prev, ownerEmail: e.target.value }))
                  if (fieldErrors.ownerEmail) {
                    setFieldErrors(prev => ({ ...prev, ownerEmail: '' }))
                  }
                }}
                required
                {...(fieldErrors.ownerEmail && {
                  error: true,
                  helperText: fieldErrors.ownerEmail
                })}
              />

              <TextField
                fullWidth
                label='Password *'
                type={isPasswordShown ? 'text' : 'password'}
                value={formData.password}
                onChange={e => {
                  setFormData(prev => ({ ...prev, password: e.target.value }))
                  if (fieldErrors.password) {
                    setFieldErrors(prev => ({ ...prev, password: '' }))
                  }
                }}
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton edge='end' onClick={handleClickShowPassword} onMouseDown={e => e.preventDefault()}>
                        <i className={isPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                {...(fieldErrors.password && {
                  error: true,
                  helperText: fieldErrors.password
                })}
              />

              {error && !Object.values(fieldErrors).some(err => err) && (
                <Typography color='error' variant='body2' className='text-center'>
                  {error}
                </Typography>
              )}

              <div className='flex justify-between items-center gap-3'>
                <FormControlLabel
                  control={<Checkbox required />}
                  label={
                    <>
                      <span>I agree to </span>
                      <Link className='text-primary' href='/' onClick={e => e.preventDefault()}>
                        privacy policy & terms
                      </Link>
                    </>
                  }
                />
              </div>

              <Button
                fullWidth
                variant='contained'
                type='submit'
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Registering...
                  </>
                ) : (
                  'Register Business'
                )}
              </Button>

              <div className='flex justify-center items-center flex-wrap gap-2'>
                <Typography>Already have an account?</Typography>
                <Typography component={Link} href='/login' color='primary'>
                  Sign in instead
                </Typography>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default Register
