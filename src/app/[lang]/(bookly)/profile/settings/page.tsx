'use client'

import { useEffect, useState } from 'react'

import { useParams, useRouter } from 'next/navigation'

import { AlertCircle, ArrowLeft, CheckCircle, Save, X } from 'lucide-react'

import { H1, P } from '@/bookly/components/atoms'
import { BrandedSpinner } from '@/bookly/components/atoms/branded-spinner'
import { Alert, AlertDescription } from '@/bookly/components/ui/alert'
import { Button } from '@/bookly/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/bookly/components/ui/card'
import { Input } from '@/bookly/components/ui/input'
import initTranslations from '@/app/i18n/i18n'
import { PageLoader } from '@/components/LoadingStates'
import { ImageUpload } from '@/components/media/ImageUpload'
import { MOCK_USER } from '@/mocks/user'
import { useAuthStore } from '@/stores/auth.store'
import { MediaService } from '@/lib/api'

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
      await new Promise(resolve => setTimeout(resolve, 600))

      const details = MOCK_USER

      setUserDetails(details)
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
      } catch (deleteError) {
        console.warn('Failed to delete profile photo:', deleteError)
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
      await new Promise(resolve => setTimeout(resolve, 800))
      setSuccess('Profile updated successfully!')
      await fetchUserDetails()
    } catch (submitError) {
      console.error('Update failed:', submitError)
      setError('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const goBack = () => router.push(`/${params?.lang}/profile`)

  if (!hydrated || !booklyUser || fetchingDetails) {
    return (
      <div className='min-h-screen bg-[#f7f8f9] dark:bg-[#0a2c24]'>
        <PageLoader />
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-[#f7f8f9] dark:bg-[#0a2c24] relative overflow-hidden font-sans'>
      <div className='pointer-events-none absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-[#0a2c24]/8 to-transparent dark:from-[#77b6a3]/10' />

      <main className='relative z-10 mx-auto w-full max-w-2xl px-0 sm:px-6 pt-0 sm:pt-8 pb-[calc(var(--mobile-bottom-nav-offset)+94px)] lg:pb-10'>
        {/* Mobile Header - Simplified */}
        <div className='lg:hidden sticky top-0 z-30 bg-[#f7f8f9]/90 dark:bg-[#0a2c24]/90 backdrop-blur-md px-4 py-3 border-b border-gray-200/50 dark:border-white/5'>
          <div className='flex items-center gap-3'>
            <button
              onClick={goBack}
              className='inline-flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-white/10 text-[#0a2c24] dark:text-white shadow-sm active:scale-95 transition-transform touch-manipulation border border-gray-100 dark:border-white/5'
            >
              <ArrowLeft className='w-5 h-5' />
            </button>
            <div className='min-w-0 flex-1'>
              <H1
                className='text-lg font-bold text-[#0a2c24] dark:text-white tracking-tight truncate'
                stringProps={{ localeKey: 'profile.settings.title' }}
              />
            </div>
          </div>
        </div>

        <div className='hidden lg:flex items-center gap-4 mb-8 animate-in fade-in slide-in-from-top-4 duration-700'>
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
              stringProps={{ localeKey: 'profile.settings.description' }}
            />
          </div>
        </div>

        <Card className='bg-transparent dark:bg-transparent lg:bg-white/95 lg:dark:bg-[#202c39]/95 lg:backdrop-blur-md shadow-none lg:shadow-[0_20px_50px_rgba(0,0,0,0.06)] border-none rounded-none lg:rounded-[2.5rem] animate-in fade-in slide-in-from-bottom-6 duration-700 animation-delay-300'>
          <CardHeader className='hidden lg:block pb-2 px-4 lg:px-6 pt-4 lg:pt-6'>
            <CardTitle className='flex items-center gap-2 text-base lg:text-lg'>
              <Save className='w-5 h-5 text-[#0a2c24] dark:text-[#77b6a3]' />
              {t('profile.settings.personalInfo') || 'Personal Information'}
            </CardTitle>
          </CardHeader>

          <CardContent className='px-4 lg:px-6 pb-5 lg:pb-6 pt-4 lg:pt-0'>
            {error && (
              <Alert variant='destructive' className='mb-6 rounded-2xl'>
                <AlertCircle className='h-4 w-4' />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert variant='success' className='mb-6 rounded-2xl'>
                <CheckCircle className='h-4 w-4' />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <form id='profile-settings-form' onSubmit={handleSubmit} className='space-y-6 lg:space-y-6'>
              <div className='rounded-3xl border border-[#0a2c24]/5 dark:border-white/5 bg-white dark:bg-[#202c39] p-6 shadow-sm'>
                <div className='flex flex-col items-center gap-6'>
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
                  <div className='text-center'>
                    <h3 className='font-semibold text-gray-900 dark:text-white'>
                      {t('profile.settings.profilePhoto')}
                    </h3>
                    <p className='text-xs text-gray-500 mt-1'>Type: JPG, PNG • Max: 3MB</p>
                  </div>
                </div>
              </div>

              <div className='rounded-2xl border border-[#0a2c24]/10 dark:border-white/10 bg-white dark:bg-[#202c39]/80 p-4 lg:p-5 space-y-4'>
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
                      className='h-11 rounded-xl'
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
                      className='h-11 rounded-xl'
                    />
                  </div>
                </div>

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
                    className='h-11 rounded-xl'
                  />
                </div>

                <div className='space-y-2'>
                  <label className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                    {t('profile.settings.email') || 'Email Address'}
                  </label>
                  <Input
                    value={booklyUser?.email || ''}
                    disabled
                    className='h-11 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                  />
                  <P
                    className='text-xs text-gray-500 dark:text-gray-400'
                    stringProps={{ localeKey: 'profile.settings.emailNote' }}
                  />
                </div>
              </div>

              <div className='hidden lg:flex gap-3 pt-4'>
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
                      <BrandedSpinner size={16} color='inherit' sx={{ mr: 1 }} />
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
      </main>

      <div className='lg:hidden fixed inset-x-0 bottom-[calc(var(--mobile-bottom-nav-offset)+8px)] z-40 px-3'>
        <div className='mx-auto max-w-2xl rounded-2xl border border-[#0a2c24]/10 dark:border-white/15 bg-white/95 dark:bg-[#202c39]/95 backdrop-blur-xl shadow-[0_12px_28px_rgba(10,44,36,0.18)] dark:shadow-[0_12px_28px_rgba(0,0,0,0.35)] p-2.5'>
          <div className='grid grid-cols-2 gap-2'>
            <Button
              type='button'
              variant='outline'
              onClick={goBack}
              disabled={loading}
              className='h-11 rounded-xl border-[#0a2c24]/20 dark:border-white/20 inline-flex items-center justify-center gap-1.5'
            >
              <X className='h-4 w-4' />
              {t('common.cancel') || 'Cancel'}
            </Button>
            <Button
              type='submit'
              form='profile-settings-form'
              disabled={loading}
              className='h-11 rounded-xl bg-[#0a2c24] hover:bg-[#0a2c24]/90 dark:bg-[#77b6a3] dark:hover:bg-[#77b6a3]/90 text-white dark:text-[#0a2c24]'
            >
              {loading ? (
                <>
                  <BrandedSpinner size={14} color='inherit' sx={{ mr: 1 }} />
                  {t('common.saving') || 'Saving...'}
                </>
              ) : (
                <>
                  <Save className='h-4 w-4 mr-1' />
                  {t('common.save') || 'Save Changes'}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
