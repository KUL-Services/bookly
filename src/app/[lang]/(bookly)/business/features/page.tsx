'use client'

import React from 'react'
import {
  Calendar,
  Users,
  Scissors,
  BarChart,
  CreditCard,
  ShieldCheck,
  Megaphone,
  Briefcase,
  Smartphone,
  CheckCircle2
} from 'lucide-react'
import { FeaturesSection } from '@/bookly/components/business/features/FeaturesSection'
import { Button } from '@/bookly/components/molecules'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'

export default function FeaturesPage() {
  const { t } = useTranslation()

  return (
    <div className='min-h-screen pb-20'>
      {/* Hero Section */}
      <div className='relative bg-[#0a2c24] pt-32 pb-24 px-4 overflow-hidden text-center'>
        {/* Simple background decorative elements */}
        <div className='absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#77b6a3] via-[#0a2c24] to-[#0a2c24] pointer-events-none' />

        <div className='relative z-10 max-w-4xl mx-auto space-y-6'>
          <h1 className='text-4xl md:text-6xl font-bold text-white tracking-tight'>
            Every feature you need in one app.
          </h1>
          <p className='text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto'>
            Manage appointments, payments, marketing, and more with the all-in-one solution for your business.
          </p>
        </div>
      </div>

      {/* Feature Sections */}
      <div className='divide-y divide-gray-100 dark:divide-gray-800'>
        <FeaturesSection
          index={0}
          title='Booking'
          icon={Calendar}
          color='bg-blue-500'
          features={[
            {
              name: 'Online Booking 24/7',
              description: 'Let clients book themselves anytime, filling your calendar even while you sleep.'
            },
            {
              name: 'Service Listings',
              description: 'Showcase your full menu of services with prices, durations, and descriptions.'
            },
            {
              name: 'Portfolio',
              description: 'Upload photos of your best work to attract new clients and show off your skills.'
            },
            { name: 'Client Reviews', description: 'Build trust with verified reviews from your real customers.' },
            {
              name: 'Family & Friends',
              description: 'Allow clients to book for their children or friends under one account.'
            }
          ]}
        />

        <FeaturesSection
          index={1}
          title='Client Management'
          icon={Users}
          color='bg-purple-500'
          features={[
            {
              name: 'Client Cards',
              description: 'Keep detailed profiles with contact info, booking history, and preferences.'
            },
            {
              name: 'Client Notes',
              description: 'Private notes to remember formulas, allergies, or conversation starters.'
            },
            { name: 'Appointment Reminders', description: 'Reduce no-shows with automated SMS and email reminders.' },
            {
              name: 'Client Tags',
              description: "Segment your list with tags like 'VIP', 'New', or 'Late' for easier management."
            },
            { name: 'Block Clients', description: 'Prevent unwanted bookings by blocking problematic clients easily.' }
          ]}
        />

        <FeaturesSection
          index={2}
          title='Scheduling & Calendar'
          icon={Briefcase}
          color='bg-orange-500'
          features={[
            {
              name: 'Customizable Calendar',
              description: 'View your schedule by day, week, or month. Color-code services for clarity.'
            },
            {
              name: 'Booking Rules',
              description: 'Set lead times, cancellation windows, and booking buffers to control your day.'
            },
            {
              name: 'Waitlist',
              description: 'Fill last-minute gaps automatically by notifying clients waiting for a spot.'
            },
            { name: 'Time Off', description: 'Easily block out time for breaks, vacations, or personal errands.' }
          ]}
        />

        <FeaturesSection
          index={3}
          title='Marketing'
          icon={Megaphone}
          color='bg-pink-500'
          features={[
            { name: 'Message Blasts', description: 'Send bulk SMS or emails to announce openings, deals, or updates.' },
            {
              name: 'Social Media Integration',
              description: "Add a 'Book Now' button to your Instagram and Facebook profiles."
            },
            {
              name: 'Automated Marketing',
              description: "Trigger 'Happy Birthday' or 'We Miss You' messages automatically."
            },
            { name: 'Promotions', description: 'Run flash sales or discounts to boost bookings during slow periods.' }
          ]}
        />

        <FeaturesSection
          index={4}
          title='Payments'
          icon={CreditCard}
          color='bg-green-500'
          features={[
            {
              name: 'Seamless Checkout',
              description: 'Charge cards on file for an invisible, frictionless payment experience.'
            },
            {
              name: 'Mobile Payments',
              description: 'Accept payments directly from your phone—no extra hardware needed.'
            },
            {
              name: 'Sales Reports',
              description: 'Track your revenue, tips, and taxes with easy-to-read daily reports.'
            },
            { name: 'Fast Payouts', description: 'Get your money deposited directly to your bank account quickly.' }
          ]}
        />

        <FeaturesSection
          index={5}
          title='No-Show Protection'
          icon={ShieldCheck}
          color='bg-red-500'
          features={[
            { name: 'Cancellation Policy', description: 'Set clear terms that clients must agree to before booking.' },
            {
              name: 'Cancellation Fees',
              description: 'Automatically charge fees for late cancels or no-shows to protect your time.'
            },
            {
              name: 'Deposits / Prepayments',
              description: 'Require a deposit upfront to secure high-value appointments.'
            }
          ]}
        />

        <FeaturesSection
          index={6}
          title='Services'
          icon={Scissors}
          color='bg-indigo-500'
          features={[
            {
              name: 'Add-Ons',
              description: 'Upsell appointments by offering extra treatments or products at booking.'
            },
            {
              name: 'Service Variants',
              description: 'Offer different prices/durations for the same service (e.g., Hair Length).'
            },
            {
              name: 'Combo Services',
              description: 'Bundle multiple services together for a seamless booking experience.'
            },
            { name: 'Mobile Services', description: 'Set travel zones and fees for house calls or on-location work.' }
          ]}
        />

        <FeaturesSection
          index={7}
          title='Staff Management'
          icon={BarChart}
          color='bg-teal-500'
          features={[
            { name: 'Staff Profiles', description: 'Give each team member their own calendar and login.' },
            {
              name: 'Permission Levels',
              description: 'Control what staff can see—hide revenue or client lists if needed.'
            },
            {
              name: 'Commissions',
              description: 'Calculate staff pay automatically based on service or product sales.'
            },
            { name: 'Shifts', description: 'Manage rosters and working hours for the whole team in one place.' }
          ]}
        />

        {/* <FeaturesSection
          index={8}
          title='Mobile & Web'
          icon={Smartphone}
          color='bg-blue-600'
          features={[
            { name: 'Biz Mobile App', description: 'Manage your entire business from your pocket, anywhere, anytime.' },
            { name: 'Tablet & Desktop', description: 'Get the full picture on a larger screen at your front desk.' },
            { name: 'Client App', description: 'A beautifully designed app for your clients to find and book you.' }
          ]}
        /> */}
      </div>

      {/* Bottom CTA */}
      <div className='bg-white dark:bg-[#0a2c24] py-24 text-center px-4'>
        <div className='max-w-3xl mx-auto space-y-8'>
          <h2 className='text-4xl font-bold text-[#202c39] dark:text-white'>Ready to upgrade your business?</h2>
          <p className='text-lg text-gray-600 dark:text-gray-300'>
            Join thousands of professionals who trust Zerv to run their day.
          </p>
          <Button
            className='bg-[#77b6a3] hover:bg-[#5da891] text-white px-10 py-4 rounded-full font-bold text-lg shadow-xl transform hover:-translate-y-1 transition-all'
            buttonText={{ plainText: 'Get Started Free' }}
            onClick={() => (window.location.href = '/customer/register?type=business')}
          />
        </div>
      </div>
    </div>
  )
}
