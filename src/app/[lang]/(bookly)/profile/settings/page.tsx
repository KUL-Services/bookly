'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuthStore } from '@/stores/auth.store'
import { AuthService, MediaService } from '@/lib/api'
import type { UpdateUserRequest } from '@/lib/api'
import { H1, H2, P } from '@/bookly/components/atoms'
import { Card, CardContent, CardHeader, CardTitle } from '@/bookly/components/ui/card'
import { Input } from '@/bookly/components/ui/input'
import { Button } from '@/bookly/components/ui/button'
import { Alert, AlertDescription } from '@/bookly/components/ui/alert'
import { AlertCircle, CheckCircle, ArrowLeft, Save } from 'lucide-react'
import { ImageUpload } from '@/components/media/ImageUpload'
import initTranslations from '@/app/i18n/i18n'

export default function ProfileSettingsPage() {
  const router = useRouter()
  const params = useParams<{ lang: string }>()
  const booklyUser = useAuthStore(s => s.booklyUser)

  const [hydrated, setHydrated] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fetchingDetails, setFetchingDetails] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [t, setT] = useState<any>(() => (key: string) => key)

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    mobile: '',
    profilePhoto: null as string | null
  })

  const [userDetails, setUserDetails] = useState<any>(null)

  useEffect(() => setHydrated(true), [])

  useEffect(() => {
    const initializeTranslations = async () => {
      const { t: tFn } = await initTranslations((params?.lang || 'en') as 'en' | 'ar' | 'fr', ['common'])
      setT(() => tFn)
    }
    initializeTranslations()
  }, [params?.lang])

  const fetchUserDetails = async () => {
    try {
      setFetchingDetails(true)
      setError(null)

      // Ensure we have a token before making the API call
      const storedToken = AuthService.getStoredToken()
      if (!storedToken) {
        console.warn('No auth token found, skipping user details fetch')
        setFetchingDetails(false)
        return
      }

      // Ensure the API client has the token
      AuthService.initializeAuth()

      console.log('Fetching user details...')
      const response = await AuthService.getUserDetails()
      console.log('User details response:', response)

      if (response.error) {
        console.error('User details fetch error:', response.error)
        throw new Error(response.error)
      }

      const details = response.data
      if (!details) {
        throw new Error('No user details received from server')
      }

      console.log('User details:', details)
      setUserDetails(details)

      // Initialize form with fetched user data
      setFormData({
        firstName: details.firstName || '',
        lastName: details.lastName || '',
        mobile: details.mobile || '',
        profilePhoto: details.profilePhoto || null
      })
    } catch (err) {
      console.error('Failed to fetch user details:', err)
      setError(err instanceof Error ? err.message : 'Failed to load user details')
    } finally {
      setFetchingDetails(false)
    }
  }

  useEffect(() => {
    if (!hydrated) return
    if (!booklyUser) {
      router.replace(`/${params?.lang}/customer/login`)
      return
    }

    // Add a small delay to ensure store has fully rehydrated
    const timer = setTimeout(() => {
      fetchUserDetails()
    }, 100)

    return () => clearTimeout(timer)
  }, [hydrated, booklyUser, params?.lang, router])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError(null)
    setSuccess(null)
  }

  const handleProfilePhotoUploaded = (imageId: string) => {
    setFormData(prev => ({ ...prev, profilePhoto: imageId }))
  }

  const handleProfilePhotoDeleted = async () => {
    if (formData.profilePhoto) {
      try {
        await MediaService.deleteAsset(formData.profilePhoto)
        console.log('✅ Deleted profile photo:', formData.profilePhoto)
      } catch (error) {
        console.warn('Failed to delete profile photo:', error)
        // Don't block the UI, just log the warning
      }
    }
    setFormData(prev => ({ ...prev, profilePhoto: null }))
  }

  const validateForm = () => {
    const errors: string[] = []

    if (!formData.firstName.trim()) {
      errors.push('First name is required')
    } else if (formData.firstName.trim().length < 2) {
      errors.push('First name must be at least 2 characters')
    }

    if (!formData.lastName.trim()) {
      errors.push('Last name is required')
    } else if (formData.lastName.trim().length < 2) {
      errors.push('Last name must be at least 2 characters')
    }

    if (!formData.mobile.trim()) {
      errors.push('Mobile number is required')
    } else if (!/^\+[1-9]\d{1,14}$/.test(formData.mobile.trim())) {
      errors.push('Please enter a valid mobile number with country code (e.g., +1234567890)')
    }

    return errors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const validationErrors = validateForm()
    if (validationErrors.length > 0) {
      setError(validationErrors.join(', '))
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const updateData: UpdateUserRequest = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        mobile: formData.mobile.trim(),
        profilePhoto: formData.profilePhoto
      }

      console.log('Updating user profile with data:', updateData)
      console.log('Auth token before request:', localStorage.getItem('auth_token') ? 'Present' : 'Missing')

      const response = await AuthService.updateUser(updateData)
      console.log('Update response:', response)
      console.log('Auth token after request:', localStorage.getItem('auth_token') ? 'Present' : 'Missing')

      if (response.error) {
        console.error('Profile update error:', response.error)
        throw new Error(response.error)
      }

      setSuccess('Profile updated successfully!')

      // Refresh user details after successful update
      try {
        await fetchUserDetails()
      } catch (refreshError) {
        console.warn('Failed to refresh user details after update:', refreshError)
      }
    } catch (err) {
      console.error('Update failed:', err)
      setError(err instanceof Error ? err.message : 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const goBack = () => router.push(`/${params?.lang}/profile`)

  if (!hydrated || !booklyUser || fetchingDetails) {
    return (
      <div className='min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center font-sans'>
        <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-primary-800'></div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900 relative overflow-hidden font-sans'>
      <main className='container mx-auto px-4 sm:px-6 py-6 sm:py-8 relative z-10'>
        <div className='w-full max-w-2xl mx-auto'>
          {/* Header */}
          <div className='flex items-center gap-4 mb-6 animate-in fade-in slide-in-from-top-4 duration-700'>
            <button
              onClick={goBack}
              className='inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100/80 dark:hover:bg-gray-700/80 text-gray-600 dark:text-gray-300 transition-all duration-200 hover:scale-105 active:scale-95'
            >
              <ArrowLeft className='w-5 h-5' />
            </button>
            <div>
              <H1
                className='text-2xl sm:text-3xl font-bold text-primary-800 dark:text-white'
                stringProps={{ localeKey: 'profile.settings.title' }}
              />

              <P
                className='text-gray-600 dark:text-gray-300 text-sm sm:text-base'
                stringProps={{
                  localeKey: 'profile.settings.description'
                }}
              />
            </div>
          </div>

          {/* Form container */}
          <Card className='bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-xl border border-primary-100/50 dark:border-gray-700/50 animate-in fade-in slide-in-from-bottom-6 duration-700 animation-delay-300'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Save className='w-5 h-5 text-primary-800 dark:text-sage-400' />
                {t('profile.settings.personalInfo') || 'Personal Information'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant='destructive' className='mb-6'>
                  <AlertCircle className='h-4 w-4' />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert variant='success' className='mb-6'>
                  <CheckCircle className='h-4 w-4' />
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className='space-y-6'>
                {/* Profile Photo */}
                <div className='flex flex-col items-center gap-4'>
                  <H2
                    className='text-lg font-semibold text-gray-900 dark:text-white'
                    stringProps={{ localeKey: 'profile.settings.profilePhoto' }}
                  />
                  <ImageUpload
                    currentImageUrl={formData.profilePhoto ? userDetails?.profilePhotoUrl : null}
                    onImageUploaded={handleProfilePhotoUploaded}
                    onImageDeleted={handleProfilePhotoDeleted}
                    label='Upload Profile Photo'
                    description='Click to upload your profile picture'
                    maxSizeMB={3}
                    width={120}
                    height={120}
                  />
                </div>

                {/* Name Fields */}
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <label className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                      {t('profile.settings.firstName') || 'First Name'}
                    </label>
                    <Input
                      value={formData.firstName}
                      onChange={e => handleInputChange('firstName', e.target.value)}
                      placeholder='Enter your first name'
                      disabled={loading}
                      required
                    />
                  </div>
                  <div className='space-y-2'>
                    <label className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                      {t('profile.settings.lastName') || 'Last Name'}
                    </label>
                    <Input
                      value={formData.lastName}
                      onChange={e => handleInputChange('lastName', e.target.value)}
                      placeholder='Enter your last name'
                      disabled={loading}
                      required
                    />
                  </div>
                </div>

                {/* Mobile Number */}
                <div className='space-y-2'>
                  <label className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                    {t('profile.settings.mobile') || 'Mobile Number'}
                  </label>
                  <Input
                    value={formData.mobile}
                    onChange={e => handleInputChange('mobile', e.target.value)}
                    placeholder='e.g., +1234567890'
                    disabled={loading}
                    required
                  />
                </div>

                {/* Email (read-only) */}
                <div className='space-y-2'>
                  <label className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                    {t('profile.settings.email') || 'Email Address'}
                  </label>
                  <Input
                    value={booklyUser.email}
                    disabled
                    className='bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                  />
                  <P
                    className='text-xs text-gray-500 dark:text-gray-400'
                    stringProps={{ localeKey: 'profile.settings.emailNote' }}
                  />
                </div>

                {/* Submit Button */}
                <div className='flex gap-3 pt-4'>
                  <Button type='button' variant='outline' onClick={goBack} disabled={loading} className='flex-1'>
                    {t('common.cancel') || 'Cancel'}
                  </Button>
                  <Button
                    type='submit'
                    disabled={loading}
                    className='flex-1 bg-primary-700 hover:bg-primary-800 text-white'
                  >
                    {loading ? (
                      <>
                        <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                        {t('common.saving') || 'Saving...'}
                      </>
                    ) : (
                      t('common.save') || 'Save Changes'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
