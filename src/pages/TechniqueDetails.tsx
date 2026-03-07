import { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
    Typography, Box, CircularProgress, Container,
    Chip, Grid, Paper, Divider, Button, ToggleButtonGroup, ToggleButton
} from '@mui/material';
import { Favorite, MenuBook, ErrorOutline, School } from '@mui/icons-material';
import { getTechniqueById, getUserProfile, updateUserProfile } from '../services/db';
import type { Technique, UserProfile, MarkedStatus } from '../types';
import { useAuth } from '../context/AuthContext';

const TechniqueDetails = () => {
    const { id } = useParams<{ id: string }>();
    const { currentUser } = useAuth();

    const [technique, setTechnique] = useState<Technique | null>(null);
    const [connected, setConnected] = useState<Technique[]>([]);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            try {
                setLoading(true);
                const techData = await getTechniqueById(id);
                if (!techData) {
                    setError('Technique not found');
                    return;
                }
                setTechnique(techData);

                if (techData.connectedTechniques && techData.connectedTechniques.length > 0) {
                    const connectedPromises = techData.connectedTechniques.map(cid => getTechniqueById(cid));
                    const connectedResults = await Promise.all(connectedPromises);
                    setConnected(connectedResults.filter((t): t is Technique => t !== null));
                }

                if (currentUser) {
                    const userProf = await getUserProfile(currentUser.uid);
                    setProfile(userProf);
                }
            } catch (err) {
                console.error(err);
                setError('Failed to load technique details');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, currentUser]);

    const handleMarkChange = async (_event: React.MouseEvent<HTMLElement>, newStatus: MarkedStatus | null) => {
        if (!currentUser || !id) return;

        try {
            // Optimistic update
            const updatedProfile = { ...profile } as UserProfile;
            if (!updatedProfile.markedTechniques) {
                updatedProfile.markedTechniques = {};
            }

            if (newStatus === null) {
                delete updatedProfile.markedTechniques[id];
            } else {
                updatedProfile.markedTechniques[id] = newStatus;
            }

            setProfile(updatedProfile);
            await updateUserProfile(currentUser.uid, { markedTechniques: updatedProfile.markedTechniques });
        } catch (err) {
            console.error("Failed to update status", err);
            // Rollback is missing here for simplicity but could be added
        }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;
    if (error || !technique) return <Container><Typography color="error" mt={4}>{error || 'Not found'}</Typography></Container>;

    const currentStatus = profile?.markedTechniques?.[technique.id] || null;

    return (
        <Container maxWidth="lg">
            <Paper elevation={0} sx={{ p: { xs: 2, md: 4 }, bgcolor: 'background.paper', borderRadius: 2 }}>
                <Grid container spacing={4}>
                    <Grid size={{ xs: 12, md: 8 }}>
                        <Box mb={2}>
                            <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                                {technique.name}
                            </Typography>
                            <Chip
                                label={technique.type}
                                color="secondary"
                                variant="outlined"
                                sx={{ textTransform: 'capitalize' }}
                            />
                        </Box>

                        {technique.images && technique.images.length > 0 && (
                            <Box mb={4} sx={{ width: '100%', height: 300, bgcolor: 'action.disabledBackground', borderRadius: 2, overflow: 'hidden' }}>
                                <img
                                    src={technique.images[0]}
                                    alt={technique.name}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            </Box>
                        )}

                        <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>Description</Typography>
                        <Typography variant="body1" sx={{ whiteSpace: 'pre-line', lineHeight: 1.8 }}>
                            {technique.description}
                        </Typography>

                        {connected.length > 0 && (
                            <Box mt={6}>
                                <Typography variant="h5" gutterBottom>Connected Techniques</Typography>
                                <Divider sx={{ mb: 2 }} />
                                <Grid container spacing={2}>
                                    {connected.map(tech => (
                                        <Grid size={{ xs: 12, sm: 6 }} key={tech.id}>
                                            <Paper variant="outlined" sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                                                <Typography variant="subtitle1" fontWeight="bold">{tech.name}</Typography>
                                                <Typography variant="body2" color="text.secondary" noWrap mb={1}>{tech.description}</Typography>
                                                <Button component={RouterLink} to={`/techniques/${tech.id}`} size="small" variant="contained">
                                                    View Details
                                                </Button>
                                            </Paper>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>
                        )}
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                        <Paper variant="outlined" sx={{ p: 3, position: 'sticky', top: 24 }}>
                            <Typography variant="h6" gutterBottom>My Progress</Typography>
                            <Divider sx={{ mb: 3 }} />

                            {!currentUser ? (
                                <Box>
                                    <Typography variant="body2" color="text.secondary" mb={2}>
                                        Log in to mark this technique and track your progress.
                                    </Typography>
                                    <Button variant="outlined" fullWidth component={RouterLink} to="/login">
                                        Log In
                                    </Button>
                                </Box>
                            ) : (
                                <Box>
                                    <Typography variant="subtitle2" gutterBottom>Status Marker</Typography>
                                    <ToggleButtonGroup
                                        orientation="vertical"
                                        value={currentStatus}
                                        exclusive
                                        onChange={handleMarkChange}
                                        fullWidth
                                        size="small"
                                    >
                                        <ToggleButton value="favorite" aria-label="favorite">
                                            <Favorite sx={{ mr: 1, fontSize: 20 }} /> Favorite
                                        </ToggleButton>
                                        <ToggleButton value="currently learning" aria-label="learning">
                                            <School sx={{ mr: 1, fontSize: 20 }} /> Currently Learning
                                        </ToggleButton>
                                        <ToggleButton value="to learn" aria-label="to learn">
                                            <MenuBook sx={{ mr: 1, fontSize: 20 }} /> To Learn
                                        </ToggleButton>
                                        <ToggleButton value="error prone" aria-label="error prone">
                                            <ErrorOutline sx={{ mr: 1, fontSize: 20 }} /> Error Prone
                                        </ToggleButton>
                                    </ToggleButtonGroup>
                                </Box>
                            )}
                        </Paper>
                    </Grid>
                </Grid>
            </Paper>
        </Container>
    );
};

export default TechniqueDetails;
