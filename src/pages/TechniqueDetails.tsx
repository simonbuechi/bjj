import { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
    Typography, Box, CircularProgress, Container,
    Chip, Grid, Paper, Divider, Button, ToggleButton,
    List, ListItem, ListItemText, ListItemIcon, Rating,
    TextField
} from '@mui/material';
import { Favorite, MenuBook, School, EventNote, ArrowBack, EditNote } from '@mui/icons-material';
import { getTechniqueById, getUserProfile, updateUserProfile, getJournalEntries } from '../services/db';
import type { Technique, UserProfile, MarkedStatus, JournalEntry } from '../types';
import { useAuth } from '../context/AuthContext';

const updateTechniqueStatus = (
    profile: UserProfile,
    techniqueId: string,
    statusUpdate: Partial<MarkedStatus>
): Record<string, MarkedStatus> => {
    const currentStatus = profile.markedTechniques?.[techniqueId] || {};
    const updatedStatus = { ...currentStatus, ...statusUpdate };

    const isEmpty = !updatedStatus.favorite && !updatedStatus.learning && !updatedStatus.toLearn && !updatedStatus.skillLevel && !updatedStatus.notes;

    const updatedMarked = { ...(profile.markedTechniques || {}) };
    if (isEmpty) {
        delete updatedMarked[techniqueId];
    } else {
        updatedMarked[techniqueId] = updatedStatus;
    }
    return updatedMarked;
};

