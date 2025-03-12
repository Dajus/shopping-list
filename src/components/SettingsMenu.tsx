'use client'
import { useState } from 'react'
import {
  IconButton,
  Menu,
  MenuItem,
  Typography,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Divider,
  Tooltip,
} from '@mui/material'
import SettingsIcon from '@mui/icons-material/Settings'
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep'
import ChecklistIcon from '@mui/icons-material/Checklist'
import Brightness4Icon from '@mui/icons-material/Brightness4'
import Brightness7Icon from '@mui/icons-material/Brightness7'

interface SettingsMenuProps {
  mode: 'light' | 'dark'
  toggleTheme: () => void
  deleteAllItems: () => Promise<void>
  deleteCompletedItems: () => Promise<void>
  hasItems: boolean
  hasCompletedItems: boolean
}

export default function SettingsMenu({
  mode,
  toggleTheme,
  deleteAllItems,
  deleteCompletedItems,
  hasItems,
  hasCompletedItems,
}: SettingsMenuProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [deleteAction, setDeleteAction] = useState<'all' | 'completed'>('all')

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleCloseMenu = () => {
    setAnchorEl(null)
  }

  const handleThemeToggle = () => {
    toggleTheme()
    handleCloseMenu()
  }

  const handleDeleteClick = (type: 'all' | 'completed') => {
    setDeleteAction(type)
    setConfirmDialogOpen(true)
    handleCloseMenu()
  }

  const handleConfirmDelete = async () => {
    if (deleteAction === 'all') {
      await deleteAllItems()
    } else {
      await deleteCompletedItems()
    }
    setConfirmDialogOpen(false)
  }

  const handleCancelDelete = () => {
    setConfirmDialogOpen(false)
  }

  return (
    <>
      <IconButton
        onClick={handleOpenMenu}
        color="inherit"
        aria-label="nastavení"
        aria-controls={open ? 'settings-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
      >
        <SettingsIcon />
      </IconButton>

      <Menu
        id="settings-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleCloseMenu}
        MenuListProps={{
          'aria-labelledby': 'settings-button',
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleThemeToggle}>
          <ListItemIcon>
            {mode === 'dark' ? <Brightness7Icon fontSize="small" /> : <Brightness4Icon fontSize="small" />}
          </ListItemIcon>
          <Typography variant="inherit">
            {mode === 'dark' ? 'Přepnout na světlý režim' : 'Přepnout na tmavý režim'}
          </Typography>
        </MenuItem>

        <Divider />

        <Tooltip title={hasCompletedItems ? '' : 'Žádné dokončené položky k vymazání'}>
          <div>
            <MenuItem
              onClick={() => handleDeleteClick('completed')}
              disabled={!hasCompletedItems}
              sx={{
                opacity: !hasCompletedItems ? 0.5 : 1,
                cursor: !hasCompletedItems ? 'not-allowed' : 'pointer',
              }}
            >
              <ListItemIcon>
                <ChecklistIcon fontSize="small" />
              </ListItemIcon>
              <Typography variant="inherit">Vymazat dokončené položky</Typography>
            </MenuItem>
          </div>
        </Tooltip>

        <Tooltip title={hasItems ? '' : 'Žádné položky k vymazání'}>
          <div>
            <MenuItem
              onClick={() => handleDeleteClick('all')}
              disabled={!hasItems}
              sx={{
                opacity: !hasItems ? 0.5 : 1,
                cursor: !hasItems ? 'not-allowed' : 'pointer',
              }}
            >
              <ListItemIcon>
                <DeleteSweepIcon fontSize="small" />
              </ListItemIcon>
              <Typography variant="inherit">Vymazat všechny položky</Typography>
            </MenuItem>
          </div>
        </Tooltip>
      </Menu>

      {/* Potvrzovací dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={handleCancelDelete}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {deleteAction === 'all' ? 'Vymazat všechny položky?' : 'Vymazat dokončené položky?'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {deleteAction === 'all'
              ? 'Opravdu chcete vymazat všechny položky z nákupního seznamu? Tuto akci nelze vrátit zpět.'
              : 'Opravdu chcete vymazat všechny dokončené položky z nákupního seznamu? Tuto akci nelze vrátit zpět.'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} color="primary">
            Zrušit
          </Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus>
            {deleteAction === 'all' ? 'Vymazat vše' : 'Vymazat dokončené'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
