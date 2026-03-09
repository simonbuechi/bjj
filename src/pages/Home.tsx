import { useState, useEffect } from 'react';
import { Typography, Box, Grid, CircularProgress, Alert, Container, Button, Card, CardContent } from '@mui/material';
import { Add as AddIcon, LibraryBooks as LibraryBooksIcon, Favorite } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { getUserProfile, getJournalEntries } from '../services/db';
import { useAuth } from '../context/AuthContext';
import Login from './Login';

const Home = () => {
    const { currentUser } = useAuth();
    const [sessionsCount, setSessionsCount] = useState<number | null>(null);
    const [favoriteCount, setFavoriteCount] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!currentUser) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const [profileData, sessionsData] = await Promise.all([
                    getUserProfile(currentUser.uid),
                    getJournalEntries(currentUser.uid)
                ]);

                setSessionsCount(sessionsData.length);

                if (profileData?.markedTechniques) {
                    const favorites = Object.values(profileData.markedTechniques).filter(status => status.favorite).length;
                    setFavoriteCount(favorites);
                } else {
                    setFavoriteCount(0);
                }
            } catch (err) {
                console.error(err);
                setError('Failed to load dashboard data.');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [currentUser]);

    if (!currentUser) {
        return (
            <Container maxWidth="lg">
                <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
                    Welcome to BJJ Amigo
                </Typography>
                <Grid container spacing={4} alignItems="stretch">
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Card elevation={3} sx={{ height: '100%', borderRadius: 2 }}>
                            <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
                                <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>About</Typography>
                                <Typography variant="body1" sx={{ mb: 4, flexGrow: 1, fontSize: '1.1rem' }}>
                                    BJJ Amigo helps you track your trainings and manage your progress.
                                </Typography>
                                <Box>
                                    <Button
                                        variant="outlined"
                                        color="primary"
                                        href="https://github.com/simonbuechi/bjj"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        size="large"
                                    >
                                        Learn more
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Card elevation={3} sx={{ height: '100%', borderRadius: 2, display: 'flex', flexDirection: 'column', justifyContent: 'center', p: 2 }}>
                            <Login />
                        </Card>
                    </Grid>
                </Grid>
            </Container>
        );
    }

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="lg">
            <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
                Dashboard
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>}

            <Grid container spacing={4}>
                {/* Welcome Info Card */}
                <Grid size={{ xs: 12 }}>
                    <Card elevation={3} sx={{ borderRadius: 2 }}>
                        <CardContent sx={{ p: { xs: 3, sm: 4 }, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: 'center', gap: 3 }}>
                            <Typography variant="body1" sx={{ fontSize: '1.1rem', textAlign: { xs: 'center', sm: 'left' } }}>
                                BJJ Amigo helps you track your trainings and manage your progress.
                            </Typography>
                            <Button
                                variant="outlined"
                                color="primary"
                                href="https://github.com/simonbuechi/bjj"
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{ minWidth: '150px' }}
                            >
                                Learn more
                            </Button>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Sessions Stat Card */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Card elevation={3} sx={{ height: '100%', borderRadius: 2, transition: '0.3s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 } }}>
                        <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 4, height: '100%' }}>
                            <AddIcon color="primary" sx={{ fontSize: 48, mb: 2 }} />
                            <Typography variant="h3" color="primary" sx={{ fontWeight: 'bold' }}>
                                {sessionsCount !== null ? sessionsCount : '-'}
                            </Typography>
                            <Typography variant="h6" color="text.secondary" sx={{ mb: 4, textAlign: 'center' }}>
                                Logged Sessions
                            </Typography>
                            <Box sx={{ mt: 'auto', width: '100%' }}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    component={RouterLink}
                                    to="/journal"
                                    startIcon={<AddIcon />}
                                    fullWidth
                                    size="large"
                                >
                                    Add New Session
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Favorites Stat Card */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Card elevation={3} sx={{ height: '100%', borderRadius: 2, transition: '0.3s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 } }}>
                        <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 4, height: '100%' }}>
                            <Favorite color="primary" sx={{ fontSize: 48, mb: 2 }} />
                            <Typography variant="h3" color="primary" sx={{ fontWeight: 'bold' }}>
                                {favoriteCount !== null ? favoriteCount : '-'}
                            </Typography>
                            <Typography variant="h6" color="text.secondary" sx={{ mb: 4, textAlign: 'center' }}>
                                Favorite Techniques
                            </Typography>
                            <Box sx={{ mt: 'auto', width: '100%' }}>
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    component={RouterLink}
                                    to="/techniques"
                                    startIcon={<LibraryBooksIcon />}
                                    fullWidth
                                    size="large"
                                >
                                    Explore Techniques
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

            </Grid>
        </Container>
    );
};

export default Home;
