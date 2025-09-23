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
import Avatar from '@mui/material/Avatar'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'

// API Imports
import { BusinessService, CategoriesService } from '@/lib/api'
import type { Business, Category } from '@/lib/api'

const BusinessManagement = () => {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      const [businessesResponse, categoriesResponse] = await Promise.all([
        BusinessService.getApprovedBusinesses(),
        CategoriesService.getCategories()
      ])

      if (businessesResponse.error) {
        throw new Error(businessesResponse.error)
      }
      if (categoriesResponse.error) {
        throw new Error(categoriesResponse.error)
      }

      setBusinesses(businessesResponse.data || [])
      setCategories(categoriesResponse.data || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const getCategoryName = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId)?.name || 'Unknown'
  }

  if (loading) {
    return (
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <CardContent className='flex justify-center items-center py-12'>
              <CircularProgress />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    )
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader
            title='Businesses'
            subheader={`Approved businesses (${businesses.length})`}
          />
          <CardContent>
            {error && (
              <Alert severity='error' className='mb-4'>
                {error}
              </Alert>
            )}

            {businesses.length === 0 ? (
              <div className='text-center py-8'>
                <Typography variant='h6' color='textSecondary'>
                  No businesses found
                </Typography>
                <Typography variant='body2' color='textSecondary'>
                  No approved businesses available
                </Typography>
              </div>
            ) : (
              <Table size='small'>
                <TableHead>
                  <TableRow>
                    <TableCell>Business</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell align='center'>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {businesses.map((business) => (
                    <TableRow key={business.id} hover>
                      <TableCell className='flex items-center gap-3'>
                        <Avatar
                          alt={business.name}
                          src={business.logoUrl}
                          className='w-10 h-10'
                        >
                          {business.name.charAt(0).toUpperCase()}
                        </Avatar>
                        <div>
                          <Typography variant='subtitle2'>{business.name}</Typography>
                          {business.description && (
                            <Typography variant='caption' color='textSecondary' className='block max-w-xs truncate'>
                              {business.description}
                            </Typography>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{business.email || 'No email'}</TableCell>
                      <TableCell>
                        <Chip
                          label={business.isApproved ? 'Approved' : 'Pending'}
                          color={business.isApproved ? 'success' : 'warning'}
                          size='small'
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(business.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell align='center'>
                        <IconButton size='small'>
                          <i className='ri-eye-line' />
                        </IconButton>
                        <IconButton size='small'>
                          <i className='ri-edit-line' />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default BusinessManagement