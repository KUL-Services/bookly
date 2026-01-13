'use client'

// React Imports
import dynamic from 'next/dynamic'
import type { ApexOptions } from 'apexcharts'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

// Data Imports
import { mockBookings } from '@/bookly/data/mock-data'

const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'), { ssr: false })

const monthsBack = 6

function getMonthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

const RevenueOverview = () => {
  const now = new Date()

  // Build list of last N months
  const monthKeys: string[] = []
  const monthLabels: string[] = []
  for (let i = monthsBack - 1; i >= 0; i--) {
    const dt = new Date(now.getFullYear(), now.getMonth() - i, 1)
    monthKeys.push(getMonthKey(dt))
    monthLabels.push(dt.toLocaleString(undefined, { month: 'short' }))
  }

  const revenueByMonth = new Map<string, number>()
  const projectedByMonth = new Map<string, number>()
  for (const key of monthKeys) {
    revenueByMonth.set(key, 0)
    projectedByMonth.set(key, 0)
  }

  mockBookings.forEach(b => {
    const key = getMonthKey(new Date(b.date))
    if (!revenueByMonth.has(key)) return
    if (b.status === 'completed') revenueByMonth.set(key, (revenueByMonth.get(key) || 0) + b.price)
    if (b.status === 'confirmed') projectedByMonth.set(key, (projectedByMonth.get(key) || 0) + b.price)
  })

  const series = [
    { name: 'Revenue', data: monthKeys.map(k => Number((revenueByMonth.get(k) || 0).toFixed(2))) },
    { name: 'Projected', data: monthKeys.map(k => Number((projectedByMonth.get(k) || 0).toFixed(2))) }
  ]

  const options: ApexOptions = {
    chart: {
      type: 'area',
      toolbar: { show: false },
      sparkline: { enabled: false }
    },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 3 },
    xaxis: {
      categories: monthLabels,
      labels: {
        style: {
          fontFamily: 'var(--font-fira-code)'
        }
      }
    },
    yaxis: {
      labels: {
        formatter: val => `$${val.toFixed(0)}`,
        style: {
          fontFamily: 'var(--font-fira-code)'
        }
      }
    },
    fill: { type: 'gradient', gradient: { shadeIntensity: 0.6, opacityFrom: 0.4, opacityTo: 0.1 } },
    legend: { position: 'top', fontFamily: 'var(--font-fira-code)' }
  }

  // Summary KPIs
  const last30 = mockBookings.filter(b => {
    const d = new Date(b.date)
    return b.status === 'completed' && now.getTime() - d.getTime() <= 30 * 24 * 60 * 60 * 1000
  })
  const total30 = last30.reduce((sum, b) => sum + b.price, 0)
  const aov = last30.length ? total30 / last30.length : 0
  const cancelled30 = mockBookings.filter(b => {
    const d = new Date(b.date)
    return b.status === 'cancelled' && now.getTime() - d.getTime() <= 30 * 24 * 60 * 60 * 1000
  }).length
  const totalBookings30 = mockBookings.filter(b => {
    const d = new Date(b.date)
    return now.getTime() - d.getTime() <= 30 * 24 * 60 * 60 * 1000
  }).length
  const cancellationRate = totalBookings30 ? (cancelled30 / totalBookings30) * 100 : 0

  return (
    <Card>
      <CardHeader
        title='Revenue Overview'
        subheader={
          <Typography variant='body2' color='text.secondary' sx={{ fontFamily: 'var(--font-fira-code)' }}>
            Completed vs projected (last 6 months)
          </Typography>
        }
      />
      <CardContent>
        <Box className='mb-4 flex flex-wrap gap-2'>
          <Chip
            label={`Last 30d: $${total30.toFixed(0)}`}
            color='primary'
            variant='tonal'
            sx={{ '& .MuiChip-label': { fontFamily: 'var(--font-fira-code)' } }}
          />
          <Chip
            label={`AOV: $${aov.toFixed(0)}`}
            color='success'
            variant='tonal'
            sx={{ '& .MuiChip-label': { fontFamily: 'var(--font-fira-code)' } }}
          />
          <Chip
            label={`Cancel rate: ${cancellationRate.toFixed(1)}%`}
            color='warning'
            variant='tonal'
            sx={{ '& .MuiChip-label': { fontFamily: 'var(--font-fira-code)' } }}
          />
        </Box>
        <AppReactApexCharts type='area' height={280} width='100%' options={options} series={series} />
      </CardContent>
    </Card>
  )
}

export default RevenueOverview
