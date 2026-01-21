import React from 'react'
import AvatarProps from './avatar.props'
import KulIcon from '@/bookly/components/atoms/kul-icon/kul-icon.component'
import { BaseImage, H6 } from '@/bookly/components/atoms'
import { getInitials } from '@/bookly/utils'
import getAvatarSize from './avatar-size.util'
import clsx from 'clsx'

const Avatar = ({ avatarTitle, iconProps, imageUrl, size, testId, alt, className }: AvatarProps) => {
  const avatarSize = getAvatarSize(size)
  const [imgError, setImgError] = React.useState(false)

  if (imageUrl && !imgError)
    return (
      <div
        className={clsx(
          'border-2 rounded-full items-center content-center text-center mb-2 overflow-clip object-cover relative',
          avatarSize,
          className
        )}
      >
        <BaseImage
          src={imageUrl}
          alt={alt || ''}
          unoptimized={imageUrl.includes('.svg')}
          onError={() => setImgError(true)}
        />
      </div>
    )
  if (iconProps)
    return (
      <div
        className={clsx(
          'border-2 rounded-full items-center content-center text-center mb-2 overflow-clip object-cover relative',
          avatarSize,
          className
        )}
      >
        <KulIcon {...iconProps}></KulIcon>
      </div>
    )
  if (avatarTitle) {
    const initials = getInitials(avatarTitle)
    return (
      <div
        className={clsx(
          'border-2 rounded-full items-center content-center text-center mb-2 overflow-clip object-cover relative',
          avatarSize,
          className
        )}
      >
        <H6 stringProps={{ plainText: initials }}></H6>
      </div>
    )
  }
}

export default Avatar
