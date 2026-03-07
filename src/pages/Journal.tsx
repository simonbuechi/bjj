import { useState, useEffect } from 'react';
import {
    Typography, Box, Container, Paper, TextField,
    Button, CircularProgress, Alert, Grid, Divider,
    List, Chip, Autocomplete
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { getJournalEntries, createJournalEntry, getTechniques } from '../services/db';
import type { JournalEntry, Technique } from '../types';

const Journal = () => {
    const { currentUser } = useAuth();

    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const [allTechniques, setAllTechniques] = useState<Technique[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // New entry form state
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [comment, setComment] = useState('');
    const [selectedTechniques, setSelectedTechniques] = useState<Technique[]>([]);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!currentUser) return;
            try {
                setLoading(true);
                const [entriesData, techniquesData] = await Promise.all([
                    getJournalEntries(currentUser.uid),
                    getTechniques()
                ]);
                setEntries(entriesData);
                setAllTechniques(techniquesData);
            } catch (err) {
                console.error(err);
                setError('Failed to load journal data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [currentUser]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) return;

        try {
            setSubmitting(true);
            setError('');

            const newEntryData = {
                date,
                comment,
                techniqueIds: selectedTechniques.map(t => t.id)
            };

            const newId = await createJournalEntry(currentUser.uid, newEntryData);

            // Update local state
            setEntries(prev => [{ id: newId, userId: currentUser.uid, ...newEntryData }, ...prev]);

            // Reset form
            setComment('');
            setSelectedTechniques([]);

        } catch (err) {
            console.error(err);
            setError('Failed to save journal entry');
        } finally {
            setSubmitting(false);
        }
    };

    // Helper to get technique name by ID
    const getTechniqueName = (id: string) => {
        const t = allTechniques.find(tech => tech.id === id);
        return t ? t.name : 'Unknown Technique';
    };

    if (loading) return <Box display="flex" justifyContent="center" mt={8}><CircularProgress /></Box>;

    return (
        <Container maxWidth="lg">
            <Grid container spacing={4}>

                {/* New Entry Form */}
                <Grid size={{ xs: 12, md: 5 }}>
                    <Paper elevation={3} sx={{ p: 3, borderRadius: 2, position: 'sticky', top: 24 }}>
                        <Typography variant="h5" component="h2" gutterBottom>
                            Log Session
                        </Typography>
                        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                        <form onSubmit={handleSubmit}>
                            <TextField
                                label="Date"
                                type="date"
                                fullWidth
                                margin="normal"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                required
                                InputLabelProps={{ shrink: true }}
                            />

                            <Autocomplete
                                multiple
                                options={allTechniques}
                                getOptionLabel={(option) => option.name}
                                value={selectedTechniques}
                                onChange={(_, newValue) => setSelectedTechniques(newValue)}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        variant="outlined"
                                        label="Techniques Covered"
                                        placeholder="Search techniques..."
                                        margin="normal"
                                    />
                                )}
                                sx={{ mb: 2, mt: 1 }}
                            />

                            <TextField
                                label="Notes / Comments"
                                multiline
                                rows={4}
                                fullWidth
                                margin="normal"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="What went well? What needs work?"
                            />

                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                fullWidth
                                size="large"
                                disabled={submitting}
                                sx={{ mt: 2 }}
                            >
                                {submitting ? 'Saving...' : 'Save Entry'}
                            </Button>
                        </form>
                    </Paper>
                </Grid>

                {/* Journal Entries List */}
                <Grid size={{ xs: 12, md: 7 }}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        Training History
                    </Typography>
                    <Divider sx={{ mb: 3 }} />

                    {entries.length === 0 ? (
                        <Alert severity="info" variant="outlined">
                            No journal entries yet. Start logging your training sessions!
                        </Alert>
                    ) : (
                        <List sx={{ p: 0 }}>
                            {entries.map((entry) => (
                                <Paper key={entry.id} variant="outlined" sx={{ mb: 2, p: 2, borderRadius: 2 }}>
                                    <Box display="flex" justifyContent="space-between" mb={1}>
                                        <Typography variant="h6" color="primary">
                                            {new Date(entry.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                                        </Typography>
                                    </Box>

                                    {entry.techniqueIds && entry.techniqueIds.length > 0 && (
                                        <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                                            {entry.techniqueIds.map(id => (
                                                <Chip key={id} label={getTechniqueName(id)} size="small" variant="outlined" />
                                            ))}
                                        </Box>
                                    )}

                                    {entry.comment && (
                                        <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                                            {entry.comment}
                                        </Typography>
                                    )}
                                </Paper>
                            ))}
                        </List>
                    )}
                </Grid>
            </Grid>
        </Container>
    );
};

export default Journal;
