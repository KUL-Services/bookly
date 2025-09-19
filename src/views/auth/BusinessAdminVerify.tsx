'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

// MUI Imports
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'

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
import { AuthService } from '@/lib/api'

const BusinessAdminVerify = ({ mode }: { mode: Mode }) => {
  // States
  const [formData, setFormData] = useState({
    email: '',
    code: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Vars
  const darkImg = '/images/pages/auth-v2-mask-1-dark.png'
  const lightImg = '/images/pages/auth-v2-mask-1-light.png'
  const darkIllustration = '/images/illustrations/auth/v2-verify-email-dark.png'
  const lightIllustration = '/images/illustrations/auth/v2-verify-email-light.png'
  const borderedDarkIllustration = '/images/illustrations/auth/v2-verify-email-dark-border.png'
  const borderedLightIllustration = '/images/illustrations/auth/v2-verify-email-light-border.png'

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.email || !formData.code) {
      setError('Please fill in all fields')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await AuthService.verifyAdmin({
        email: formData.email,
        code: formData.code
      })

      if (response.error) {
        throw new Error(response.error)
      }

      setSuccess(true)
      // Redirect to login after successful verification
      setTimeout(() => {
        router.push(getLocalizedUrl('/login', locale as Locale))
      }, 2000)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed')
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
            <Typography variant='h4'>Verify Your Business Email 📧</Typography>
            <Typography className='mbs-1'>
              We sent a verification code to your email address. Please enter it below to activate your business account.
            </Typography>
          </div>

          {success ? (
            <div className='text-center py-8'>
              <Typography variant='h6' color='success.main' className='mb-2'>
                Email Verified Successfully! ✅
              </Typography>
              <Typography>
                Your business account has been verified. You'll be redirected to login...
              </Typography>
            </div>
          ) : (
            <form noValidate autoComplete='off' onSubmit={handleSubmit} className='flex flex-col gap-5'>
              <TextField
                autoFocus
                fullWidth
                label='Business Email'
                type='email'
                value={formData.email}
                onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
              />

              <TextField
                fullWidth
                label='Verification Code'
                value={formData.code}
                onChange={e => setFormData(prev => ({ ...prev, code: e.target.value }))}
                required
                placeholder='Enter the 6-digit code'
              />

              {error && (
                <Alert severity='error'>
                  {error}
                </Alert>
              )}

              <Button fullWidth variant='contained' type='submit' disabled={loading}>
                {loading ? 'Verifying...' : 'Verify Email'}
              </Button>

              <div className='flex justify-center items-center flex-wrap gap-2'>
                <Typography>Didn't receive the code?</Typography>
                <Typography component='button' color='primary' onClick={() => {
                  // Resend verification code logic would go here
                  console.log('Resend verification code')
                }}>
                  Resend Code
                </Typography>
              </div>

              <div className='flex justify-center items-center flex-wrap gap-2'>
                <Typography>Back to</Typography>
                <Typography component={Link} href='/login' color='primary'>
                  Business Login
                </Typography>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default BusinessAdminVerify