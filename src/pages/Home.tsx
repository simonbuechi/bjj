import { useState, useEffect } from 'react';
import { Typography, Box, Grid, CircularProgress, Alert, Container, ToggleButtonGroup, ToggleButton, Paper, List, ListItem, ListItemText, Chip, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { ViewModule, ViewList, ChevronRight } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { getTechniques } from '../services/db';
import type { Technique, TechniqueType } from '../types';
import TechniqueCard from '../components/techniques/TechniqueCard';



const Home = () => {
    const [techniques, setTechniques] = useState<Technique[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [filter, setFilter] = useState<TechniqueType | 'all'>('all');

    const displayedTechniques = techniques.filter(
        tech => filter === 'all' || tech.type === filter
    );

    const fetchTechniques = async () => {
        try {
            setLoading(true);
            const data = await getTechniques();
            setTechniques(data);
        } catch (err) {
            console.error(err);
            setError('Failed to load techniques.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTechniques();
    }, []);



    const handleViewChange = (
        _event: React.MouseEvent<HTMLElement>,
        newView: 'grid' | 'list' | null,
    ) => {
        if (newView !== null) {
            setViewMode(newView);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="lg">
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
                {techniques.length > 0 && (
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <FormControl size="small" sx={{ minWidth: 200 }}>
                            <InputLabel id="technique-filter-label">Filter by Type</InputLabel>
                            <Select
                                labelId="technique-filter-label"
                                id="technique-filter"
                                value={filter}
                                label="Filter by Type"
                                onChange={(e) => setFilter(e.target.value as TechniqueType | 'all')}
                                sx={{ textTransform: 'capitalize' }}
                            >
                                <MenuItem value="all">All Types</MenuItem>
                                <MenuItem value="position" sx={{ textTransform: 'capitalize' }}>Position</MenuItem>
                                <MenuItem value="submission" sx={{ textTransform: 'capitalize' }}>Submission</MenuItem>
                                <MenuItem value="escape" sx={{ textTransform: 'capitalize' }}>Escape</MenuItem>
                                <MenuItem value="guard pass" sx={{ textTransform: 'capitalize' }}>Guard Pass</MenuItem>
                                <MenuItem value="sweep" sx={{ textTransform: 'capitalize' }}>Sweep</MenuItem>
                                <MenuItem value="frame" sx={{ textTransform: 'capitalize' }}>Frame</MenuItem>
                            </Select>
                        </FormControl>

                        <ToggleButtonGroup
                            value={viewMode}
                            exclusive
                            onChange={handleViewChange}
                            aria-label="view mode"
                            size="small"
                        >
                            <ToggleButton value="grid" aria-label="grid view">
                                <ViewModule />
                            </ToggleButton>
                            <ToggleButton value="list" aria-label="list view">
                                <ViewList />
                            </ToggleButton>
                        </ToggleButtonGroup>
                    </Box>
                )}
            </Box>

            {error && <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>}

            {techniques.length === 0 && !error ? (
                <Alert severity="info" sx={{ mt: 4 }}>
                    No techniques found. Log in to add some techniques to the database.
                </Alert>
            ) : displayedTechniques.length === 0 ? (
                <Alert severity="info" sx={{ mt: 2 }}>
                    No techniques match the selected filter.
                </Alert>
            ) : viewMode === 'grid' ? (
                <Grid container spacing={3}>
                    {displayedTechniques.map((technique) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={technique.id}>
                            <TechniqueCard technique={technique} />
                        </Grid>
                    ))}
                </Grid>
            ) : (
                <Paper variant="outlined" sx={{ borderRadius: 2 }}>
                    <List disablePadding>
                        {displayedTechniques.map((technique, index) => (
                            <ListItem
                                key={technique.id}
                                divider={index < displayedTechniques.length - 1}
                                component={RouterLink}
                                to={`/techniques/${technique.id}`}
                                sx={{
                                    textDecoration: 'none',
                                    color: 'inherit',
                                    '&:hover': { bgcolor: 'action.hover' },
                                    py: 2
                                }}
                            >
                                <ListItemText
                                    primary={
                                        <Typography variant="h6" component="div">
                                            {technique.name}
                                        </Typography>
                                    }
                                    secondary={
                                        <Typography variant="body2" color="text.secondary" noWrap sx={{ mt: 1 }}>
                                            {technique.description}
                                        </Typography>
                                    }
                                />
                                <Box sx={{ display: 'flex', alignItems: 'center', ml: 2, gap: 2 }}>
                                    <Chip
                                        label={technique.type}
                                        size="small"
                                        color="primary"
                                        variant="outlined"
                                        sx={{ textTransform: 'capitalize', display: { xs: 'none', sm: 'flex' } }}
                                    />
                                    <ChevronRight color="action" />
                                </Box>
                            </ListItem>
                        ))}
                    </List>
                </Paper>
            )}
        </Container>
    );
};

export default Home;
