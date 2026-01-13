'use client'

import { useRef, useState } from 'react'
import { useParams, usePathname, useRouter } from 'next/navigation'
import { Languages, ChevronDown } from 'lucide-react'

type LanguageDataType = {
  langCode: string
  langName: string
  flag: string
}

const getLocalePath = (pathName: string, locale: string) => {
  if (!pathName) return '/'
  const segments = pathName.split('/')
  segments[1] = locale
  return segments.join('/')
}

const languageData: LanguageDataType[] = [
  {
    langCode: 'en',
    langName: 'English',
    flag: '🇺🇸'
  },
  {
    langCode: 'fr',
    langName: 'French',
    flag: '🇫🇷'
  },
  {
    langCode: 'ar',
    langName: 'العربية',
    flag: '🇸🇦'
  }
]

const BooklyLanguageDropdown = () => {
  const [open, setOpen] = useState(false)
  const anchorRef = useRef<HTMLButtonElement>(null)

  const router = useRouter()
  const pathName = usePathname()
  const { lang } = useParams()

  const currentLanguage = languageData.find(l => l.langCode === lang) || languageData[0]

  const handleClose = () => {
    setOpen(false)
  }

  const handleLanguageChange = (locale: string) => {
    const newPath = getLocalePath(pathName, locale)
    router.push(newPath)
    handleClose()
  }

  const handleToggle = () => {
    setOpen(prevOpen => !prevOpen)
  }

  return (
    <div className='relative'>
      <button
        ref={anchorRef}
        onClick={handleToggle}
        className='flex items-center gap-2 px-3 py-2.5 h-10 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300 transition-all duration-200 touch-manipulation'
        aria-label='Change language'
      >
        <span className='text-lg'>{currentLanguage.flag}</span>
        <span className='hidden sm:block text-sm font-medium'>{currentLanguage.langName}</span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div className='fixed inset-0 z-40' onClick={handleClose} />

          {/* Dropdown */}
          <div className='absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-200 dark:border-slate-600 p-1 z-50 animate-in slide-in-from-top-2 duration-200'>
            {languageData.map(language => (
              <button
                key={language.langCode}
                onClick={() => handleLanguageChange(language.langCode)}
                className={`flex items-center gap-3 w-full px-3 py-2.5 text-left transition-all duration-200 touch-manipulation rounded-lg ${
                  lang === language.langCode
                    ? 'bg-primary-700 text-white shadow-md font-semibold'
                    : 'bg-transparent text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <span className='text-lg'>{language.flag}</span>
                <span className='text-sm font-medium'>{language.langName}</span>
                {lang === language.langCode && <div className='ml-auto w-1.5 h-1.5 bg-white rounded-full'></div>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default BooklyLanguageDropdown
