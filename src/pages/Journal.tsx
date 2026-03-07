import { useState, useEffect } from 'react';
import {
    Typography, Box, Container, Paper, TextField,
    Button, CircularProgress, Alert, Grid, Divider,
    List, Chip, Autocomplete, MenuItem, FormControlLabel, Switch, Rating
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { getJournalEntries, createJournalEntry, getTechniques } from '../services/db';
import type { JournalEntry, Technique, SessionType } from '../types';

const SESSION_TYPES: SessionType[] = ['Regular class', 'Private class', 'Open mat', 'Seminar', 'Camp', 'Competition'];

const Journal = () => {
    const { currentUser } = useAuth();

    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const [allTechniques, setAllTechniques] = useState<Technique[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // New entry form state
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [time, setTime] = useState('');
    const [isGi, setIsGi] = useState(true);
    const [length, setLength] = useState<number | ''>(90);
    const [sessionType, setSessionType] = useState<SessionType>('Regular class');
    const [intensity, setIntensity] = useState<number | null>(3);

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
                time,
                isGi,
                length: length || undefined,
                sessionType,
                intensity: intensity || undefined,
                comment,
                techniqueIds: selectedTechniques.map(t => t.id)
            };

            const newId = await createJournalEntry(currentUser.uid, newEntryData);

            // Update local state
            setEntries(prev => [{ id: newId, userId: currentUser.uid, ...newEntryData }, ...prev]);

            // Reset form
            setComment('');
            setSelectedTechniques([]);
            setLength(90);
            setIntensity(3);
            setIsGi(true);
            setSessionType('Regular class');

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
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, sm: 6 }}>
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
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <TextField
                                        label="Time"
                                        type="time"
                                        fullWidth
                                        margin="normal"
                                        value={time}
                                        onChange={(e) => setTime(e.target.value)}
                                        InputLabelProps={{ shrink: true }}
                                    />
                                </Grid>
                            </Grid>

                            <Grid container spacing={2} sx={{ mt: 1, mb: 1 }}>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <TextField
                                        select
                                        label="Session Type"
                                        fullWidth
                                        value={sessionType}
                                        onChange={(e) => setSessionType(e.target.value as SessionType)}
                                    >
                                        {SESSION_TYPES.map((type) => (
                                            <MenuItem key={type} value={type}>
                                                {type}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <TextField
                                        label="Length (min)"
                                        type="number"
                                        fullWidth
                                        value={length}
                                        onChange={(e) => setLength(e.target.value === '' ? '' : Number(e.target.value))}
                                        inputProps={{ min: 0, step: 15 }}
                                    />
                                </Grid>
                            </Grid>

                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, mt: 1 }}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={isGi}
                                            onChange={(e) => setIsGi(e.target.checked)}
                                            color="primary"
                                        />
                                    }
                                    label={isGi ? "Gi" : "No-Gi"}
                                />

                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Typography component="legend" sx={{ mr: 2 }}>Intensity</Typography>
                                    <Rating
                                        name="intensity"
                                        value={intensity}
                                        onChange={(_, newValue) => setIntensity(newValue)}
                                    />
                                </Box>
                            </Box>

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
                                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                        <Typography variant="h6" color="primary">
                                            {new Date(entry.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                                            {entry.time && ` • ${entry.time}`}
                                        </Typography>
                                    </Box>

                                    <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                                        <Chip
                                            size="small"
                                            label={entry.isGi !== false ? 'Gi' : 'No-Gi'}
                                            color={entry.isGi !== false ? 'primary' : 'secondary'}
                                            variant="outlined"
                                        />
                                        {entry.sessionType && (
                                            <Chip size="small" label={entry.sessionType} variant="outlined" />
                                        )}
                                        {entry.length && (
                                            <Chip size="small" label={`${entry.length} min`} variant="outlined" />
                                        )}
                                        {entry.intensity && (
                                            <Chip
                                                size="small"
                                                icon={<Rating value={entry.intensity} readOnly size="small" max={5} sx={{ fontSize: '1rem', ml: 0.5 }} />}
                                                label={`Intensity`}
                                                variant="outlined"
                                                sx={{ '& .MuiChip-icon': { color: 'gold' } }}
                                            />
                                        )}
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
