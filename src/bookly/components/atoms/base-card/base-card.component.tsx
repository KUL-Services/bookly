import { cn } from '@/bookly/lib/utils'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/bookly/components/ui/card'
import { H2, P as Description, H3 } from '../base-text/base-text.component'
import { StringProps } from '@/bookly/types'
import { i18n } from 'i18next'
import BaseImage from '../base-image/base-image.component'

interface BaseCardProps {
  className?: string
  titleProps?: StringProps
  descriptionProps?: StringProps
  contentClassName?: string
  footerClassName?: string
  headerClassName?: string
  children?: React.ReactNode
  footerContent?: React.ReactNode
  imageSrc?: string
  imageAlt?: string
  customImageComponent?: React.ReactNode
  i18nTFn?: i18n['t']
}

export const BaseCard = ({
  className,
  titleProps,
  descriptionProps,
  contentClassName,
  footerClassName,
  headerClassName,
  children,
  footerContent,
  imageSrc,
  imageAlt,
  customImageComponent,
  i18nTFn
}: BaseCardProps) => {
  return (
    <Card className={cn('w-full rounded-2xl border-none shadow-sm', className)}>
      {(customImageComponent || imageSrc) && (
        <div className='relative w-full h-48 object-cover'>
          {customImageComponent || <BaseImage src={imageSrc!} alt={imageAlt || ''} className='rounded-t-lg' />}
        </div>
      )}
      {(titleProps || descriptionProps) && (
        <CardHeader className={headerClassName}>
          {titleProps && (
            <CardTitle>
              <H3 stringProps={titleProps} i18nTFn={i18nTFn} className='font-bold text-gray-900 dark:text-white mb-2' />
            </CardTitle>
          )}
          {descriptionProps && (
            <CardDescription>
              <Description stringProps={descriptionProps} i18nTFn={i18nTFn} />
            </CardDescription>
          )}
        </CardHeader>
      )}
      {children && <CardContent className={contentClassName}>{children}</CardContent>}
      {footerContent && <CardFooter className={footerClassName}>{footerContent}</CardFooter>}
    </Card>
  )
}
