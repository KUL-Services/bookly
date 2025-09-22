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
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Chip from '@mui/material/Chip'

// API Imports
import { ServicesService, CategoriesService, BranchesService } from '@/lib/api'
import type { Service, Category, Branch } from '@/lib/api'

// Component Imports
import CreateServiceDialog from './CreateServiceDialog'
import EditServiceDialog from './EditServiceDialog'
import { TableSkeleton, LoadingOverlay } from '@/components/LoadingStates'
import { ErrorDisplay } from '@/components/ErrorComponents'

// Utils
import { extractErrorMessage, logError, withErrorHandling } from '@/utils/errorHandling'

const ServicesManagement = () => {
  const [services, setServices] = useState<Service[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<any>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchData = async () => {
    await withErrorHandling(async () => {
      setLoading(true)
      setError(null)
      setSuccess(null)

      const [servicesResponse, categoriesResponse, branchesResponse] = await Promise.all([
        ServicesService.getServices(),
        CategoriesService.getCategories(),
        BranchesService.getBranches()
      ])

      if (servicesResponse.error) {
        throw new Error(servicesResponse.error)
      }
      if (categoriesResponse.error) {
        throw new Error(categoriesResponse.error)
      }
      if (branchesResponse.error) {
        throw new Error(branchesResponse.error)
      }

      setServices(servicesResponse.data || [])
      setCategories(categoriesResponse.data || [])
      setBranches(branchesResponse.data || [])
    }, 'Failed to fetch services data').catch((err) => {
      logError(err, 'ServicesManagement.fetchData')
      setError(err)
    }).finally(() => {
      setLoading(false)
    })
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleCreateService = async (serviceData: any) => {
    await withErrorHandling(async () => {
      const response = await ServicesService.createService(serviceData)
      if (response.error) {
        throw new Error(response.error)
      }
      await fetchData()
      setCreateDialogOpen(false)
      setSuccess('Service created successfully!')
    }, 'Failed to create service').catch((err) => {
      logError(err, 'ServicesManagement.handleCreateService', { serviceData })
      setError(err)
    })
  }

  const handleEditService = async (serviceData: any) => {
    await withErrorHandling(async () => {
      const response = await ServicesService.updateService(serviceData)
      if (response.error) {
        throw new Error(response.error)
      }
      await fetchData()
      setEditDialogOpen(false)
      setSelectedService(null)
      setSuccess('Service updated successfully!')
    }, 'Failed to update service').catch((err) => {
      logError(err, 'ServicesManagement.handleEditService', { serviceData })
      setError(err)
    })
  }

  const handleDeleteService = async (serviceId: string) => {
    if (!confirm('Are you sure you want to delete this service?')) {
      return
    }

    setActionLoading(`delete-${serviceId}`)
    await withErrorHandling(async () => {
      const response = await ServicesService.deleteService(serviceId)
      if (response.error) {
        throw new Error(response.error)
      }
      await fetchData()
      setSuccess('Service deleted successfully!')
    }, 'Failed to delete service').catch((err) => {
      logError(err, 'ServicesManagement.handleDeleteService', { serviceId })
      setError(err)
    }).finally(() => {
      setActionLoading(null)
    })
  }

  const getCategoryNames = (categoryIds?: string[]) => {
    if (!categoryIds || categoryIds.length === 0) return 'No categories'
    return categoryIds
      .map(id => categories.find(cat => cat.id === id)?.name)
      .filter(Boolean)
      .join(', ')
  }

  const getBranchNames = (branchIds?: string[]) => {
    if (!branchIds || branchIds.length === 0) return 'No branches'
    return branchIds
      .map(id => branches.find(branch => branch.id === id)?.name)
      .filter(Boolean)
      .join(', ')
  }

  if (loading) {
    return (
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <TableSkeleton rows={6} columns={5} />
        </Grid>
      </Grid>
    )
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader
            title='Services Management'
            subheader='Manage your business services'
            action={
              <Button
                variant='contained'
                onClick={() => setCreateDialogOpen(true)}
                startIcon={<i className='ri-add-line' />}
              >
                Add Service
              </Button>
            }
          />
          <CardContent>
            {error && (
              <ErrorDisplay
                error={error}
                onRetry={fetchData}
                context="Services Management"
                showDetails={false}
              />
            )}

            {success && (
              <Alert severity="success" className="mb-4" onClose={() => setSuccess(null)}>
                {success}
              </Alert>
            )}

            {services.length === 0 ? (
              <div className='text-center py-8'>
                <Typography variant='h6' color='textSecondary'>
                  No services found
                </Typography>
                <Typography variant='body2' color='textSecondary'>
                  Create your first service to get started
                </Typography>
              </div>
            ) : (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Service Name</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell align='right'>Duration (min)</TableCell>
                    <TableCell align='right'>Price ($)</TableCell>
                    <TableCell>Categories</TableCell>
                    <TableCell>Branches</TableCell>
                    <TableCell align='center'>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {services.map((service) => (
                    <TableRow key={service.id} hover>
                      <TableCell>
                        <Typography variant='subtitle2'>{service.name}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant='body2' className='max-w-xs truncate'>
                          {service.description || 'No description'}
                        </Typography>
                      </TableCell>
                      <TableCell>{service.location}</TableCell>
                      <TableCell align='right'>{service.duration}</TableCell>
                      <TableCell align='right'>${service.price}</TableCell>
                      <TableCell>
                        <div className='flex flex-wrap gap-1'>
                          {service.categories?.map((category) => (
                            <Chip key={category.id} label={category.name} size='small' variant='outlined' />
                          )) || 'No categories'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='flex flex-wrap gap-1'>
                          {service.branches?.map((branch) => (
                            <Chip key={branch.id} label={branch.name} size='small' variant='outlined' />
                          )) || 'No branches'}
                        </div>
                      </TableCell>
                      <TableCell align='center'>
                        <IconButton
                          size='small'
                          onClick={() => {
                            setSelectedService(service)
                            setEditDialogOpen(true)
                          }}
                        >
                          <i className='ri-edit-line' />
                        </IconButton>
                        <IconButton
                          size='small'
                          color='error'
                          onClick={() => handleDeleteService(service.id)}
                          disabled={actionLoading === `delete-${service.id}`}
                        >
                          {actionLoading === `delete-${service.id}` ? (
                            <CircularProgress size={16} />
                          ) : (
                            <i className='ri-delete-bin-line' />
                          )}
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

      {/* Create Service Dialog */}
      <CreateServiceDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSubmit={handleCreateService}
        categories={categories}
        branches={branches}
      />

      {/* Edit Service Dialog */}
      {selectedService && (
        <EditServiceDialog
          open={editDialogOpen}
          onClose={() => {
            setEditDialogOpen(false)
            setSelectedService(null)
          }}
          onSubmit={handleEditService}
          service={selectedService}
          categories={categories}
          branches={branches}
        />
      )}
    </Grid>
  )
}

export default ServicesManagement