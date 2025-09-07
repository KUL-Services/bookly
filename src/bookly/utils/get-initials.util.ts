const getInitials = (name: string | undefined, initialsType: 'Single' | 'Double' = 'Double') => {
  if (!name) {
    return ''
  }
  const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/
  const isArabic = arabicRegex.test(name)

  //   IF SINGLE, RETURN ONLY FIRST LETTER (uppercase if English, normal if Arabic)
  if (initialsType === 'Single') return isArabic ? name[0] : name[0].toUpperCase()
  //   IF SINGLE, RETURN ONLY FIRST LETTER (uppercase if English, normal if Arabic)

  const splitName = name?.split(' ')
  let initials = splitName[0][0]
  if (splitName.length > 1) {
    if (isArabic) {
      initials += ' '
    }
    initials += splitName[splitName.length - 1][0]
  }

  if (!isArabic) {
    initials = initials.toUpperCase()
  }

  return initials
}

export default getInitials
