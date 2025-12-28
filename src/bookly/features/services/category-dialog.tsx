'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box
} from '@mui/material'
import { useServicesStore } from './services-store'

export function CategoryDialog() {
  const {
    isCategoryDialogOpen,
    editingCategory,
    closeCategoryDialog,
    createCategory,
    updateCategory
  } = useServicesStore()

  const [name, setName] = useState('')
  const [error, setError] = useState('')

  // Reset form when dialog opens/closes or editing category changes
  useEffect(() => {
    if (isCategoryDialogOpen) {
      setName(editingCategory?.name || '')
      setError('')
    }
  }, [isCategoryDialogOpen, editingCategory])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const trimmedName = name.trim()

    if (!trimmedName) {
      setError('Category name is required')
      return
    }

    if (editingCategory) {
      updateCategory(editingCategory.id, { name: trimmedName })
    } else {
      createCategory(trimmedName)
    }

    closeCategoryDialog()
  }

  const handleClose = () => {
    closeCategoryDialog()
    setName('')
    setError('')
  }

  return (
    <Dialog
      open={isCategoryDialogOpen}
      onClose={handleClose}
      maxWidth='xs'
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {editingCategory ? 'Edit Category' : 'New Category'}
        </DialogTitle>

        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              autoFocus
              fullWidth
              label='Category Name'
              value={name}
              onChange={e => {
                setName(e.target.value)
                setError('')
              }}
              error={!!error}
              helperText={error}
              placeholder='e.g., Hair, Nails, Face'
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} color='inherit'>
            Cancel
          </Button>
          <Button type='submit' variant='contained'>
            {editingCategory ? 'Save' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
