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
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'

// API Imports
import { CategoriesService } from '@/lib/api'
import type { Category } from '@/lib/api'

const CategoriesManagement = () => {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await CategoriesService.getCategories()

      if (response.error) {
        throw new Error(response.error)
      }

      setCategories(response.data || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch categories')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

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
            title='Categories'
            subheader={`Available service categories (${categories.length})`}
          />
          <CardContent>
            {error && (
              <Alert severity='error' className='mb-4'>
                {error}
              </Alert>
            )}

            {categories.length === 0 ? (
              <div className='text-center py-8'>
                <Typography variant='h6' color='textSecondary'>
                  No categories found
                </Typography>
                <Typography variant='body2' color='textSecondary'>
                  Categories are managed by super administrators
                </Typography>
              </div>
            ) : (
              <Table size='small'>
                <TableHead>
                  <TableRow>
                    <TableCell>Category</TableCell>
                    <TableCell>Slug</TableCell>
                    <TableCell>Created</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow key={category.id} hover>
                      <TableCell className='flex items-center gap-3'>
                        <Avatar
                          src={category.image}
                          className='w-8 h-8'
                        >
                          {category.icon || category.name.charAt(0).toUpperCase()}
                        </Avatar>
                        <div>
                          <Typography variant='subtitle2'>{category.name}</Typography>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Typography variant='body2' color='textSecondary'>
                          {category.slug || category.name.toLowerCase().replace(/\s+/g, '-')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {new Date(category.createdAt).toLocaleDateString()}
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

export default CategoriesManagement