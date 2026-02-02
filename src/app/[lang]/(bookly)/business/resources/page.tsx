'use client'

import { useTranslation } from 'react-i18next'
import { Button } from '@/bookly/components/molecules'
import { ScrollReveal } from '@/bookly/components/molecules/scroll-reveal'

export default function BusinessResourcesPage() {
  const { t } = useTranslation()

  const resources = [
    {
      title: 'Help Center',
      description: 'Find guides, tutorials, and answers to common questions.',
      icon: 'ri-question-answer-fill',
      link: '#',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      title: 'Business Blog',
      description: 'Tips, trends, and success stories to help you grow.',
      icon: 'ri-article-fill',
      link: '#',
      color: 'bg-purple-100 text-purple-600'
    },
    {
      title: 'Webinars',
      description: 'Live sessions and recordings to master Zerv features.',
      icon: 'ri-video-chat-fill',
      link: '#',
      color: 'bg-orange-100 text-orange-600'
    },
    {
      title: 'Community',
      description: 'Connect with other professionals and share experiences.',
      icon: 'ri-group-fill',
      link: '#',
      color: 'bg-green-100 text-green-600'
    }
  ]

  return (
    <div className='overflow-hidden bg-[#f7f8f9] dark:bg-[#0a2c24] min-h-screen'>
      {/* Hero */}
      <section className='pt-32 pb-16 px-4 text-center'>
        <ScrollReveal animation='fade-up'>
          <h1 className='text-4xl md:text-6xl font-bold text-[#202c39] dark:text-white mb-6'>
            Resources to help you succeed
          </h1>
          <p className='text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto'>
            Everything you need to master Zerv and grow your business.
          </p>
        </ScrollReveal>
      </section>

      {/* Resource Grid */}
      <section className='pb-24 px-4 max-w-7xl mx-auto'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
          {resources.map((resource, idx) => (
            <ScrollReveal key={idx} delay={idx * 100} animation='fade-up'>
              <div className='bg-white dark:bg-[#202c39] p-8 rounded-3xl shadow-lg hover:shadow-xl transition-shadow flex flex-col md:flex-row gap-6 items-start'>
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl ${resource.color} flex-shrink-0`}
                >
                  <i className={resource.icon}></i>
                </div>
                <div className='flex-1'>
                  <h3 className='text-2xl font-bold text-[#202c39] dark:text-white mb-2'>{resource.title}</h3>
                  <p className='text-gray-500 dark:text-gray-400 mb-6'>{resource.description}</p>
                  <Button
                    variant='text'
                    className='px-0 group'
                    buttonText={{ plainText: 'Explore ' + resource.title }}
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
      </section>

      {/* CTA */}
      <section className='py-20 bg-[#0a2c24] text-white text-center'>
        <div className='max-w-4xl mx-auto px-4'>
          <h2 className='text-3xl font-bold mb-6'>Can't find what you're looking for?</h2>
          <Button
            className='bg-[#77b6a3] hover:bg-[#5da891] text-white px-8 py-3 rounded-full font-bold'
            buttonText={{ plainText: 'Contact Support' }}
          />
        </div>
      </section>
    </div>
  )
}
