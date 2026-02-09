'use client'

import { useTranslation } from 'react-i18next'
import { Button } from '@/bookly/components/molecules'
import { FeaturesSection } from '@/bookly/components/organisms/features-section/features-section.component'
import FooterSection from '@/bookly/components/organisms/footer-section/footer-section'
// import { TestimonialsSection } from '@/bookly/components/organisms/testimonials-section/testimonials-section'
import { BusinessAppDownload } from '@/bookly/components/organisms/business-app-download/business-app-download'
import { MapPin } from 'lucide-react'
import { RecommendedSection } from '@/bookly/components/organisms/recommended-section'
import { ScrollReveal } from '@/bookly/components/molecules/scroll-reveal'
import { ZDivider } from '@/bookly/components/atoms/zerv-assets'
// import { FAQSection } from '@/bookly/components/organisms/faq-section/faq-section'

export default function BusinessHomePage() {
  const { t } = useTranslation()

  return (
    <div className='overflow-hidden'>
      {/* 1. Hero Section */}
      <section className='relative min-h-[95vh] flex flex-col items-center justify-center bg-primary-800 overflow-hidden pt-20'>
        {/* Parallax Background */}
        {/* Parallax Background */}
        <div
          className='absolute inset-0 bg-cover bg-center opacity-30 mix-blend-overlay'
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=2000&auto=format&fit=crop')",
            transform: 'translateZ(-1px) scale(2)'
          }}
        />
        <div className='absolute inset-0 bg-gradient-to-b from-primary-800 via-primary-800/90 to-primary-800' />

        {/* Content */}
        <div className='relative z-10 max-w-5xl mx-auto px-4 text-center space-y-8 flex-1 flex flex-col justify-center'>
          <ScrollReveal animation='fade-up' duration={1000}>
            <div className='inline-block px-4 py-1.5 rounded-full border border-sage-500/30 bg-sage-500/10 backdrop-blur-md mb-6'>
              <span className='text-sage-500 font-semibold text-sm tracking-wide uppercase'>
                The #1 Platform for Professionals
              </span>
            </div>
            <h1 className='text-5xl md:text-7xl lg:text-8xl font-bold font-sans text-white leading-tight tracking-tight drop-shadow-2xl'>
              Build your <br />
              <span className='text-transparent bg-clip-text bg-gradient-to-r from-sage-500 to-emerald-200'>
                dream business.
              </span>
            </h1>
          </ScrollReveal>

          <ScrollReveal animation='fade-up' delay={200} duration={1000}>
            <p className='text-lg md:text-2xl text-gray-200 max-w-3xl mx-auto font-light leading-relaxed'>
              The all-in-one platform to schedule appointments, manage clients, and process payments.
              <span className='hidden md:inline'> Join the elite community of professionals trusting Zerv.</span>
            </p>
          </ScrollReveal>

          <ScrollReveal animation='fade-up' delay={400} duration={1000}>
            <div className='flex flex-col sm:flex-row items-center justify-center gap-6 pt-4'>
              <Button
                className='bg-transparent border border-sage-500 text-sage-500 hover:bg-sage-500 hover:text-[#0a2c24] px-10 py-5 rounded-full text-lg font-bold shadow-sage-500/20 transform hover:scale-105 transition-all w-full sm:w-auto font-sans'
                buttonText={{ plainText: 'Start Free Trial' }}
              />
              {/* <Button
                variant='text'
                className='bg-white/5 border border-white/20 text-white hover:bg-white/10 px-10 py-5 rounded-full text-lg font-bold w-full sm:w-auto font-sans transition-all duration-300 backdrop-blur-sm'
                buttonText={{ plainText: 'Watch Demo' }}
                suffixIcon={{ icon: 'ri-play-circle-line', className: 'ml-2' }}
                onClick={() => window.open('https://www.youtube.com/watch?v=dQw4w9WgXcQ', '_blank')}
              /> */}
            </div>
            <div className='flex items-center justify-center gap-6 mt-8 text-sm text-gray-300 font-medium'>
              <span className='flex items-center gap-2'>
                <i className='ri-check-line text-sage-500'></i> No credit card required
              </span>
              <span className='flex items-center gap-2'>
                <i className='ri-check-line text-sage-500'></i> 14-day free trial
              </span>
            </div>
          </ScrollReveal>
        </div>

        {/* Trusted By Section (Integrated into Hero Bottom) */}
        <div className='relative z-10 w-full mt-auto border-t border-white/5 bg-primary-800/80 backdrop-blur-md py-12'>
          <div className='max-w-7xl mx-auto px-4'>
            <p className='text-center text-white-800 text-xs uppercase tracking-widest font-bold mb-8 opacity-80'>
              Trusted by 2,000+ top businesses
            </p>
            <div className='flex flex-wrap justify-center items-center gap-12 md:gap-24'>
              {/* Mock Logos using Icons and Text */}
              <div className='flex items-center gap-3 text-white font-bold text-xl group cursor-default opacity-90 hover:opacity-100 transition-opacity'>
                <div className='w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-sage-500 group-hover:text-[#0a2c24] transition-all duration-300'>
                  <i className='ri-scissors-fill text-2xl'></i>
                </div>
                <span className='tracking-wide'>LUXE CUTS</span>
              </div>
              <div className='flex items-center gap-3 text-white font-bold text-xl group cursor-default opacity-90 hover:opacity-100 transition-opacity'>
                <div className='w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-sage-500 group-hover:text-[#0a2c24] transition-all duration-300'>
                  <i className='ri-drop-fill text-2xl'></i>
                </div>
                <span className='tracking-wide'>EAU SPA</span>
              </div>
              <div className='flex items-center gap-3 text-white font-bold text-xl group cursor-default opacity-90 hover:opacity-100 transition-opacity'>
                <div className='w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-sage-500 group-hover:text-[#0a2c24] transition-all duration-300'>
                  <i className='ri-bear-smile-fill text-2xl'></i>
                </div>
                <span className='tracking-wide'>KINGS</span>
              </div>
              <div className='flex items-center gap-3 text-white font-bold text-xl group cursor-default opacity-90 hover:opacity-100 transition-opacity'>
                <div className='w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-sage-500 group-hover:text-[#0a2c24] transition-all duration-300'>
                  <i className='ri-vip-diamond-fill text-2xl'></i>
                </div>
                <span className='tracking-wide'>GLOW</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* 2. Benefits Section (Alternating Panels) */}
      <section className='py-20 bg-white-500 dark:bg-primary-800 relative'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24'>
          {/* Panel 1: Stay Booked */}
          <div className='flex flex-col md:flex-row items-center gap-12'>
            <div className='flex-1 order-2 md:order-1'>
              <ScrollReveal animation='slide-in-left'>
                <div className='relative'>
                  <div className='absolute inset-0 bg-sage-500/20 rounded-[3rem] transform -rotate-3 scale-105' />
                  <img
                    src='https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80'
                    alt='Calendar Management'
                    className='relative rounded-[2rem] shadow-2xl z-10'
                  />
                </div>
              </ScrollReveal>
            </div>
            <div className='flex-1 order-1 md:order-2 space-y-6'>
              <ScrollReveal animation='slide-in-right'>
                <h2 className='text-3xl md:text-4xl font-bold text-secondary-600 dark:text-white'>
                  Stay booked, without the back and forth
                </h2>
                <p className='text-lg text-gray-600 dark:text-gray-300'>
                  Let clients book themselves 24/7. Your calendar fills up while you sleep, work, or relax. Say goodbye
                  to endless text messages and phone tag.
                </p>
                <ul className='space-y-3'>
                  {['24/7 Online Booking', 'Automated Reminders', 'Smart Calendar Sync'].map(item => (
                    <li key={item} className='flex items-center gap-3 text-gray-700 dark:text-gray-200'>
                      <i className='ri-checkbox-circle-fill text-sage-500 text-xl'></i>
                      {item}
                    </li>
                  ))}
                </ul>
              </ScrollReveal>
            </div>
          </div>

          {/* Panel 2: Get Paid */}
          <div className='flex flex-col md:flex-row items-center gap-12'>
            <div className='flex-1 space-y-6'>
              <ScrollReveal animation='slide-in-left'>
                <h2 className='text-3xl md:text-4xl font-bold text-secondary-600 dark:text-white'>
                  Get paid securely and instantly
                </h2>
                <p className='text-lg text-gray-600 dark:text-gray-300'>
                  Accept payments, deposits, and tips directly through the platform. Reduce no-shows with upfront
                  payments and cancellation fees.
                </p>
                <Button
                  variant='text'
                  className='text-sage-500 font-bold hover:bg-sage-500/10 px-0'
                  buttonText={{ plainText: 'Explore Payments' }}
                  suffixIcon={{ icon: 'ri-arrow-right-line', className: 'ml-1' }}
                />
              </ScrollReveal>
            </div>
            <div className='flex-1'>
              <ScrollReveal animation='slide-in-right'>
                <div className='relative'>
                  <div className='absolute inset-0 bg-secondary-600/10 dark:bg-white/10 rounded-full transform scale-90 translate-x-4' />
                  <img
                    src='https://images.unsplash.com/photo-1556742111-a301076d9d18?w=800&q=80'
                    alt='Payments'
                    className='relative rounded-xl shadow-2xl z-10 rotate-2 hover:rotate-0 transition-transform duration-500'
                  />
                </div>
              </ScrollReveal>
            </div>
          </div>

          {/* Panel 3: Financial Command Center */}
          <div className='flex flex-col md:flex-row items-center gap-12'>
            <div className='flex-1 order-2 md:order-1'>
              <ScrollReveal animation='slide-in-left'>
                <div className='relative bg-secondary-800 rounded-3xl p-8 border border-white/10 shadow-2xl overflow-hidden group'>
                  {/* Chart Mockup */}
                  <div className='relative z-10 space-y-6'>
                    <div className='flex justify-between items-center mb-8'>
                      <div>
                        <div className='text-gray-400 text-sm font-medium'>Total Revenue</div>
                        <div className='text-3xl font-bold text-white'>E£42,593.00</div>
                      </div>
                      <div className='px-3 py-1 bg-teal-500/20 text-teal-300 rounded-full text-xs font-bold'>
                        +18.2%
                      </div>
                    </div>

                    {/* Bar Chart Bars */}
                    <div className='flex items-end justify-between h-32 gap-2'>
                      {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                        <div
                          key={i}
                          className='w-full bg-secondary-700 rounded-t-sm relative group-hover:scale-y-105 transition-transform origin-bottom duration-500'
                        >
                          <div
                            className='absolute bottom-0 inset-x-0 bg-gradient-to-t from-teal-500 to-teal-400 rounded-t-sm transition-all duration-1000'
                            style={{ height: `${h}%` }}
                          ></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </div>
            <div className='flex-1 order-1 md:order-2 space-y-6'>
              <ScrollReveal animation='slide-in-right'>
                <div className='w-12 h-12 rounded-2xl bg-teal-100 flex items-center justify-center text-teal-600 mb-6 text-2xl'>
                  <i className='ri-funds-box-fill'></i>
                </div>
                <h2 className='text-3xl md:text-4xl font-bold text-secondary-600 dark:text-white'>Master your money</h2>
                <p className='text-lg text-gray-600 dark:text-gray-300'>
                  Real-time revenue tracking, automated payouts, and financial insights that help you grow. See exactly
                  where your business stands at a glance.
                </p>
                <ul className='space-y-3'>
                  {['Revenue Analytics', 'Automated Commission Calc', 'Exportable Reports'].map(item => (
                    <li key={item} className='flex items-center gap-3 text-gray-700 dark:text-gray-200'>
                      <i className='ri-checkbox-circle-fill text-sage-500 text-xl'></i>
                      {item}
                    </li>
                  ))}
                </ul>
              </ScrollReveal>
            </div>
          </div>

          {/* Panel 4: Client Experience */}
          <div className='flex flex-col md:flex-row items-center gap-12'>
            <div className='flex-1 space-y-6'>
              <ScrollReveal animation='slide-in-left'>
                <div className='w-12 h-12 rounded-2xl bg-coral-100 flex items-center justify-center text-coral-600 mb-6 text-2xl'>
                  <i className='ri-vip-crown-fill'></i>
                </div>
                <h2 className='text-3xl md:text-4xl font-bold text-secondary-600 dark:text-white'>
                  Give clients the VIP treatment
                </h2>
                <p className='text-lg text-gray-600 dark:text-gray-300'>
                  A seamless, app-like booking experience they'll love—no download required. Your clients get their own
                  portal to manage bookings and payments.
                </p>
                <Button
                  variant='text'
                  className='text-coral-500 font-bold hover:bg-coral-500/10 px-0'
                  buttonText={{ plainText: 'See Client Experience' }}
                  suffixIcon={{ icon: 'ri-arrow-right-line', className: 'ml-1' }}
                />
              </ScrollReveal>
            </div>
            <div className='flex-1'>
              <ScrollReveal animation='slide-in-right'>
                <div className='relative mx-auto max-w-[300px]'>
                  {/* Phone Case (Frame) */}
                  <div className='relative bg-secondary-800 rounded-[3rem] p-3 shadow-2xl border-4 border-secondary-700'>
                    {/* Camera Notch/Island */}
                    <div className='absolute top-3 left-1/2 -translate-x-1/2 w-1/3 h-7 bg-black rounded-full z-20 pointer-events-none'></div>

                    {/* Screen */}
                    <div className='bg-white rounded-[2.5rem] overflow-hidden aspect-[9/19] relative bg-gray-50'>
                      {/* Status Bar Area */}
                      <div className='h-8 w-full bg-white z-10 relative'></div>

                      {/* Header */}
                      <div className='px-6 py-2 flex justify-between items-center text-secondary-600 mb-2'>
                        <div className='font-bold text-lg'>My Bookings</div>
                        <div className='w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-400'>
                          <i className='ri-user-fill text-xs'></i>
                        </div>
                      </div>

                      {/* Upcoming Card */}
                      <div className='mx-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-4 relative z-10'>
                        <div className='flex gap-3 mb-3'>
                          <div className='w-12 h-12 bg-sage-500/10 rounded-xl flex items-center justify-center text-sage-600'>
                            <i className='ri-calendar-check-fill text-xl'></i>
                          </div>
                          <div>
                            <div className='font-bold text-secondary-600 text-sm'>Haircut & Beard</div>
                            <div className='text-xs text-gray-500 mt-1'>Today, 2:00 PM</div>
                          </div>
                        </div>
                        <div className='w-full bg-sage-500 py-2 rounded-lg text-white text-center text-xs font-bold tracking-wide'>
                          CONFIRMED
                        </div>
                      </div>

                      {/* Past Card (Faded) */}
                      <div className='mx-4 bg-white p-4 rounded-2xl border border-gray-50 opacity-60'>
                        <div className='flex gap-3 mb-2'>
                          <div className='w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400'>
                            <i className='ri-history-fill'></i>
                          </div>
                          <div>
                            <div className='font-bold text-gray-400 text-sm'>Classic Shave</div>
                            <div className='text-xs text-gray-400'>Yesterday</div>
                          </div>
                        </div>
                        <div className='flex items-center gap-1 text-xs text-coral-500 font-medium'>
                          <i className='ri-error-warning-fill'></i> No-Show (Fee Charged)
                        </div>
                      </div>

                      {/* Bottom Nav Mockup */}
                      <div className='absolute bottom-4 inset-x-0 flex justify-around text-gray-300 text-2xl px-6'>
                        <i className='ri-home-5-fill text-secondary-600'></i>
                        <i className='ri-search-line'></i>
                        <i className='ri-calendar-line'></i>
                        <i className='ri-user-line'></i>
                      </div>
                    </div>
                  </div>
                </div>

                {/* List */}
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>
      <section className='py-16 bg-secondary-600 text-white'>
        <div className='max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-white/10'>
          {[
            { number: '20%', label: 'More bookings per customer' },
            { number: '5hrs', label: 'Saved per week on admin' },
            { number: '30%', label: 'Revenue growth in year 1' }
          ].map((stat, idx) => (
            <ScrollReveal key={idx} delay={idx * 100} animation='fade-up' className='text-center px-4 pt-8 md:pt-0'>
              <div className='text-5xl font-bold text-sage-500 mb-2'>{stat.number}</div>
              <p className='text-gray-300 font-medium'>{stat.label}</p>
            </ScrollReveal>
          ))}
        </div>
      </section>
      {/* 3.5. Testimonials Section (Social Proof) */}
      {/* <TestimonialsSection /> */}
      {/* 4. Features Bento Grid */}
      <section className='py-32 bg-white dark:bg-primary-800 relative overflow-hidden'>
        <div className='max-w-7xl mx-auto px-4'>
          <div className='text-center mb-20 space-y-4'>
            <ScrollReveal animation='fade-up'>
              <h2 className='text-4xl md:text-5xl font-bold text-secondary-600 dark:text-white leading-tight'>
                Everything you need to <br /> <span className='text-sage-500'>dominate your market.</span>
              </h2>
              <p className='text-xl text-white-900 max-w-2xl mx-auto pt-4'>
                Stop juggling multiple apps. Zerv gives you a complete toolkit to manage every aspect of your business.
              </p>
            </ScrollReveal>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-12 gap-6 md:grid-rows-[300px_300px]'>
            {/* Feature 1: Marketing (Large) */}
            <ScrollReveal
              animation='fade-up'
              className='md:col-span-8 bg-white dark:bg-secondary-600 rounded-3xl p-8 md:p-12 relative overflow-hidden group hover:shadow-2xl transition-all duration-500 border border-gray-100 dark:border-white/5 shadow-xl'
            >
              <div className='relative z-10 h-full flex flex-col justify-between'>
                <div>
                  <div className='w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-white mb-6 text-2xl shadow-lg shadow-teal-500/20'>
                    <i className='ri-megaphone-fill'></i>
                  </div>
                  <h3 className='text-3xl font-bold text-secondary-600 dark:text-white mb-3'>Integrated Marketing</h3>
                  <p className='text-lg text-gray-500 dark:text-gray-300 max-w-md'>
                    Launch email campaigns, offer discounts, and re-engage lost clients with automated tools built
                    directly into your booking system.
                  </p>
                </div>
                <div className='flex flex-wrap gap-2 mt-8'>
                  <span className='px-4 py-2 rounded-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm font-semibold text-secondary-600 dark:text-white'>
                    Email Blasts
                  </span>
                  <span className='px-4 py-2 rounded-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm font-semibold text-secondary-600 dark:text-white'>
                    Promo Codes
                  </span>
                  <span className='px-4 py-2 rounded-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm font-semibold text-secondary-600 dark:text-white'>
                    Client Segmentation
                  </span>
                </div>
              </div>
            </ScrollReveal>

            {/* Feature 2: Analytics (Tall/Small) */}
            <ScrollReveal
              animation='fade-up'
              delay={200}
              className='md:col-span-4 bg-sage-500 rounded-3xl p-8 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-500 shadow-xl shadow-[#77b6a3]/20 flex flex-col justify-between'
            >
              <div className='absolute inset-0 bg-gradient-to-br from-[#77b6a3] to-[#5da891]'></div>
              <div className='absolute bottom-0 right-0 opacity-20'>
                <i className='ri-bar-chart-groupped-fill text-9xl text-[#0a2c24] -mb-4 -mr-4'></i>
              </div>
              <div className='relative z-10 text-[#0a2c24]'>
                <div className='w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-6 text-2xl backdrop-blur-sm'>
                  <i className='ri-line-chart-fill'></i>
                </div>
                <h3 className='text-2xl font-bold mb-2'>Real-time Analytics</h3>
                <p className='font-medium opacity-80 mb-6 text-sm'>
                  Track revenue, staff performance, and client retention.
                </p>
              </div>

              <div className='relative z-10 bg-white rounded-xl p-4 shadow-lg border border-white/20'>
                <div className='flex justify-between items-end mb-3 h-24 gap-2'>
                  {[35, 60, 45, 80, 50, 90, 70].map((h, i) => (
                    <div
                      key={i}
                      className='flex-1 bg-gray-100 rounded-t-sm relative overflow-hidden h-full group-hover:bg-gray-50 transition-colors'
                    >
                      <div
                        className='absolute bottom-0 inset-x-0 bg-gradient-to-t from-teal-600 to-teal-400 rounded-t-sm transition-all duration-1000'
                        style={{ height: `${h}%` }}
                      ></div>
                    </div>
                  ))}
                </div>
                <div className='flex justify-between items-center pt-2 border-t border-gray-100'>
                  <span className='text-xs font-bold text-gray-400 uppercase tracking-widest'>Growth</span>
                  <div className='flex items-center gap-1 text-sm font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded-full'>
                    <i className='ri-arrow-up-line text-xs'></i> 24%
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Feature 3: Staff (Standard) */}
            <ScrollReveal
              animation='fade-up'
              delay={300}
              className='md:col-span-4 bg-white dark:bg-secondary-600 rounded-3xl p-8 relative overflow-hidden group hover:-translate-y-2 transition-transform duration-500 border border-gray-100 dark:border-white/5 shadow-xl'
            >
              <div className='w-12 h-12 rounded-2xl bg-coral-100 flex items-center justify-center text-coral-600 mb-6 text-2xl group-hover:bg-coral-500 group-hover:text-white transition-colors'>
                <i className='ri-team-fill'></i>
              </div>
              <h3 className='text-xl font-bold text-secondary-600 dark:text-white mb-2'>Team Management</h3>
              <p className='text-gray-500 dark:text-gray-300 mb-4'>
                Set individual schedules, permissions, and commission rates.
              </p>
            </ScrollReveal>

            {/* Feature 4: Inventory (Standard) */}
            <ScrollReveal
              animation='fade-up'
              delay={400}
              className='md:col-span-4 bg-white dark:bg-secondary-600 rounded-3xl p-8 relative overflow-hidden group hover:-translate-y-2 transition-transform duration-500 border border-gray-100 dark:border-white/5 shadow-xl'
            >
              <div className='w-12 h-12 rounded-2xl bg-teal-100 flex items-center justify-center text-teal-600 mb-6 text-2xl group-hover:bg-teal-500 group-hover:text-white transition-colors'>
                <i className='ri-store-2-fill'></i>
              </div>
              <h3 className='text-xl font-bold text-secondary-600 dark:text-white mb-2'>Smart Inventory</h3>
              <p className='text-gray-500 dark:text-gray-300 mb-4'>
                Track stock levels and get alerts when it's time to reorder.
              </p>
            </ScrollReveal>

            {/* Feature 5: CRM (Standard) */}
            <ScrollReveal
              animation='fade-up'
              delay={500}
              className='md:col-span-4 bg-white dark:bg-secondary-600 rounded-3xl p-8 relative overflow-hidden group hover:-translate-y-2 transition-transform duration-500 border border-gray-100 dark:border-white/5 shadow-xl'
            >
              <div className='w-12 h-12 rounded-2xl bg-coral-100 flex items-center justify-center text-coral-600 mb-6 text-2xl group-hover:bg-coral-500 group-hover:text-white transition-colors'>
                <i className='ri-user-heart-fill'></i>
              </div>
              <h3 className='text-xl font-bold text-secondary-600 dark:text-white mb-2'>Client CRM</h3>
              <p className='text-gray-500 dark:text-gray-300 mb-4'>
                Keep detailed client notes, booking history, and preferences.
              </p>
            </ScrollReveal>
          </div>
        </div>
      </section>
      {/* 5. Business Types (Bubble Grid) */}
      <section className='py-20 bg-white-500 dark:bg-primary-800'>
        <div className='max-w-7xl mx-auto px-4 text-center'>
          <h2 className='text-2xl md:text-3xl font-bold text-secondary-600 dark:text-white mb-12'>
            Tailored for your industry
          </h2>
          <div className='flex flex-wrap justify-center gap-8'>
            {[
              { name: 'Barber', icon: 'ri-scissors-fill' },
              { name: 'Salon', icon: 'ri-store-3-fill' },
              { name: 'Nail', icon: 'ri-hand-heart-fill' },
              { name: 'Spa', icon: 'ri-empathize-fill' },
              { name: 'Brows', icon: 'ri-eye-fill' },
              { name: 'Tattoo', icon: 'ri-pen-nib-fill' }
            ].map(type => (
              <div key={type.name} className='flex flex-col items-center gap-3 group cursor-pointer'>
                <div className='w-20 h-20 md:w-24 md:h-24 rounded-full bg-white dark:bg-secondary-600 shadow-md flex items-center justify-center text-3xl md:text-4xl text-sage-500 group-hover:scale-110 group-hover:bg-sage-500 group-hover:text-white transition-all duration-300'>
                  <i className={type.icon}></i>
                </div>
                <span className='font-medium text-secondary-600 dark:text-gray-300 group-hover:text-sage-500 transition-colors'>
                  {type.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* 6. Onboarding Steps */}
      <section className='py-24 bg-white dark:bg-secondary-600'>
        <div className='max-w-5xl mx-auto px-4'>
          <div className='text-center mb-16'>
            <h2 className='text-3xl md:text-4xl font-bold text-secondary-600 dark:text-white'>
              Get started in minutes
            </h2>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-12 relative'>
            {/* Connector Line (Desktop) */}
            <div className='hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gray-200 dark:bg-gray-700 -z-10' />

            {[
              { step: '1', title: 'Create Profile', desc: 'Sign up and customize your services, prices, and hours.' },
              {
                step: '2',
                title: 'Share Link',
                desc: 'Send your personalized booking link to clients or add to Instagram.'
              },
              { step: '3', title: 'Get Booked', desc: 'Watch your calendar fill up automatically.' }
            ].map((item, idx) => (
              <ScrollReveal
                key={idx}
                animation='fade-up'
                delay={idx * 200}
                className='text-center bg-white dark:bg-secondary-600'
              >
                <div className='w-24 h-24 mx-auto bg-primary-800 text-white rounded-full flex items-center justify-center text-3xl font-bold mb-6 ring-8 ring-white dark:ring-[#202c39]'>
                  {item.step}
                </div>
                <h3 className='text-xl font-bold text-secondary-600 dark:text-white mb-3'>{item.title}</h3>
                <p className='text-white-900 leading-relaxed'>{item.desc}</p>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Easy Migration Section (Restored & Redesigned) */}
      {false && (
        <section className='py-24 bg-secondary-700 relative overflow-hidden'>
          <div className='max-w-7xl mx-auto px-4 relative z-10'>
            <div className='flex flex-col md:flex-row items-center gap-16'>
              <div className='flex-1 space-y-8'>
                <ScrollReveal animation='slide-in-left'>
                  <span className='inline-block px-4 py-1 rounded-full bg-teal-500/20 text-teal-300 font-bold text-sm mb-4 border border-teal-500/30'>
                    Free Concierge Migration
                  </span>
                  <h2 className='text-3xl md:text-5xl font-bold text-white leading-tight'>
                    Already using another platform?
                  </h2>
                  <p className='text-lg text-gray-300 leading-relaxed'>
                    We know switching can be scary. That’s why we do the heavy lifting for you. We’ll import your client
                    list, service menu, and future appointments for free.
                  </p>
                  <div className='space-y-4 pt-4'>
                    {[
                      'We import your products & services',
                      'We transfer your client database',
                      'We set up your team & schedules'
                    ].map((item, i) => (
                      <div key={i} className='flex items-center gap-3 text-gray-200'>
                        <div className='w-6 h-6 rounded-full bg-teal-500 flex items-center justify-center text-white text-sm'>
                          <i className='ri-check-line'></i>
                        </div>
                        {item}
                      </div>
                    ))}
                  </div>
                  <div className='pt-8'>
                    <Button
                      className='bg-white text-secondary-700 hover:bg-gray-100 px-8 py-4 rounded-full font-bold shadow-xl transition-all'
                      buttonText={{ plainText: 'Learn about switching' }}
                    />
                  </div>
                </ScrollReveal>
              </div>
              <div className='flex-1 relative'>
                <ScrollReveal animation='slide-in-right'>
                  <div className='relative bg-secondary-800 rounded-2xl border border-white/10 p-8 shadow-2xl'>
                    {/* Mock UI of data transfer */}
                    <div className='flex items-center justify-between mb-8'>
                      <div className='flex items-center gap-4'>
                        <div className='w-12 h-12 rounded-full bg-secondary-800 flex items-center justify-center text-white-800'>
                          <i className='ri-database-2-line text-xl'></i>
                        </div>
                        <div>
                          <div className='text-white font-bold'>Data Transfer</div>
                          <div className='text-xs text-white-900'>Importing clients...</div>
                        </div>
                      </div>
                      <div className='text-sage-500 font-bold text-lg'>84%</div>
                    </div>
                    <div className='w-full bg-secondary-800 rounded-full h-2 mb-2 overflow-hidden'>
                      <div className='bg-sage-500 h-full rounded-full w-[84%] animate-pulse'></div>
                    </div>
                    <div className='flex justify-between text-xs text-white-900 font-mono'>
                      <span>Processing: client_list.csv</span>
                      <span>2,405 records found</span>
                    </div>
                  </div>

                  {/* Floating Badge */}
                  <div className='absolute -bottom-6 -left-6 bg-sage-500 text-primary-800 p-6 rounded-xl shadow-xl animate-bounce duration-[3000ms]'>
                    <div className='font-bold text-2xl mb-1'>100%</div>
                    <div className='text-xs font-bold uppercase tracking-wide'>Data Accuracy</div>
                  </div>
                </ScrollReveal>
              </div>
            </div>
          </div>
        </section>
      )}
      {/* 8. FAQ Section */}
      {/* <FAQSection /> */}
      {/* 9. App Download Section */}
      <BusinessAppDownload />
      {/* 7. Final CTA */}
      <section className='py-24 bg-gradient-to-br from-primary-800 to-primary-600 text-center px-4 relative overflow-hidden'>
        <div className='relative z-10 max-w-3xl mx-auto space-y-8'>
          <h2 className='text-4xl md:text-5xl font-bold text-white'>Ready to level up?</h2>
          <p className='text-xl text-gray-200'>
            Join the community of professionals who trust Zerv to run their business.
          </p>
          <Button
            className='bg-transparent border border-sage-500 text-sage-500 hover:bg-sage-500 hover:text-white px-10 py-5 rounded-full text-xl font-bold shadow-2xl transform hover:-translate-y-1 transition-all'
            buttonText={{ plainText: 'Start your free trial' }}
          />
          <p className='text-sm text-white-800'>No setup fees • Cancel anytime</p>
        </div>
      </section>
    </div>
  )
}