const TechniqueDetails = () => {
    const { id } = useParams<{ id: string }>();
    const { currentUser } = useAuth();

    const [technique, setTechnique] = useState<Technique | null>(null);
    const [connected, setConnected] = useState<Technique[]>([]);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [sessions, setSessions] = useState<JournalEntry[]>([]);
    const [notes, setNotes] = useState('');
    const [isSavingNotes, setIsSavingNotes] = useState(false);
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

                    const allEntries = await getJournalEntries(currentUser.uid);
                    const techniqueSessions = allEntries.filter(entry =>
                        entry.techniqueIds && entry.techniqueIds.includes(id)
                    );
                    setSessions(techniqueSessions);
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

    useEffect(() => {
        if (profile && id) {
            setNotes(profile.markedTechniques?.[id]?.notes || '');
        }
    }, [id, profile]);

    const handleStatusToggle = async (key: keyof Omit<MarkedStatus, 'skillLevel'>) => {
        if (!currentUser || !id || !profile) return;

        try {
            const currentValue = profile.markedTechniques?.[id]?.[key];
            const updatedMarked = updateTechniqueStatus(profile, id, { [key]: !currentValue });

            setProfile({ ...profile, markedTechniques: updatedMarked });
            await updateUserProfile(currentUser.uid, { markedTechniques: updatedMarked });
        } catch (err) {
            console.error("Failed to update status", err);
        }
    };

    const handleRatingChange = async (_event: React.SyntheticEvent, newValue: number | null) => {
        if (!currentUser || !id || !profile) return;

        try {
            const updatedMarked = updateTechniqueStatus(profile, id, {
                skillLevel: newValue === null ? undefined : newValue
            });

            setProfile({ ...profile, markedTechniques: updatedMarked });
            await updateUserProfile(currentUser.uid, { markedTechniques: updatedMarked });
        } catch (err) {
            console.error("Failed to update rating", err);
        }
    };

    const handleSaveNotes = async () => {
        if (!currentUser || !id || !profile) return;
        const currentNotes = profile.markedTechniques?.[id]?.notes || '';
        if (notes === currentNotes) return;

        try {
            setIsSavingNotes(true);
            const updatedMarked = updateTechniqueStatus(profile, id, { notes });
            setProfile({ ...profile, markedTechniques: updatedMarked });
            await updateUserProfile(currentUser.uid, { markedTechniques: updatedMarked });
        } catch (err) {
            console.error("Failed to save notes", err);
        } finally {
            setIsSavingNotes(false);
        }
    };


    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;
    if (error || !technique) return <Container><Typography color="error" mt={4}>{error || 'Not found'}</Typography></Container>;

    const currentStatus = profile?.markedTechniques?.[technique.id] || {};

    return (
        <Container maxWidth="lg">
            <Paper elevation={0} sx={{ p: { xs: 2, md: 4 }, bgcolor: 'background.paper', borderRadius: 2 }}>
                <Grid container spacing={4}>
                    <Grid size={{ xs: 12, md: 8 }}>
                        <Box mb={2} display="flex" justifyContent="space-between" alignItems="flex-start">
                            <Box>
                                <Button
                                    component={RouterLink}
                                    to="/techniques"
                                    startIcon={<ArrowBack />}
                                    sx={{ mb: 1, color: 'text.secondary' }}
                                >
                                    Back to Overview
                                </Button>
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
                            {currentUser && (
                                <Button
                                    component={RouterLink}
                                    to={`/techniques/${technique.id}/edit`}
                                    variant="outlined"
                                    color="primary"
                                    size="small"
                                >
                                    Edit
                                </Button>
                            )}
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

                        {technique.videos && technique.videos.length > 0 && (
                            <Box mt={4}>
                                <Typography variant="h5" gutterBottom>Videos</Typography>
                                <Divider sx={{ mb: 2 }} />
                                <Grid container spacing={2}>
                                    {technique.videos.map((vid, index) => {
                                        // Simple check to try and embed youtube, otherwise just a link
                                        const isYoutube = vid.includes('youtube.com/watch') || vid.includes('youtu.be/');
                                        if (isYoutube) {
                                            const videoId = vid.includes('youtube.com')
                                                ? new URL(vid).searchParams.get('v')
                                                : vid.split('youtu.be/')[1]?.split('?')[0];

                                            return (
                                                <Grid size={{ xs: 12, sm: 6 }} key={index}>
                                                    <Box sx={{ position: 'relative', paddingTop: '56.25%', width: '100%', borderRadius: 2, overflow: 'hidden' }}>
                                                        <iframe
                                                            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                                                            src={`https://www.youtube.com/embed/${videoId}`}
                                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                            allowFullScreen
                                                            title={`Video ${index + 1}`}
                                                        />
                                                    </Box>
                                                </Grid>
                                            );
                                        }
                                        return (
                                            <Grid size={{ xs: 12 }} key={index}>
                                                <Button href={vid} target="_blank" rel="noopener noreferrer" variant="outlined" sx={{ justifyContent: 'flex-start', textTransform: 'none' }} fullWidth>
                                                    {vid}
                                                </Button>
                                            </Grid>
                                        );
                                    })}
                                </Grid>
                            </Box>
                        )}

                        {technique.resources && technique.resources.length > 0 && (
                            <Box mt={4}>
                                <Typography variant="h5" gutterBottom>Resources</Typography>
                                <Divider sx={{ mb: 2 }} />
                                <List disablePadding>
                                    {technique.resources.map((res, index) => (
                                        <ListItem key={index} disablePadding sx={{ mb: 1 }}>
                                            <Button href={res} target="_blank" rel="noopener noreferrer" variant="text" sx={{ justifyContent: 'flex-start', textTransform: 'none', textAlign: 'left' }} fullWidth>
                                                {res}
                                            </Button>
                                        </ListItem>
                                    ))}
                                </List>
                            </Box>
                        )}

                        {connected.length > 0 && (
                            <Box mt={6}>
                                <Typography variant="h5" gutterBottom>Connected Techniques</Typography>
                                <Divider sx={{ mb: 2 }} />
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                                    {connected.map(tech => (
                                        <Paper
                                            key={tech.id}
                                            component={RouterLink}
                                            to={`/techniques/${tech.id}`}
                                            variant="outlined"
                                            sx={{
                                                px: 2,
                                                py: 1,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1,
                                                textDecoration: 'none',
                                                color: 'inherit',
                                                borderRadius: 10,
                                                transition: '0.2s',
                                                '&:hover': {
                                                    borderColor: 'primary.main',
                                                    bgcolor: 'action.hover',
                                                    transform: 'translateY(-1px)',
                                                    boxShadow: 1
                                                }
                                            }}
                                        >
                                            <Typography variant="body1" fontWeight="500">
                                                {tech.name}
                                            </Typography>
                                            <Chip
                                                label={tech.type}
                                                size="small"
                                                variant="outlined"
                                                color="primary"
                                                sx={{
                                                    textTransform: 'capitalize',
                                                    height: 20,
                                                    fontSize: '0.75rem',
                                                    pointerEvents: 'none'
                                                }}
                                            />
                                        </Paper>
                                    ))}
                                </Box>
                            </Box>
                        )}
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                        <Box sx={{ position: 'sticky', top: 24, display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <Paper variant="outlined" sx={{ p: 3 }}>
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
                                    <Box display="flex" flexDirection="column" gap={1.5}>
                                        <Typography variant="subtitle2" gutterBottom>Status Marker</Typography>
                                        <ToggleButton
                                            value="favorite"
                                            selected={!!currentStatus.favorite}
                                            onChange={() => handleStatusToggle('favorite')}
                                            fullWidth
                                            size="small"
                                            color="primary"
                                        >
                                            <Favorite sx={{ mr: 1, fontSize: 20 }} /> Favorite
                                        </ToggleButton>
                                        <ToggleButton
                                            value="learning"
                                            selected={!!currentStatus.learning}
                                            onChange={() => handleStatusToggle('learning')}
                                            fullWidth
                                            size="small"
                                            color="primary"
                                        >
                                            <School sx={{ mr: 1, fontSize: 20 }} /> Currently Learning
                                        </ToggleButton>
                                        <ToggleButton
                                            value="toLearn"
                                            selected={!!currentStatus.toLearn}
                                            onChange={() => handleStatusToggle('toLearn')}
                                            fullWidth
                                            size="small"
                                            color="primary"
                                        >
                                            <MenuBook sx={{ mr: 1, fontSize: 20 }} /> To Learn
                                        </ToggleButton>

                                        <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>Skill Level</Typography>
                                        <Box display="flex" justifyContent="center">
                                            <Rating
                                                name="technique-skill-level"
                                                value={currentStatus.skillLevel || 0}
                                                onChange={handleRatingChange}
                                                size="large"
                                            />
                                        </Box>
                                    </Box>
                                )}
                            </Paper>

                            {currentUser && (
                                <Paper variant="outlined" sx={{ p: 3 }}>
                                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <EditNote color="primary" />
                                            <Typography variant="h6">My Notes</Typography>
                                        </Box>
                                        {isSavingNotes && <CircularProgress size={16} />}
                                    </Box>
                                    <Divider sx={{ mb: 2 }} />
                                    <TextField
                                        multiline
                                        rows={6}
                                        fullWidth
                                        placeholder="Add your personal notes and details about this technique..."
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        onBlur={handleSaveNotes}
                                        variant="outlined"
                                        size="small"
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                bgcolor: 'background.default',
                                            }
                                        }}
                                    />
                                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                        Notes are private to you and save automatically.
                                    </Typography>
                                </Paper>
                            )}

                            {currentUser && sessions.length > 0 && (
                                <Paper variant="outlined" sx={{ p: 3 }}>
                                    <Typography variant="h6" gutterBottom>Training History</Typography>
                                    <Divider sx={{ mb: 2 }} />
                                    <List disablePadding>
                                        {sessions.map(session => (
                                            <ListItem key={session.id} disablePadding sx={{ mb: 1, alignItems: 'flex-start' }}>
                                                <ListItemIcon sx={{ minWidth: 36, mt: 0.5 }}>
                                                    <EventNote fontSize="small" color="primary" />
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={new Date(session.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                                                    secondary={
                                                        <>
                                                            {session.sessionType || 'Training Session'}
                                                            {session.length ? ` • ${session.length} min` : ''}
                                                        </>
                                                    }
                                                    secondaryTypographyProps={{ variant: 'caption', display: 'block' }}
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                    <Button
                                        component={RouterLink}
                                        to="/journal"
                                        variant="text"
                                        fullWidth
                                        size="small"
                                        sx={{ mt: 1 }}
                                    >
                                        View Full Journal
                                    </Button>
                                </Paper>
                            )}
                        </Box>
                    </Grid>
                </Grid>
            </Paper>
        </Container >
    );
};

export default TechniqueDetails;
