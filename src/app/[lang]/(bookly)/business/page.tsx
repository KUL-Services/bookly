'use client'

import { useTranslation } from 'react-i18next'
import { Button } from '@/bookly/components/molecules'
import { FeaturesSection } from '@/bookly/components/organisms/features-section/features-section.component'
import FooterSection from '@/bookly/components/organisms/footer-section/footer-section'
import { TestimonialsSection } from '@/bookly/components/organisms/testimonials-section/testimonials-section'
import { BusinessAppDownload } from '@/bookly/components/organisms/business-app-download/business-app-download'
import { MapPin } from 'lucide-react'
import { RecommendedSection } from '@/bookly/components/organisms/recommended-section'
import { ScrollReveal } from '@/bookly/components/molecules/scroll-reveal'
import { ZDivider, ZWatermark } from '@/bookly/components/atoms/zerv-assets'

export default function BusinessHomePage() {
  const { t } = useTranslation()

  return (
    <div className='overflow-hidden'>
      {/* 1. Hero Section */}
      <section className='relative min-h-[90vh] flex items-center justify-center bg-[#0a2c24] overflow-hidden'>
        {/* Parallax Background */}
        <div
          className='absolute inset-0 bg-cover bg-center opacity-40'
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=2000&auto=format&fit=crop')",
            transform: 'translateZ(-1px) scale(2)' // Simple parallax hint
          }}
        />
        <div className='absolute inset-0 bg-gradient-to-b from-[#0a2c24]/90 via-[#0a2c24]/50 to-[#0a2c24]/90' />

        {/* Content */}
        <div className='relative z-10 max-w-5xl mx-auto px-4 text-center space-y-8 pt-20'>
          <ScrollReveal animation='fade-up' duration={1000}>
            <h1 className='text-4xl md:text-6xl lg:text-7xl font-bold font-sans text-white leading-tight tracking-tight'>
              The best booking platform to
              <br />
              <span className='text-[#77b6a3]'>build your dream business</span>
            </h1>
          </ScrollReveal>

          <ScrollReveal animation='fade-up' delay={200} duration={1000}>
            <p className='text-lg md:text-xl text-white/90 max-w-2xl mx-auto font-sans leading-relaxed'>
              Schedule appointments, manage clients, and grow your revenue—all in one place. Join thousands of
              professionals trusting Zerv.
            </p>
          </ScrollReveal>

          <ScrollReveal animation='fade-up' delay={400} duration={1000}>
            <div className='flex flex-col sm:flex-row items-center justify-center gap-4'>
              <Button
                className='bg-[#77b6a3] hover:bg-[#5da891] text-white px-8 py-4 rounded-full text-lg font-bold shadow-xl transform hover:scale-105 transition-all w-full sm:w-auto font-sans border-none'
                buttonText={{ plainText: 'Start free now' }}
              />
              <Button
                variant='text'
                className='bg-transparent border-2 border-white text-white hover:bg-white hover:text-[#0a2c24] px-8 py-4 rounded-full text-lg font-bold w-full sm:w-auto font-sans transition-colors duration-300'
                buttonText={{ plainText: 'Watch Video' }}
                suffixIcon={{ icon: 'ri-play-circle-line', className: 'ml-2' }}
                onClick={() => window.open('https://www.youtube.com/watch?v=dQw4w9WgXcQ', '_blank')}
              />
            </div>
            <p className='text-white/70 text-sm mt-6 font-medium font-sans'>
              No credit card required • 14-day free trial
            </p>
          </ScrollReveal>
        </div>

        {/* Z-Swoosh Divider */}
        <ZDivider className='absolute bottom-0 left-0 w-full text-[#f7f8f9] dark:text-[#0a2c24]' />
      </section>

      {/* 2. Benefits Section (Alternating Panels) */}
      <section className='py-20 bg-[#f7f8f9] dark:bg-[#0a2c24] relative'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24'>
          {/* Panel 1: Stay Booked */}
          <div className='flex flex-col md:flex-row items-center gap-12'>
            <div className='flex-1 order-2 md:order-1'>
              <ScrollReveal animation='slide-in-left'>
                <div className='relative'>
                  <div className='absolute inset-0 bg-[#77b6a3]/20 rounded-[3rem] transform -rotate-3 scale-105' />
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
                <h2 className='text-3xl md:text-4xl font-bold text-[#202c39] dark:text-white'>
                  Stay booked, without the back and forth
                </h2>
                <p className='text-lg text-gray-600 dark:text-gray-300'>
                  Let clients book themselves 24/7. Your calendar fills up while you sleep, work, or relax. Say goodbye
                  to endless text messages and phone tag.
                </p>
                <ul className='space-y-3'>
                  {['24/7 Online Booking', 'Automated Reminders', 'Smart Calendar Sync'].map(item => (
                    <li key={item} className='flex items-center gap-3 text-gray-700 dark:text-gray-200'>
                      <i className='ri-checkbox-circle-fill text-[#77b6a3] text-xl'></i>
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
                <h2 className='text-3xl md:text-4xl font-bold text-[#202c39] dark:text-white'>
                  Get paid securely and instantly
                </h2>
                <p className='text-lg text-gray-600 dark:text-gray-300'>
                  Accept payments, deposits, and tips directly through the platform. Reduce no-shows with upfront
                  payments and cancellation fees.
                </p>
                <Button
                  variant='text'
                  className='text-[#77b6a3] font-bold hover:bg-[#77b6a3]/10 px-0'
                  buttonText={{ plainText: 'Explore Payments' }}
                  suffixIcon={{ icon: 'ri-arrow-right-line', className: 'ml-1' }}
                />
              </ScrollReveal>
            </div>
            <div className='flex-1'>
              <ScrollReveal animation='slide-in-right'>
                <div className='relative'>
                  <div className='absolute inset-0 bg-[#202c39]/10 dark:bg-white/10 rounded-full transform scale-90 translate-x-4' />
                  <img
                    src='https://images.unsplash.com/photo-1556742111-a301076d9d18?w=800&q=80'
                    alt='Payments'
                    className='relative rounded-xl shadow-2xl z-10 rotate-2 hover:rotate-0 transition-transform duration-500'
                  />
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      <section className='py-16 bg-[#202c39] text-white'>
        <div className='max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-white/10'>
          {[
            { number: '20%', label: 'More bookings per customer' },
            { number: '5hrs', label: 'Saved per week on admin' },
            { number: '30%', label: 'Revenue growth in year 1' }
          ].map((stat, idx) => (
            <ScrollReveal key={idx} delay={idx * 100} animation='fade-up' className='text-center px-4 pt-8 md:pt-0'>
              <div className='text-5xl font-bold text-[#77b6a3] mb-2'>{stat.number}</div>
              <p className='text-gray-300 font-medium'>{stat.label}</p>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* 3.5. Testimonials Section (Social Proof) */}
      <TestimonialsSection />

      {/* 4. Features Slider (Conceptual - Simple Grid for MVP) */}
      <section className='py-24 bg-white dark:bg-[#0a2c24] relative overflow-hidden'>
        <ZWatermark className='opacity-[0.03] top-10 right-0' />
        <div className='max-w-7xl mx-auto px-4 text-center mb-16'>
          <h2 className='text-3xl md:text-5xl font-bold text-[#202c39] dark:text-white mb-6'>
            Everything you need to run your business
          </h2>
          <p className='text-xl text-gray-500 max-w-3xl mx-auto'>
            From marketing tools to staff management, Zerv has you covered.
          </p>
        </div>

        <div className='max-w-7xl mx-auto px-4 overflow-x-auto pb-8 hide-scrollbar'>
          <div className='flex gap-6 min-w-max'>
            {[
              { title: 'Marketing Tools', icon: 'ri-megaphone-fill', color: 'bg-purple-100 text-purple-600' },
              { title: 'Client Management', icon: 'ri-user-heart-fill', color: 'bg-blue-100 text-blue-600' },
              { title: 'Staff Scheduling', icon: 'ri-team-fill', color: 'bg-orange-100 text-orange-600' },
              { title: 'Inventory', icon: 'ri-store-2-fill', color: 'bg-green-100 text-green-600' },
              { title: 'Analytics', icon: 'ri-bar-chart-fill', color: 'bg-red-100 text-red-600' }
            ].map((feature, idx) => (
              <ScrollReveal key={idx} delay={idx * 100} animation='fade-up'>
                <div className='w-72 h-80 bg-[#f7f8f9] dark:bg-[#202c39] rounded-3xl p-8 flex flex-col justify-between hover:-translate-y-2 transition-transform duration-300 shadow-sm hover:shadow-xl'>
                  <div
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl ${feature.color} mb-6`}
                  >
                    <i className={feature.icon}></i>
                  </div>
                  <div>
                    <h3 className='text-xl font-bold text-[#202c39] dark:text-white mb-2'>{feature.title}</h3>
                    <p className='text-sm text-gray-500'>Powerful tools designed to simplify your daily operations.</p>
                    <Button
                      variant='text'
                      className='self-start px-0 mt-4 group'
                      buttonText={{ plainText: 'Learn more' }}
                      suffixIcon={{
                        icon: 'ri-arrow-right-line',
                        className: 'ml-2 group-hover:translate-x-1 transition-transform'
                      }}
                    />
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Business Types (Bubble Grid) */}
      <section className='py-20 bg-[#f7f8f9] dark:bg-[#0a2c24]'>
        <div className='max-w-7xl mx-auto px-4 text-center'>
          <h2 className='text-2xl md:text-3xl font-bold text-[#202c39] dark:text-white mb-12'>
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
                <div className='w-20 h-20 md:w-24 md:h-24 rounded-full bg-white dark:bg-[#202c39] shadow-md flex items-center justify-center text-3xl md:text-4xl text-[#77b6a3] group-hover:scale-110 group-hover:bg-[#77b6a3] group-hover:text-white transition-all duration-300'>
                  <i className={type.icon}></i>
                </div>
                <span className='font-medium text-[#202c39] dark:text-gray-300 group-hover:text-[#77b6a3] transition-colors'>
                  {type.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Onboarding Steps */}
      <section className='py-24 bg-white dark:bg-[#202c39]'>
        <div className='max-w-5xl mx-auto px-4'>
          <div className='text-center mb-16'>
            <h2 className='text-3xl md:text-4xl font-bold text-[#202c39] dark:text-white'>Get started in minutes</h2>
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
                className='text-center bg-white dark:bg-[#202c39]'
              >
                <div className='w-24 h-24 mx-auto bg-[#0a2c24] text-white rounded-full flex items-center justify-center text-3xl font-bold mb-6 ring-8 ring-white dark:ring-[#202c39]'>
                  {item.step}
                </div>
                <h3 className='text-xl font-bold text-[#202c39] dark:text-white mb-3'>{item.title}</h3>
                <p className='text-gray-500 leading-relaxed'>{item.desc}</p>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 6.5 Switching to Zerv Info */}
      {/* <section className='py-20 bg-[#f7f8f9] dark:bg-[#0a2c24] border-y border-gray-200 dark:border-gray-800'>
        <div className='max-w-4xl mx-auto px-4 text-center'>
          <ScrollReveal animation='fade-up'>
            <span className='inline-block px-4 py-1 rounded-full bg-blue-100 text-blue-600 font-bold text-sm mb-4'>
              Easy Migration
            </span>
            <h2 className='text-3xl font-bold text-[#202c39] dark:text-white mb-6'>Already using another platform?</h2>
            <p className='text-lg text-gray-600 dark:text-gray-300 mb-8'>
              Switching is easier than you think. We'll import your client list and appointments for free. Our team is
              here to help you every step of the way.
            </p>
            <Button
              variant='outlined'
              className='border-[#202c39] text-[#202c39] dark:border-white dark:text-white hover:bg-[#202c39] hover:text-white dark:hover:bg-white dark:hover:text-[#0a2c24] px-8 py-3 rounded-full font-bold'
              buttonText={{ plainText: 'Learn about switching' }}
            />
          </ScrollReveal>
        </div>
      </section> */}

      {/* 6.6 App Download Section */}
      <BusinessAppDownload />

      {/* 7. Final CTA */}
      <section className='py-24 bg-gradient-to-br from-[#0a2c24] to-[#1a4a3e] text-center px-4 relative overflow-hidden'>
        <div className='absolute inset-0 bg-[url("https://www.transparenttextures.com/patterns/cubes.png")] opacity-10' />
        <div className='relative z-10 max-w-3xl mx-auto space-y-8'>
          <h2 className='text-4xl md:text-5xl font-bold text-white'>Ready to level up?</h2>
          <p className='text-xl text-gray-200'>
            Join the community of professionals who trust Zerv to run their business.
          </p>
          <Button
            className='bg-[#77b6a3] hover:bg-[#5da891] text-white px-10 py-5 rounded-full text-xl font-bold shadow-2xl transform hover:-translate-y-1 transition-all'
            buttonText={{ plainText: 'Start your free trial' }}
          />
          <p className='text-sm text-gray-400'>No setup fees • Cancel anytime</p>
        </div>
      </section>
    </div>
  )
}
