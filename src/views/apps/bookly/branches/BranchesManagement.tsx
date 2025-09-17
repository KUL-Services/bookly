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
import { BranchesService, ServicesService } from '@/lib/api'
import type { Branch, Service } from '@/lib/api'

// Component Imports
import CreateBranchDialog from './CreateBranchDialog'
import EditBranchDialog from './EditBranchDialog'

const BranchesManagement = () => {
  const [branches, setBranches] = useState<Branch[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      const [branchesResponse, servicesResponse] = await Promise.all([
        BranchesService.getBranches(),
        ServicesService.getServices()
      ])

      if (branchesResponse.error) {
        throw new Error(branchesResponse.error)
      }
      if (servicesResponse.error) {
        throw new Error(servicesResponse.error)
      }

      setBranches(branchesResponse.data || [])
      setServices(servicesResponse.data || [])
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

  const handleCreateBranch = async (branchData: any) => {
    try {
      const response = await BranchesService.createBranch(branchData)
      if (response.error) {
        throw new Error(response.error)
      }
      await fetchData() // Refresh the list
      setCreateDialogOpen(false)
    } catch (err) {
      console.error('Failed to create branch:', err)
    }
  }

  const handleEditBranch = async (branchData: any) => {
    try {
      const response = await BranchesService.updateBranch(branchData)
      if (response.error) {
        throw new Error(response.error)
      }
      await fetchData() // Refresh the list
      setEditDialogOpen(false)
      setSelectedBranch(null)
    } catch (err) {
      console.error('Failed to update branch:', err)
    }
  }

  const handleDeleteBranch = async (branchId: string) => {
    if (!confirm('Are you sure you want to delete this branch?')) {
      return
    }

    try {
      const response = await BranchesService.deleteBranch(branchId)
      if (response.error) {
        throw new Error(response.error)
      }
      await fetchData() // Refresh the list
    } catch (err) {
      console.error('Failed to delete branch:', err)
    }
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
            title='Branches Management'
            subheader='Manage your business locations'
            action={
              <Button
                variant='contained'
                onClick={() => setCreateDialogOpen(true)}
                startIcon={<i className='ri-add-line' />}
              >
                Add Branch
              </Button>
            }
          />
          <CardContent>
            {error && (
              <Alert severity='error' className='mb-4'>
                {error}
              </Alert>
            )}

            {branches.length === 0 ? (
              <div className='text-center py-8'>
                <Typography variant='h6' color='textSecondary'>
                  No branches found
                </Typography>
                <Typography variant='body2' color='textSecondary'>
                  Create your first branch location to get started
                </Typography>
              </div>
            ) : (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Branch Name</TableCell>
                    <TableCell>Address</TableCell>
                    <TableCell>Mobile</TableCell>
                    <TableCell>Services</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell align='center'>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {branches.map((branch) => (
                    <TableRow key={branch.id} hover>
                      <TableCell>
                        <Typography variant='subtitle2'>{branch.name}</Typography>
                      </TableCell>
                      <TableCell>
                        {branch.address || 'No address provided'}
                      </TableCell>
                      <TableCell>
                        {branch.mobile || 'No mobile number'}
                      </TableCell>
                      <TableCell>
                        <div className='flex flex-wrap gap-1'>
                          {branch.services?.length ? (
                            branch.services.map((service) => (
                              <Chip key={service.id} label={service.name} size='small' variant='outlined' />
                            ))
                          ) : (
                            <Typography variant='body2' color='textSecondary'>
                              No services
                            </Typography>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(branch.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell align='center'>
                        <IconButton
                          size='small'
                          onClick={() => {
                            setSelectedBranch(branch)
                            setEditDialogOpen(true)
                          }}
                        >
                          <i className='ri-edit-line' />
                        </IconButton>
                        <IconButton
                          size='small'
                          color='error'
                          onClick={() => handleDeleteBranch(branch.id)}
                        >
                          <i className='ri-delete-bin-line' />
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

      {/* Create Branch Dialog */}
      <CreateBranchDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSubmit={handleCreateBranch}
        services={services}
      />

      {/* Edit Branch Dialog */}
      {selectedBranch && (
        <EditBranchDialog
          open={editDialogOpen}
          onClose={() => {
            setEditDialogOpen(false)
            setSelectedBranch(null)
          }}
          onSubmit={handleEditBranch}
          branch={selectedBranch}
          services={services}
        />
      )}
    </Grid>
  )
}

export default BranchesManagement