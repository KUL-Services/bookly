'use client'

import React from 'react'
import { LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/bookly/lib/utils'

interface FeatureItem {
  name: string
  description?: string
}

interface FeaturesSectionProps {
  title: string
  icon?: LucideIcon
  color?: string
  features: FeatureItem[]
  imagePosition?: 'left' | 'right' // In case we want to add images later
  className?: string
  index?: number // For alternate styling if needed
}

export const FeaturesSection: React.FC<FeaturesSectionProps> = ({
  title,
  icon: Icon,
  color = 'bg-[#77b6a3]', // Default Zerv green
  features,
  className,
  index = 0
}) => {
  const isEven = index % 2 === 0

  return (
    <section
      className={cn(
        'py-20 px-4 md:px-8',
        isEven ? 'bg-white dark:bg-[#0a2c24]' : 'bg-[#f7f8f9] dark:bg-[#0d362d]',
        className
      )}
    >
      <div className='max-w-7xl mx-auto'>
        <div className='flex flex-col md:flex-row gap-12 items-start'>
          {/* Header Column */}
          <div className='w-full md:w-1/3 flex flex-col gap-6 sticky top-24'>
            <div className='flex items-center gap-4'>
              {Icon && (
                <div className={cn('p-3 rounded-full text-white shadow-lg', color)}>
                  <Icon size={32} />
                </div>
              )}
              <h2 className='text-3xl md:text-4xl font-bold text-[#202c39] dark:text-white'>{title}</h2>
            </div>
            <div className='h-1 w-20 bg-gray-200 dark:bg-gray-700 rounded-full' />
          </div>

          {/* Features Grid Column */}
          <div className='w-full md:w-2/3'>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
              {features.map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                  viewport={{ once: true }}
                  className='bg-white dark:bg-[#154036] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow'
                >
                  <h3 className='text-xl font-bold text-[#202c39] dark:text-white mb-2'>{feature.name}</h3>
                  {feature.description && (
                    <p className='text-gray-600 dark:text-gray-300 leading-relaxed'>{feature.description}</p>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
