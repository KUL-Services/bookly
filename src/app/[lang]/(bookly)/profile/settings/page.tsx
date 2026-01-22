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
import { MOCK_USER } from '@/mocks/user'

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
      // Simulate API delay for realistic feel
      await new Promise(resolve => setTimeout(resolve, 600))

      const details = MOCK_USER
      console.log('Using mock user details:', details)
      setUserDetails(details)

      // Initialize form with fetched user data
      setFormData({
        firstName: details.firstName || '',
        lastName: details.lastName || '',
        mobile: details.mobile || '',
        profilePhoto: details.profilePhotoUrl || null
      })
    } catch (err) {
      console.error('Failed to load user details:', err)
      setError('Failed to load user details')
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
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800))

      console.log('Simulating successful profile update for:', formData)

      setSuccess('Profile updated successfully!')

      // Refresh user details (re-fetch mock data)
      await fetchUserDetails()
    } catch (err) {
      console.error('Update failed:', err)
      setError('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const goBack = () => router.push(`/${params?.lang}/profile`)

  if (!hydrated || !booklyUser || fetchingDetails) {
    return (
      <div className='min-h-screen bg-[#f7f8f9] dark:bg-[#0a2c24] flex items-center justify-center font-sans'>
        <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-[#0a2c24] dark:border-[#77b6a3]'></div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-[#f7f8f9] dark:bg-[#0a2c24] relative overflow-hidden font-sans'>
      <main className='container mx-auto px-4 sm:px-6 py-6 sm:py-8 relative z-10'>
        <div className='w-full max-w-2xl mx-auto'>
          {/* Header */}
          <div className='flex items-center gap-4 mb-8 animate-in fade-in slide-in-from-top-4 duration-700'>
            <button
              onClick={goBack}
              className='inline-flex items-center justify-center w-12 h-12 rounded-full bg-white dark:bg-[#202c39] shadow-md hover:shadow-lg text-gray-600 dark:text-gray-300 transition-all duration-200 hover:scale-105 active:scale-95 border border-gray-100 dark:border-gray-800'
            >
              <ArrowLeft className='w-5 h-5' />
            </button>
            <div>
              <H1
                className='text-2xl sm:text-3xl font-bold text-[#0a2c24] dark:text-white tracking-tight'
                stringProps={{ localeKey: 'profile.settings.title' }}
              />

              <P
                className='text-gray-600 dark:text-gray-300 text-sm sm:text-base mt-1'
                stringProps={{
                  localeKey: 'profile.settings.description'
                }}
              />
            </div>
          </div>

          {/* Form container */}
          <Card className='bg-white/95 dark:bg-[#202c39]/95 backdrop-blur-md shadow-[0_20px_50px_rgba(0,0,0,0.06)] border-none rounded-[2.5rem] animate-in fade-in slide-in-from-bottom-6 duration-700 animation-delay-300'>
            <CardHeader className='pb-2'>
              <CardTitle className='flex items-center gap-2'>
                <Save className='w-5 h-5 text-[#0a2c24] dark:text-[#77b6a3]' />
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
                    className='flex-1 bg-[#0a2c24] hover:bg-[#0a2c24]/90 dark:bg-[#77b6a3] dark:hover:bg-[#77b6a3]/90 text-white dark:text-[#0a2c24]'
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
