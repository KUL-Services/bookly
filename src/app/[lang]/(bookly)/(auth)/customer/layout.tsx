'use client'
import { Button } from '@/bookly/components/molecules'
import { useRouter, useParams } from 'next/navigation'
import { useState } from 'react'

export default function AuthLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const router = useRouter()
  const params = useParams<{ lang: string }>()
  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900 font-sans'>
      {/* <header className='  bg-white relative shadow-md '> */}
      {children}
    </div>
  )
}
