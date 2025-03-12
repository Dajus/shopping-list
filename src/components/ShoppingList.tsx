'use client';
import { useState, useEffect } from 'react';
import {
    Container, Typography, Box, TextField, Button, List,
    ListItem, ListItemText, ListItemSecondaryAction, IconButton,
    Checkbox, Paper, Divider,
    Dialog, DialogTitle, DialogContent, DialogActions, Stack
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import {ShoppingItem} from "@/app/api/shopping-list/data-service";

export default function ShoppingList() {
    const [items, setItems] = useState<ShoppingItem[]>([]);
    const [newItemName, setNewItemName] = useState('');
    const [newItemQuantity, setNewItemQuantity] = useState(1);
    const [newItemDescription, setNewItemDescription] = useState('');
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

    // Načtení seznamu
    const fetchItems = async () => {
        try {
            const response = await fetch('/api/shopping-list');
            const data = await response.json();
            setItems(data.items || []);
            setLoading(false);
        } catch (error) {
            console.error('Chyba při načítání položek:', error);
            setLoading(false);
        }
    };

    // Načtení při prvním renderu a nastavení auto-refresh
    useEffect(() => {
        fetchItems();

        // Nastavení auto-refresh každých 10 sekund
        const interval = setInterval(() => {
            fetchItems();
        }, 10000);

        setRefreshInterval(interval);

        // Cleanup při unmount
        return () => {
            if (refreshInterval) clearInterval(refreshInterval);
        };
    }, []);

    // Přidání položky
    const addItem = async () => {
        if (!newItemName.trim()) return;

        try {
            await fetch('/api/shopping-list', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newItemName,
                    quantity: newItemQuantity,
                    description: newItemDescription
                })
            });

            // Reset formuláře
            setNewItemName('');
            setNewItemQuantity(1);
            setNewItemDescription('');
            setOpenDialog(false);

            fetchItems();
        } catch (error) {
            console.error('Chyba při přidávání položky:', error);
        }
    };

    // Označení položky jako hotové
    const toggleItem = async (id: string, completed: boolean) => {
        try {
            await fetch('/api/shopping-list', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, completed: !completed })
            });
            fetchItems();
        } catch (error) {
            console.error('Chyba při označování položky:', error);
        }
    };

    // Smazání položky
    const deleteItem = async (id: string) => {
        try {
            await fetch(`/api/shopping-list?id=${id}`, {
                method: 'DELETE',
            });
            fetchItems();
        } catch (error) {
            console.error('Chyba při mazání položky:', error);
        }
    };

    // Manuální obnovení seznamu
    const refreshList = () => {
        setLoading(true);
        fetchItems();
    };

    return (
       <Stack display="flex" justifyContent="center" alignItems="center" mt={{xs: 2, sm: 4}}>
           <Container maxWidth="sm" sx={{padding: 0}}>
               <Paper elevation={7} sx={{ p: 2 }}>
                   <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                       <Typography variant="h4" component="h1" gutterBottom>
                           Nákupní seznam
                       </Typography>
                       <IconButton onClick={refreshList} color="primary" aria-label="obnovit seznam">
                           <RefreshIcon />
                       </IconButton>
                   </Box>

                   <Button
                       variant="contained"
                       color="primary"
                       startIcon={<AddIcon />}
                       fullWidth
                       onClick={() => setOpenDialog(true)}
                       sx={{ mb: 3 }}
                   >
                       Přidat položku
                   </Button>

                   <Divider sx={{ mb: 2 }} />

                   {loading ? (
                       <Typography align="center" sx={{ py: 3 }}>Načítání...</Typography>
                   ) : (
                       <List>
                           {items.length === 0 ? (
                               <Typography align="center" color="textSecondary" sx={{ py: 3 }}>
                                   Seznam je prázdný
                               </Typography>
                           ) : (
                               items.map((item) => (
                                   <ListItem key={item.id} divider sx={{ py: 2 }} onClick={() => toggleItem(item.id, item.completed)}>
                                       <Checkbox
                                           checked={item.completed || false}
                                           onChange={(e) => {
                                               e.stopPropagation()
                                               toggleItem(item.id, item.completed)
                                           }}
                                           edge="start"
                                       />
                                       <ListItemText
                                           primary={
                                               <Typography
                                                   variant="body1"
                                                   sx={{
                                                       textDecoration: item.completed ? 'line-through' : 'none',
                                                       color: item.completed ? 'text.secondary' : 'text.primary'
                                                   }}
                                               >
                                                   {item.name} {item.quantity > 1 ? `(${item.quantity}x)` : ''}
                                               </Typography>
                                           }
                                           secondary={
                                               <Box component="div">
                                                   {item.description &&
                                                       <Typography
                                                           variant="body2"
                                                           sx={{
                                                               textDecoration: item.completed ? 'line-through' : 'none',
                                                               color: item.completed ? 'text.disabled' : 'text.secondary'
                                                           }}
                                                       >
                                                           {item.description}
                                                       </Typography>
                                                   }
                                                   <Typography
                                                       variant="caption"
                                                       sx={{
                                                           display: 'block',
                                                           mt: item.description ? 1 : 0,
                                                           color: 'text.disabled'
                                                       }}
                                                   >
                                                       Přidáno: {new Date(item.createdAt).toLocaleDateString('cs-CZ')}
                                                   </Typography>
                                               </Box>
                                           }
                                           secondaryTypographyProps={{
                                               sx: {
                                                   textDecoration: item.completed ? 'line-through' : 'none',
                                               }
                                           }}
                                       />
                                       <ListItemSecondaryAction>
                                           <IconButton edge="end" onClick={() => deleteItem(item.id)} color="error">
                                               <DeleteIcon />
                                           </IconButton>
                                       </ListItemSecondaryAction>
                                   </ListItem>
                               ))
                           )}
                       </List>
                   )}
               </Paper>

               {/* Dialog pro přidání nové položky */}
               <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                   <DialogTitle>Přidat položku do nákupního seznamu</DialogTitle>
                   <DialogContent>
                       <TextField
                           autoFocus
                           margin="dense"
                           id="name"
                           label="Jméno"
                           type="text"
                           fullWidth
                           variant="outlined"
                           value={newItemName}
                           onChange={(e) => setNewItemName(e.target.value)}
                           sx={{ mb: 2 }}
                       />
                       <TextField
                           margin="dense"
                           id="quantity"
                           label="Počet"
                           type="number"
                           fullWidth
                           variant="outlined"
                           value={newItemQuantity}
                           onChange={(e) => setNewItemQuantity(parseInt(e.target.value) || 1)}
                           InputProps={{
                               inputProps: { min: 1 }
                           }}
                           sx={{ mb: 2 }}
                       />
                       <TextField
                           margin="dense"
                           id="description"
                           label="Popisek (volitelné)"
                           type="text"
                           fullWidth
                           multiline
                           rows={2}
                           variant="outlined"
                           value={newItemDescription}
                           onChange={(e) => setNewItemDescription(e.target.value)}
                       />
                   </DialogContent>
                   <DialogActions>
                       <Button onClick={() => setOpenDialog(false)}>Zrušit</Button>
                       <Button onClick={addItem} variant="contained" color="primary">Přidat</Button>
                   </DialogActions>
               </Dialog>
           </Container>
       </Stack>
    );
}