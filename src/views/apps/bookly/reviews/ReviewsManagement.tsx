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
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'

// API Imports
import type { Review, Service, User } from '@/lib/api'
import { ReviewsService } from '@/lib/api/services/reviews.service'

interface ExtendedReview extends Review {
  user: User
  service: Service
}

const ReviewsManagement = () => {
  const [reviews, setReviews] = useState<ExtendedReview[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tabValue, setTabValue] = useState(0)

  // Dialog State
  const [replyDialogOpen, setReplyDialogOpen] = useState(false)
  const [flagDialogOpen, setFlagDialogOpen] = useState(false)
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [flagReason, setFlagReason] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  const fetchReviews = async () => {
    try {
      setLoading(true)
      setError(null)

      const result = await ReviewsService.getReviews()
      const data = Array.isArray(result.data) ? result.data : (result.data as any)?.data || []

      const mapped: ExtendedReview[] = data.map((r: any) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment || r.review || '',
        userId: r.userId || r.user?.id || '',
        serviceId: r.serviceId || r.service?.id || '',
        user: r.user || {
          id: r.userId || '',
          firstName: 'Customer',
          lastName: '',
          email: '',
          verified: false,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt
        },
        service: r.service || {
          id: r.serviceId || '',
          name: 'Service',
          description: '',
          location: '',
          price: 0,
          duration: 0,
          businessId: '',
          createdAt: r.createdAt,
          updatedAt: r.updatedAt
        },
        createdAt: r.createdAt,
        updatedAt: r.updatedAt
      }))

      setReviews(mapped)
    } catch (err) {
      console.error('Failed to fetch reviews:', err)
      setReviews([])
      setError('Failed to load reviews. Please try again.')
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
    const avgRating = total > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / total : 0

    return { total, positive, neutral, negative, avgRating }
  }

  const handleReplyClick = (reviewId: string) => {
    setSelectedReviewId(reviewId)
    setReplyText('')
    setReplyDialogOpen(true)
  }

  const handleFlagClick = (reviewId: string) => {
    setSelectedReviewId(reviewId)
    setFlagReason('')
    setFlagDialogOpen(true)
  }

  const submitReply = async () => {
    if (!selectedReviewId || !replyText.trim()) return

    setActionLoading(true)
    try {
      const result = await ReviewsService.replyToReview(selectedReviewId, replyText)
      // Assuming result returns the updated review or success
      // Ideally we update the local state to show the reply or just close
      console.log('Reply submitted', result)
      setReplyDialogOpen(false)
      fetchReviews() // Refresh list
    } catch (err) {
      console.error('Failed to reply', err)
      // Show error snackbar?
    } finally {
      setActionLoading(false)
    }
  }

  const submitFlag = async () => {
    if (!selectedReviewId || !flagReason.trim()) return

    setActionLoading(true)
    try {
      const result = await ReviewsService.flagReview(selectedReviewId, flagReason)
      console.log('Review flagged', result)
      setFlagDialogOpen(false)
      fetchReviews()
    } catch (err) {
      console.error('Failed to flag', err)
    } finally {
      setActionLoading(false)
    }
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
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <i
                  className='ri-chat-smile-3-line'
                  style={{ fontSize: 48, opacity: 0.3, display: 'block', marginBottom: 16 }}
                />
                <Typography variant='h6' color='textSecondary'>
                  {reviews.length === 0 ? 'No reviews yet' : 'No reviews found'}
                </Typography>
                <Typography variant='body2' color='textSecondary' sx={{ mt: 0.5 }}>
                  {reviews.length === 0
                    ? 'Reviews from your customers will appear here'
                    : 'No reviews match the current filter'}
                </Typography>
                {reviews.length === 0 && error && (
                  <Button variant='outlined' size='small' sx={{ mt: 2 }} onClick={fetchReviews}>
                    Retry
                  </Button>
                )}
              </Box>
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
                              {review.user.verified && (
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
                              onClick={() => handleReplyClick(review.id)}
                              title='Reply to review'
                            >
                              <i className='ri-reply-line' />
                            </IconButton>
                            <IconButton
                              size='small'
                              color='warning'
                              onClick={() => handleFlagClick(review.id)}
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

      {/* Reply Dialog */}
      <Dialog open={replyDialogOpen} onClose={() => setReplyDialogOpen(false)} fullWidth maxWidth='sm'>
        <DialogTitle>Reply to Review</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin='dense'
            label='Your Reply'
            fullWidth
            multiline
            rows={4}
            value={replyText}
            onChange={e => setReplyText(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReplyDialogOpen(false)}>Cancel</Button>
          <Button onClick={submitReply} variant='contained' disabled={actionLoading || !replyText.trim()}>
            {actionLoading ? 'Sending...' : 'Send Reply'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Flag Dialog */}
      <Dialog open={flagDialogOpen} onClose={() => setFlagDialogOpen(false)} fullWidth maxWidth='sm'>
        <DialogTitle>Flag Review</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin='dense'
            label='Reason for flagging'
            fullWidth
            multiline
            rows={3}
            value={flagReason}
            onChange={e => setFlagReason(e.target.value)}
            placeholder='e.g. Inappropriate content, spam, etc.'
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFlagDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={submitFlag}
            variant='contained'
            color='warning'
            disabled={actionLoading || !flagReason.trim()}
          >
            {actionLoading ? 'Flagging...' : 'Flag Review'}
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  )
}

export default ReviewsManagement
