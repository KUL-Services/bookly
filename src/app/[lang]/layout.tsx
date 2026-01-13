// Next Imports
import { headers } from 'next/headers'

// Third-party Imports
import 'react-perfect-scrollbar/dist/css/styles.css'

// Type Imports
import type { ChildrenType } from '@core/types'
import type { Locale } from '@configs/i18n'

// Component Imports

// HOC Imports
import TranslationWrapper from '@/hocs/TranslationWrapper'

// Config Imports
import { i18n } from '@configs/i18n'
import { helveticaWorld, firaCode } from '@/configs/fonts'

// Style Imports
import '@/app/globals.css'

// Generated Icon CSS Imports
import '@assets/iconify-icons/generated-icons.css'

export const metadata = {
  title: 'Zerv',
  description: 'Zerv Booking Platform'
}

const RootLayout = ({ children, params }: ChildrenType & { params: { lang: Locale } }) => {
  // Vars
  const headersList = headers()
  const direction = i18n.langDirection[params.lang]

  return (
    <TranslationWrapper headersList={headersList} lang={params.lang}>
      {/* Replaced html/body with divs to avoid invalid nesting since RootLayout already defines them */}
      <div
        id='lang-root'
        lang={params.lang}
        dir={direction}
        className={`contents ${helveticaWorld.variable} ${firaCode.variable}`}
      >
        <div className={`flex is-full min-bs-full flex-auto flex-col ${helveticaWorld.className}`}>{children}</div>
      </div>
    </TranslationWrapper>
  )
}

export default RootLayout
