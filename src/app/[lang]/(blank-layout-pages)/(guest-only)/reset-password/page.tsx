// Next Imports
import type { Metadata } from 'next'

// Component Imports
import ResetPasswordV2 from '@views/pages/auth/ResetPasswordV2'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

export const metadata: Metadata = {
  title: 'Reset Password',
  description: 'Reset your account password'
}

const ResetPasswordPage = () => {
  // Vars
  const mode = getServerMode()

  return <ResetPasswordV2 mode={mode} />
}

export default ResetPasswordPage