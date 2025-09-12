import { ProfileHeader } from '@/bookly/components/molecules/profile-header/profileHeader'
import ProfileInfo from '@/bookly/components/molecules/profile-info/ProfileInfo'

function ProfilePage() {
  return (
    <div className='min-h-screen bg-gray-50'>
      <ProfileHeader />
      <div className='max-w-4xl mx-auto px-4 py-8 space-y-8'>
        <ProfileInfo />
        BookingsTabs
      </div>
    </div>
  )
}

export default ProfilePage
