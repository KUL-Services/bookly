'use client'

import { useState, useEffect } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'
import Rating from '@mui/material/Rating'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import { TableSkeleton } from '@/components/LoadingStates'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'

// API Imports
import type { Review, Service, User } from '@/lib/api'

interface ExtendedReview extends Review {
  user: User
  service: Service
}

const ReviewsManagement = () => {
  const [reviews, setReviews] = useState<ExtendedReview[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tabValue, setTabValue] = useState(0)

  const fetchReviews = async () => {
    try {
      setLoading(true)

      // Mock comprehensive reviews data
      const mockReviews: ExtendedReview[] = [
        {
          id: '1',
          rating: 5,
          comment:
            'Absolutely fantastic service! The haircut exceeded my expectations. Maria is incredibly skilled and professional. I will definitely be coming back!',
          userId: 'user1',
          serviceId: 'service1',
          user: {
            id: 'user1',
            firstName: 'Sarah',
            lastName: 'Johnson',
            email: 'sarah.johnson@email.com',
            isVerified: true,
            createdAt: new Date('2024-01-10').toISOString(),
            updatedAt: new Date('2024-01-10').toISOString()
          },
          service: {
            id: 'service1',
            name: 'Premium Hair Cut',
            description: 'Professional haircut with styling',
            location: 'Downtown Branch',
            price: 45,
            duration: 60,
            businessId: 'business1',
            createdAt: new Date('2024-01-01').toISOString(),
            updatedAt: new Date('2024-01-01').toISOString()
          },
          createdAt: new Date('2024-01-25').toISOString(),
          updatedAt: new Date('2024-01-25').toISOString()
        },
        {
          id: '2',
          rating: 4,
          comment:
            'Great experience overall. The manicure was well done and the staff was friendly. Only minor issue was the wait time, but worth it!',
          userId: 'user2',
          serviceId: 'service2',
          user: {
            id: 'user2',
            firstName: 'Emily',
            lastName: 'Chen',
            email: 'emily.chen@email.com',
            isVerified: true,
            createdAt: new Date('2024-01-15').toISOString(),
            updatedAt: new Date('2024-01-15').toISOString()
          },
          service: {
            id: 'service2',
            name: 'Classic Manicure',
            description: 'Professional nail care and polish',
            location: 'Westside Branch',
            price: 25,
            duration: 30,
            businessId: 'business1',
            createdAt: new Date('2024-01-01').toISOString(),
            updatedAt: new Date('2024-01-01').toISOString()
          },
          createdAt: new Date('2024-01-24').toISOString(),
          updatedAt: new Date('2024-01-24').toISOString()
        },
        {
          id: '3',
          rating: 3,
          comment:
            'Service was okay. The staff could be more attentive and the facilities need some updating. Not bad but room for improvement.',
          userId: 'user3',
          serviceId: 'service3',
          user: {
            id: 'user3',
            firstName: 'Michael',
            lastName: 'Brown',
            email: 'michael.brown@email.com',
            isVerified: true,
            createdAt: new Date('2024-01-20').toISOString(),
            updatedAt: new Date('2024-01-20').toISOString()
          },
          service: {
            id: 'service3',
            name: 'Facial Treatment',
            description: 'Relaxing facial with cleansing and moisturizing',
            location: 'Downtown Branch',
            price: 60,
            duration: 75,
            businessId: 'business1',
            createdAt: new Date('2024-01-01').toISOString(),
            updatedAt: new Date('2024-01-01').toISOString()
          },
          createdAt: new Date('2024-01-23').toISOString(),
          updatedAt: new Date('2024-01-23').toISOString()
        },
        {
          id: '4',
          rating: 5,
          comment:
            "Incredible massage therapy session! John really knows what he's doing. I felt completely relaxed and rejuvenated afterwards.",
          userId: 'user4',
          serviceId: 'service4',
          user: {
            id: 'user4',
            firstName: 'Jessica',
            lastName: 'Wilson',
            email: 'jessica.wilson@email.com',
            isVerified: true,
            createdAt: new Date('2024-01-12').toISOString(),
            updatedAt: new Date('2024-01-12').toISOString()
          },
          service: {
            id: 'service4',
            name: 'Therapeutic Massage',
            description: 'Deep tissue massage for relaxation and stress relief',
            location: 'Westside Branch',
            price: 90,
            duration: 90,
            businessId: 'business1',
            createdAt: new Date('2024-01-01').toISOString(),
            updatedAt: new Date('2024-01-01').toISOString()
          },
          createdAt: new Date('2024-01-22').toISOString(),
          updatedAt: new Date('2024-01-22').toISOString()
        },
        {
          id: '5',
          rating: 2,
          comment:
            "Disappointing experience. The service was rushed and the end result didn't meet my expectations. Staff seemed unprepared.",
          userId: 'user5',
          serviceId: 'service5',
          user: {
            id: 'user5',
            firstName: 'David',
            lastName: 'Lee',
            email: 'david.lee@email.com',
            isVerified: false,
            createdAt: new Date('2024-01-18').toISOString(),
            updatedAt: new Date('2024-01-18').toISOString()
          },
          service: {
            id: 'service5',
            name: 'Hair Coloring',
            description: 'Professional hair color treatment',
            location: 'Downtown Branch',
            price: 120,
            duration: 150,
            businessId: 'business1',
            createdAt: new Date('2024-01-01').toISOString(),
            updatedAt: new Date('2024-01-01').toISOString()
          },
          createdAt: new Date('2024-01-21').toISOString(),
          updatedAt: new Date('2024-01-21').toISOString()
        }
      ]

      setReviews(mockReviews)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch reviews')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [])

  const getFilteredReviews = () => {
    switch (tabValue) {
      case 0:
        return reviews // All
      case 1:
        return reviews.filter(r => r.rating >= 4) // Positive (4-5 stars)
      case 2:
        return reviews.filter(r => r.rating === 3) // Neutral (3 stars)
      case 3:
        return reviews.filter(r => r.rating <= 2) // Negative (1-2 stars)
      default:
        return reviews
    }
  }

  const getReviewStats = () => {
    const total = reviews.length
    const positive = reviews.filter(r => r.rating >= 4).length
    const neutral = reviews.filter(r => r.rating === 3).length
    const negative = reviews.filter(r => r.rating <= 2).length
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / total

    return { total, positive, neutral, negative, avgRating }
  }

  const handleReplyToReview = (reviewId: string) => {
    // Mock reply functionality
    console.log('Reply to review:', reviewId)
    // In real implementation, this would open a dialog to compose a reply
  }

  const handleFlagReview = (reviewId: string) => {
    // Mock flag functionality
    console.log('Flag review:', reviewId)
    // In real implementation, this would flag the review for moderation
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'success'
    if (rating === 3) return 'warning'
    return 'error'
  }

  if (loading) {
    return (
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <TableSkeleton rows={5} columns={6} />
        </Grid>
      </Grid>
    )
  }

  const stats = getReviewStats()
  const filteredReviews = getFilteredReviews()

  return (
    <Grid container spacing={6} className='relative'>
      {/* Brand Background Graphic */}
      <div
        className='absolute top-0 right-0 w-[500px] h-[500px] pointer-events-none opacity-[0.03] z-0'
        style={{
          backgroundImage: "url('/brand/zerv-z.svg')",
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'top right',
          backgroundSize: 'contain',
          transform: 'rotate(-20deg) translate(20%, -20%)'
        }}
      />

      {/* Statistics Cards */}
      <Grid item xs={12} className='relative z-10'>
        <Grid container spacing={{ xs: 3, sm: 4 }}>
          <Grid item xs={6} sm={6} md={3}>
            <Card>
              <CardContent className='text-center' sx={{ py: { xs: 2, sm: 3 } }}>
                <Typography variant='h4' color='primary' sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                  {stats.total}
                </Typography>
                <Typography variant='body2' color='textSecondary' sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  Total Reviews
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={6} md={3}>
            <Card>
              <CardContent className='text-center' sx={{ py: { xs: 2, sm: 3 } }}>
                <Typography variant='h4' color='success.main' sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                  {stats.avgRating.toFixed(1)}
                </Typography>
                <Typography variant='body2' color='textSecondary' sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  Average Rating
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={6} md={3}>
            <Card>
              <CardContent className='text-center' sx={{ py: { xs: 2, sm: 3 } }}>
                <Typography variant='h4' color='success.main' sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                  {stats.positive}
                </Typography>
                <Typography variant='body2' color='textSecondary' sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  Positive Reviews
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={6} md={3}>
            <Card>
              <CardContent className='text-center' sx={{ py: { xs: 2, sm: 3 } }}>
                <Typography variant='h4' color='error.main' sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                  {stats.negative}
                </Typography>
                <Typography variant='body2' color='textSecondary' sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  Negative Reviews
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>

      {/* Reviews Management */}
      <Grid item xs={12} className='relative z-10'>
        <Card>
          <CardHeader
            title='Reviews Management'
            subheader={
              <Typography variant='body2' color='text.secondary'>
                Manage customer reviews and feedback
              </Typography>
            }
          />
          <CardContent>
            {error && (
              <Alert severity='error' className='mb-4'>
                {error}
              </Alert>
            )}

            {/* Filter Tabs */}
            <Box className='mb-4'>
              <Tabs
                value={tabValue}
                onChange={(e, newValue) => setTabValue(newValue)}
                indicatorColor='primary'
                textColor='primary'
              >
                <Tab label={`All (${stats.total})`} sx={{ fontFamily: 'inherit' }} />
                <Tab label={`Positive (${stats.positive})`} sx={{ fontFamily: 'inherit' }} />
                <Tab label={`Neutral (${stats.neutral})`} sx={{ fontFamily: 'inherit' }} />
                <Tab label={`Negative (${stats.negative})`} sx={{ fontFamily: 'inherit' }} />
              </Tabs>
            </Box>

            {filteredReviews.length === 0 ? (
              <div className='text-center py-8'>
                <Typography variant='h6' color='textSecondary'>
                  No reviews found
                </Typography>
                <Typography variant='body2' color='textSecondary'>
                  No reviews match the current filter
                </Typography>
              </div>
            ) : (
              <div className='overflow-x-auto'>
                <Table sx={{ minWidth: { xs: 800, md: 'auto' } }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Customer</TableCell>
                      <TableCell>Service</TableCell>
                      <TableCell>Rating</TableCell>
                      <TableCell>Comment</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell align='center'>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredReviews.map(review => (
                      <TableRow key={review.id} hover>
                        <TableCell>
                          <Box className='flex items-center gap-3' sx={{ minWidth: 180 }}>
                            <Avatar>
                              {review.user.firstName[0]}
                              {review.user.lastName[0]}
                            </Avatar>
                            <div>
                              <Typography variant='subtitle2' sx={{ whiteSpace: 'nowrap' }}>
                                {review.user.firstName} {review.user.lastName}
                              </Typography>
                              <Typography
                                variant='caption'
                                color='textSecondary'
                                sx={{
                                  display: 'block',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  maxWidth: 150
                                }}
                              >
                                {review.user.email}
                              </Typography>
                              {review.user.isVerified && (
                                <Chip label='Verified' size='small' color='success' className='ml-1' />
                              )}
                            </div>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ minWidth: 140 }}>
                          <div>
                            <Typography variant='subtitle2' sx={{ whiteSpace: 'nowrap' }}>
                              {review.service.name}
                            </Typography>
                            <Typography variant='caption' color='textSecondary' sx={{ whiteSpace: 'nowrap' }}>
                              {review.service.location}
                            </Typography>
                          </div>
                        </TableCell>
                        <TableCell sx={{ minWidth: 180 }}>
                          <Box className='flex items-center gap-2'>
                            <Rating value={review.rating} readOnly size='small' />
                            <Chip
                              label={`${review.rating}/5`}
                              size='small'
                              color={getRatingColor(review.rating) as any}
                              sx={{ '& .MuiChip-label': { fontFamily: 'inherit' } }}
                            />
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant='body2'
                            sx={{
                              maxWidth: 250,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 3,
                              WebkitBoxOrient: 'vertical'
                            }}
                          >
                            {review.comment}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                          <Typography variant='body2'>{new Date(review.createdAt).toLocaleDateString()}</Typography>
                        </TableCell>
                        <TableCell align='center'>
                          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                            <IconButton
                              size='small'
                              color='primary'
                              onClick={() => handleReplyToReview(review.id)}
                              title='Reply to review'
                            >
                              <i className='ri-reply-line' />
                            </IconButton>
                            <IconButton
                              size='small'
                              color='warning'
                              onClick={() => handleFlagReview(review.id)}
                              title='Flag review'
                            >
                              <i className='ri-flag-line' />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default ReviewsManagement
