'use client'

// React Imports
import { useEffect, useRef, useContext } from 'react'
import type { CSSProperties } from 'react'

// Third-party Imports
import styled from '@emotion/styled'

// Context Imports
import VerticalNavContext from '@menu/contexts/verticalNavContext'
import type { VerticalNavContextProps } from '@menu/contexts/verticalNavContext'

// Config Imports
import themeConfig from '@configs/themeConfig'

// Hook Imports
import { useSettings } from '@core/hooks/useSettings'

// Assets
import GreenWordLogo from '@assets/logos/words/Green_Word.png'
import WhiteWordLogo from '@assets/logos/words/White_Word.png'
import GreenIconLogo from '@assets/logos/icons/Green_Icon.png'
import WhiteIconLogo from '@assets/logos/icons/White_Icon.png'

type LogoTextProps = {
  isHovered?: VerticalNavContextProps['isHovered']
  isCollapsed?: VerticalNavContextProps['isCollapsed']
  transitionDuration?: VerticalNavContextProps['transitionDuration']
  isBreakpointReached?: VerticalNavContextProps['isBreakpointReached']
  color?: CSSProperties['color']
}

const LogoText = styled.span<LogoTextProps>`
  font-size: 1.25rem;
  line-height: 1.2;
  font-weight: 600;
  letter-spacing: 0.15px;
  text-transform: capitalize;
  color: var(--mui-palette-text-primary);
  color: ${({ color }) => color ?? 'var(--mui-palette-text-primary)'};
  transition: ${({ transitionDuration }) =>
    `margin-inline-start ${transitionDuration}ms ease-in-out, opacity ${transitionDuration}ms ease-in-out`};

  ${({ isHovered, isCollapsed, isBreakpointReached }) =>
    !isBreakpointReached && isCollapsed && !isHovered
      ? 'opacity: 0; margin-inline-start: 0;'
      : 'opacity: 1; margin-inline-start: 8px;'}
`

const Logo = ({ color, forceIcon = false }: { color?: CSSProperties['color']; forceIcon?: boolean }) => {
  // Refs
  const logoTextRef = useRef<HTMLSpanElement>(null)

  // Hooks
  // Safely get context, defaulting to empty object if provider is missing
  const context = useContext(VerticalNavContext) || {}
  const { isHovered, transitionDuration, isBreakpointReached } = context

  const { settings } = useSettings()

  // Vars
  const { layout } = settings

  // Logic to determine if we should show the full logo or just the icon
  // If forceIcon is true, always show icon.
  // Else if layout is collapsed and not hovered, show icon. Otherwise show word.

  // Default to false (expanded) if context values are missing
  const isCollapsedState = forceIcon || (!isBreakpointReached && layout === 'collapsed' && !isHovered)

  useEffect(() => {
    if (layout !== 'collapsed') {
      return
    }

    if (logoTextRef && logoTextRef.current) {
      if (!isBreakpointReached && layout === 'collapsed' && !isHovered) {
        logoTextRef.current?.classList.add('hidden')
      } else {
        logoTextRef.current.classList.remove('hidden')
      }
    }
  }, [isHovered, layout, isBreakpointReached])

  return (
    <div className='flex items-center min-bs-[24px] relative'>
      {/* 
        We render both sets of images and toggle visibility via CSS classes for light/dark mode.
        If isCollapsedState is true, we show Icons. Else we show Words.
      */}

      {/* EXPANDED STATE (WORD LOGO) */}
      <div className={`flex items-center ${isCollapsedState ? 'hidden' : 'block'}`}>
        {/* Light Mode: Green Icon (Expanded) */}
        <div className='dark:hidden block relative w-[50px] h-[50px]'>
          <img
            src={GreenIconLogo.src}
            alt={themeConfig.templateName}
            className='object-contain object-left w-full h-full'
          />
        </div>
        {/* Dark Mode: White Icon (Expanded) */}
        <div className='hidden dark:block relative w-[50px] h-[50px]'>
          <img
            src={WhiteIconLogo.src}
            alt={themeConfig.templateName}
            className='object-contain object-left w-full h-full'
          />
        </div>
      </div>

      {/* COLLAPSED STATE (ICON LOGO) */}
      <div className={`flex items-center ${isCollapsedState ? 'block' : 'hidden'}`}>
        {/* Light Mode: Green Icon */}
        <div className='dark:hidden block relative w-[32px] h-[32px]'>
          <img src={GreenIconLogo.src} alt={themeConfig.templateName} className='object-contain w-full h-full' />
        </div>
        {/* Dark Mode: White Icon */}
        <div className='hidden dark:block relative w-[32px] h-[32px]'>
          <img src={WhiteIconLogo.src} alt={themeConfig.templateName} className='object-contain w-full h-full' />
        </div>
      </div>
    </div>
  )
}

export default Logo
