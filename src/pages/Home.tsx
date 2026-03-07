import { useState, useEffect } from 'react';
import { Typography, Box, Grid, CircularProgress, Alert, Container, Button, ToggleButtonGroup, ToggleButton, Paper, List, ListItem, ListItemText, Chip } from '@mui/material';
import { ViewModule, ViewList, ChevronRight } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { getTechniques } from '../services/db';
import type { Technique } from '../types';
import TechniqueCard from '../components/techniques/TechniqueCard';
import { db } from '../firebase/config';
import { collection, writeBatch, doc } from 'firebase/firestore';

const sampleTechniques: Omit<Technique, 'id'>[] = [
    {
        name: "Armbar from Closed Guard",
        description: "A fundamental submission from the bottom position. Control the opponent's posture, isolate the arm, swing the legs over the head and extend the hips to force a tap.",
        type: "submission",
        images: ["https://images.unsplash.com/photo-1564415315949-7a0c4c73aab4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
        connectedTechniques: []
    },
    {
        name: "Triangle Choke",
        description: "A blood choke applied using your legs. Requires isolating one of the opponent's arms inside your leg loop while their other arm is outside.",
        type: "submission",
        images: ["https://images.unsplash.com/photo-1599058917212-97d9cb64ce46?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
        connectedTechniques: []
    },
    {
        name: "Scissor Sweep",
        description: "A basic but effective sweep from closed guard using a scissor motion with the legs after securing collar and sleeve grips.",
        type: "position",
        images: ["https://images.unsplash.com/photo-1555597673-b21d5c935865?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
        connectedTechniques: []
    },
    {
        name: "Kimura from Side Control",
        description: "A shoulder lock applied by isolating the opponent's near side arm using a figure-four grip.",
        type: "submission",
        images: ["https://images.unsplash.com/photo-1517438322307-e67111335449?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
        connectedTechniques: []
    },
    {
        name: "Rear Naked Choke (RNC)",
        description: "The ultimate submission in grappling. Applied from the back mount, trapping the opponent's neck in a V-shaped grip with the arms.",
        type: "submission",
        images: ["https://images.unsplash.com/photo-1555597408-26bc8e548a46?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
        connectedTechniques: []
    },
    {
        name: "Shrimp Escape (Hip Escape)",
        description: "The most important fundamental movement in BJJ. Used to create space, escape pins like side control or mount, and recover guard.",
        type: "escape",
        images: ["https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
        connectedTechniques: []
    },
    {
        name: "Knee Slice Guard Pass",
        description: "A very common guard pass where you drive your knee across the opponent's thigh to pin their hips and bypass their legs into side control.",
        type: "position",
        images: ["https://images.unsplash.com/photo-1574680096145-d05b474e2155?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
        connectedTechniques: []
    },
    {
        name: "Guillotine Choke",
        description: "A front headlock submission used when an opponent leaves their head exposed, typically during a takedown attempt or from guard.",
        type: "submission",
        images: ["https://images.unsplash.com/photo-1564415315949-7a0c4c73aab4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
        connectedTechniques: []
    }
];

const Home = () => {
    const [techniques, setTechniques] = useState<Technique[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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

    const handleSeedData = async () => {
        try {
            setLoading(true);
            const batch = writeBatch(db);
            sampleTechniques.forEach((tech) => {
                const docRef = doc(collection(db, 'techniques'));
                batch.set(docRef, tech);
            });
            await batch.commit();
            await fetchTechniques();
        } catch (err) {
            console.error(err);
            setError('Failed to seed data.');
        }
    };

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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
                <Typography variant="h3" component="h1">
                    BJJ Techniques
                </Typography>

                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    {techniques.length === 0 && (
                        <Button variant="outlined" color="primary" onClick={handleSeedData}>
                            Add Sample Data
                        </Button>
                    )}

                    {techniques.length > 0 && (
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
                    )}
                </Box>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>}

            {techniques.length === 0 && !error ? (
                <Alert severity="info" sx={{ mt: 4 }}>
                    No techniques found. Click "Add Sample Data" to populate the database.
                </Alert>
            ) : viewMode === 'grid' ? (
                <Grid container spacing={3}>
                    {techniques.map((technique) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={technique.id}>
                            <TechniqueCard technique={technique} />
                        </Grid>
                    ))}
                </Grid>
            ) : (
                <Paper variant="outlined" sx={{ borderRadius: 2 }}>
                    <List disablePadding>
                        {techniques.map((technique, index) => (
                            <ListItem
                                key={technique.id}
                                divider={index < techniques.length - 1}
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
