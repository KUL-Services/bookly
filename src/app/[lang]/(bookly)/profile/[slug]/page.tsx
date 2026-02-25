'use client'

import { useRouter, useParams } from 'next/navigation'
import {
  Settings,
  Star,
  LogOut,
  ChevronRight,
  Bell,
  CreditCard,
  HelpCircle,
  Shield,
  Heart,
  Calendar,
  Edit3,
  Mail,
  Phone,
  MapPin
} from 'lucide-react'
import { useAuthStore } from '@/stores/auth.store'

// Menu items
const menuItems = [
  {
    id: 'account',
    label: 'Account & Settings',
    icon: Settings,
    href: '/profile/settings'
  },
  {
    id: 'reviews',
    label: 'Reviews',
    icon: Star,
    href: '/profile/reviews',
    badge: '3'
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: Bell,
    href: '/profile/notifications'
  },
  {
    id: 'payment',
    label: 'Payment Methods',
    icon: CreditCard,
    href: '/profile/payment'
  },
  {
    id: 'privacy',
    label: 'Privacy & Security',
    icon: Shield,
    href: '/profile/privacy'
  },
  {
    id: 'help',
    label: 'Help & Support',
    icon: HelpCircle,
    href: '/profile/help'
  }
]

function ProfilePage() {
  const router = useRouter()
  const params = useParams<{ lang: string }>()
  const lang = params?.lang || 'en'
  const booklyUser = useAuthStore(s => s.booklyUser)
  const logoutCustomer = useAuthStore(s => s.logoutCustomer)

  const userData = {
    name: booklyUser?.name || 'Customer',
    email: booklyUser?.email || 'no-email@example.com',
    phone: booklyUser?.phone || '+20 000 000 0000',
    avatar: booklyUser?.avatar || '/images/avatars/1.png',
    memberSince: 'June 2023',
    stats: {
      totalBookings: 0,
      favourites: 0,
      avgRating: 0
    }
  }

  const handleLogout = () => {
    logoutCustomer()
    router.push(`/${lang}/landpage`)
  }

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-[#0f1f1b] pb-24'>
      {/* Header */}
      <div className='bg-white dark:bg-[#1a2e35] border-b border-gray-100 dark:border-white/10'>
        <div className='max-w-4xl mx-auto px-4 py-4'>
          <h1 className='text-xl font-bold text-gray-900 dark:text-white'>Profile</h1>
        </div>
      </div>

      <div className='max-w-4xl mx-auto px-4 py-6 space-y-6'>
        {/* Profile Card */}
        <div className='bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 p-6'>
          <div className='flex items-start gap-4'>
            <div className='relative'>
              <img
                src={userData.avatar}
                alt={userData.name}
                className='w-20 h-20 rounded-full object-cover border-4 border-white dark:border-[#1a2e35] shadow-lg'
              />
              <button className='absolute bottom-0 right-0 p-1.5 bg-[#0a2c24] dark:bg-[#77b6a3] text-white dark:text-[#0a2c24] rounded-full shadow-lg'>
                <Edit3 className='w-3.5 h-3.5' />
              </button>
            </div>

            <div className='flex-1 min-w-0'>
              <h2 className='text-xl font-bold text-gray-900 dark:text-white'>{userData.name}</h2>

              <div className='mt-2 space-y-1'>
                <div className='flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400'>
                  <Mail className='w-4 h-4' />
                  <span>{userData.email}</span>
                </div>
                <div className='flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400'>
                  <Phone className='w-4 h-4' />
                  <span>{userData.phone}</span>
                </div>
                <div className='flex items-center gap-2 text-sm text-gray-500 dark:text-gray-500'>
                  <Calendar className='w-4 h-4' />
                  <span>Member since {userData.memberSince}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className='mt-6 pt-6 border-t border-gray-100 dark:border-white/10'>
            <div className='grid grid-cols-3 gap-4'>
              <div className='text-center'>
                <div className='text-2xl font-bold text-[#0a2c24] dark:text-[#77b6a3]'>
                  {userData.stats.totalBookings}
                </div>
                <div className='text-xs text-gray-500 dark:text-gray-400'>Total Bookings</div>
              </div>
              <div className='text-center'>
                <div className='text-2xl font-bold text-[#0a2c24] dark:text-[#77b6a3]'>{userData.stats.favourites}</div>
                <div className='text-xs text-gray-500 dark:text-gray-400'>Favourites</div>
              </div>
              <div className='text-center'>
                <div className='flex items-center justify-center gap-1'>
                  <Star className='w-5 h-5 fill-yellow-400 text-yellow-400' />
                  <span className='text-2xl font-bold text-[#0a2c24] dark:text-[#77b6a3]'>
                    {userData.stats.avgRating}
                  </span>
                </div>
                <div className='text-xs text-gray-500 dark:text-gray-400'>Avg Rating</div>
              </div>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className='bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 overflow-hidden'>
          {menuItems.map((item, index) => (
            <button
              key={item.id}
              onClick={() => router.push(`/${lang}${item.href}`)}
              className={`w-full flex items-center justify-between px-4 py-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors ${
                index !== menuItems.length - 1 ? 'border-b border-gray-100 dark:border-white/10' : ''
              }`}
            >
              <div className='flex items-center gap-3'>
                <item.icon className='w-5 h-5 text-gray-500 dark:text-gray-400' />
                <span className='text-gray-900 dark:text-white font-medium'>{item.label}</span>
              </div>
              <div className='flex items-center gap-2'>
                {item.badge && (
                  <span className='px-2 py-0.5 text-xs font-medium bg-[#0a2c24] dark:bg-[#77b6a3] text-white dark:text-[#0a2c24] rounded-full'>
                    {item.badge}
                  </span>
                )}
                <ChevronRight className='w-5 h-5 text-gray-400 dark:text-gray-500' />
              </div>
            </button>
          ))}
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className='w-full flex items-center justify-center gap-2 px-4 py-4 bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 text-red-600 dark:text-red-400 font-medium hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors'
        >
          <LogOut className='w-5 h-5' />
          <span>Log Out</span>
        </button>

        {/* App Version */}
        <p className='text-center text-xs text-gray-400 dark:text-gray-500'>Zerv v1.0.0</p>
      </div>
    </div>
  )
}

export default ProfilePage
