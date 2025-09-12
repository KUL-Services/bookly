'use client'
import { Button } from '@/bookly/components/molecules'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function AuthLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const router = useRouter()
  return (
    <div className='min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-950 dark:to-secondary-950'>
      <header className='  bg-white relative shadow-md '>
        <div className='container mx-auto  flex items-center justify-between px-6 py-6'>
          <div className='text-2xl font-bold text-teal-500'>Bookly</div>

          <div className='hidden md:flex items-center space-x-4'>
            <Button
              variant='outlined'
              className='bg-transparent border-e'
              size='md'
              buttonText={{ plainText: 'Sign In' }}
              onClick={() => router.push('/en/customer/login')}
            />
            <Button
              variant='contained'
              size='md'
              buttonText={{ plainText: 'Sign Up' }}
              onClick={() => router.push('/en/customer/register')}
            />
          </div>
          <Button
            className='md:hidden '
            aria-label='Toggle menu'
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            prefixIcon={isMobileMenuOpen ? { icon: 'lucide:x' } : { icon: 'lucide:menu' }}
          />

          {isMobileMenuOpen && (
            <div className='absolute top-full left-0 right-0 bg-white shadow-lg border-t md:hidden z-50 '>
              <nav className='flex flex-col items-center p-4 space-y-4  '>
                <div className=' w-full flex items-start space-x-3 pt-4 border-t border-gray-200 '>
                  <Button variant='outlined' size='md' buttonText={{ plainText: 'Sign In' }} />
                  <Button variant='contained' size='md' buttonText={{ plainText: 'Sign Up' }} />
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>
      {children}
    </div>
  )
}
