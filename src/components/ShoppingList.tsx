'use client'
import { useState, useEffect, useRef } from 'react'
import {
  Container,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  IconButton,
  Checkbox,
  Paper,
  Divider,
  Stack,
  useTheme as useMuiTheme,
  Box,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import RefreshIcon from '@mui/icons-material/Refresh'
import { ShoppingItem } from '@/app/api/shopping-list/data-service'
import { useTheme } from '@/components/ThemeProvider'
import SettingsMenu from '@/components/SettingsMenu'

export default function ShoppingList() {
  const [items, setItems] = useState<ShoppingItem[]>([])
  const [newItemName, setNewItemName] = useState('')
  const [newItemDescription, setNewItemDescription] = useState('')
  const [loading, setLoading] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const nameInputRef = useRef<HTMLInputElement>(null)

  // Získání tématu z kontextu
  const { mode, toggleTheme } = useTheme()
  const muiTheme = useMuiTheme()

  // Načtení seznamu
  const fetchItems = async () => {
    try {
      const response = await fetch('/api/shopping-list')
      const data = await response.json()
      setItems(data.items || [])
      setLoading(false)
    } catch (error) {
      console.error('Chyba při načítání položek:', error)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchItems()

    // Nastavení auto-refresh každých 20 sekund
    const interval = setInterval(() => {
      fetchItems()
    }, 20000)

    setRefreshInterval(interval)

    return () => {
      if (refreshInterval) clearInterval(refreshInterval)
    }
  }, [])

  useEffect(() => {
    if (isAdding && nameInputRef.current) {
      nameInputRef.current.focus()
    }
  }, [isAdding])

  const addItem = async () => {
    if (!newItemName.trim()) return

    try {
      await fetch('/api/shopping-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newItemName,
          quantity: 1, // Defaultní hodnota, už nepoužíváme
          description: newItemDescription,
        }),
      })

      setNewItemName('')
      setNewItemDescription('')

      if (nameInputRef.current) {
        nameInputRef.current.focus()
      }

      fetchItems()
    } catch (error) {
      console.error('Chyba při přidávání položky:', error)
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      addItem()
    } else if (event.key === 'Escape') {
      setIsAdding(false)
      setNewItemName('')
      setNewItemDescription('')
    }
  }

  const toggleItem = async (id: string, completed: boolean) => {
    try {
      await fetch('/api/shopping-list', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, completed: !completed }),
      })
      fetchItems()
    } catch (error) {
      console.error('Chyba při označování položky:', error)
    }
  }

  const deleteItem = async (id: string) => {
    try {
      await fetch(`/api/shopping-list?id=${id}`, {
        method: 'DELETE',
      })
      fetchItems()
    } catch (error) {
      console.error('Chyba při mazání položky:', error)
    }
  }

  const deleteAllItems = async () => {
    try {
      await fetch('/api/shopping-list/clear', {
        method: 'DELETE',
      })
      fetchItems()
    } catch (error) {
      console.error('Chyba při mazání všech položek:', error)
    }
  }

  const deleteCompletedItems = async () => {
    try {
      await fetch('/api/shopping-list/clear-completed', {
        method: 'DELETE',
      })
      fetchItems()
    } catch (error) {
      console.error('Chyba při mazání dokončených položek:', error)
    }
  }

  const refreshList = () => {
    setLoading(true)
    fetchItems()
  }

  const getBackgroundPattern = () => {
    const dotColor = mode === 'dark' ? '444444' : '9C92AC'
    const bgColor = muiTheme.palette.background.default

    return {
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23${dotColor}' fill-opacity='0.2' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E")`,
      backgroundColor: bgColor,
      minHeight: '100vh',
      width: '100%',
      padding: '20px',
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getDate()}.${date.getMonth() + 1}.`
  }

  const hasItems = items.length > 0
  const hasCompletedItems = items.some((item) => item.completed)

  return (
    <Stack sx={getBackgroundPattern()}>
      <Stack display="flex" justifyContent="center" alignItems="center" mt={{ xs: 2, sm: 4 }}>
        <Container maxWidth="sm" sx={{ padding: 0 }}>
          <Paper elevation={7} sx={{ p: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h5" component="h1" gutterBottom>
                Nákupní seznam
              </Typography>
              <Stack direction="row" alignItems="center">
                <IconButton onClick={refreshList} color="primary" aria-label="obnovit seznam" sx={{ mr: 1 }}>
                  <RefreshIcon />
                </IconButton>
                <SettingsMenu
                  mode={mode}
                  toggleTheme={toggleTheme}
                  deleteAllItems={deleteAllItems}
                  deleteCompletedItems={deleteCompletedItems}
                  hasItems={hasItems}
                  hasCompletedItems={hasCompletedItems}
                />
              </Stack>
            </Stack>

            {/* Inline přidávací formulář */}
            {isAdding ? (
              <Stack spacing={2} mb={3}>
                <TextField
                  inputRef={nameInputRef}
                  fullWidth
                  label="Co je potřeba koupit?"
                  variant="outlined"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Např. Mléko"
                  size="small"
                />
                <TextField
                  fullWidth
                  label="Poznámka (volitelné)"
                  variant="outlined"
                  value={newItemDescription}
                  onChange={(e) => setNewItemDescription(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Např. 2 litry, polotučné"
                  size="small"
                  multiline
                  rows={2}
                />
                <Stack direction="row" spacing={2}>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setIsAdding(false)
                      setNewItemName('')
                      setNewItemDescription('')
                    }}
                  >
                    Zrušit
                  </Button>
                  <Button variant="contained" color="primary" onClick={addItem} disabled={!newItemName.trim()}>
                    Přidat položku
                  </Button>
                </Stack>
              </Stack>
            ) : (
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                fullWidth
                onClick={() => setIsAdding(true)}
                sx={{ mb: 3 }}
              >
                Přidat položku
              </Button>
            )}

            <Divider sx={{ mb: 2 }} />

            {loading ? (
              <Typography align="center" sx={{ py: 3 }}>
                Načítání...
              </Typography>
            ) : (
              <List>
                {items.length === 0 ? (
                  <Typography align="center" color="textSecondary" sx={{ py: 3 }}>
                    Seznam je prázdný
                  </Typography>
                ) : (
                  items.map((item) => (
                    <ListItem
                      key={item.id}
                      divider
                      sx={{ py: 1, px: 1 }}
                      onClick={() => toggleItem(item.id, item.completed)}
                      secondaryAction={
                        <IconButton
                          edge="end"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteItem(item.id)
                          }}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      }
                    >
                      <Checkbox
                        checked={item.completed || false}
                        onChange={(e) => {
                          e.stopPropagation()
                          toggleItem(item.id, item.completed)
                        }}
                        edge="start"
                      />

                      <Stack direction="row" spacing={1} sx={{ width: '100%', alignItems: 'center' }}>
                        <Box sx={{ flexGrow: 1, maxWidth: 'calc(100% - 80px)' }}>
                          <Typography
                            variant="body1"
                            sx={{
                              textDecoration: item.completed ? 'line-through' : 'none',
                              color: item.completed ? 'text.secondary' : 'text.primary',
                            }}
                          >
                            {item.name} {item.quantity > 1 ? `(${item.quantity}x)` : ''}
                          </Typography>

                          {item.description && (
                            <Typography
                              variant="body2"
                              sx={{
                                textDecoration: item.completed ? 'line-through' : 'none',
                                color: item.completed ? 'text.disabled' : 'text.secondary',
                              }}
                            >
                              {item.description}
                            </Typography>
                          )}
                        </Box>

                        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

                        <Typography
                          variant="caption"
                          sx={{
                            color: 'text.disabled',
                            whiteSpace: 'nowrap',
                            minWidth: '35%',
                            textAlign: 'left',
                          }}
                          suppressHydrationWarning
                        >
                          {formatDate(item.createdAt)}
                        </Typography>
                      </Stack>
                    </ListItem>
                  ))
                )}
              </List>
            )}
          </Paper>
        </Container>
      </Stack>
    </Stack>
  )
}
