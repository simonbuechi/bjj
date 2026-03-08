import { useState, useEffect } from 'react';
import { Typography, Box, Grid, CircularProgress, Alert, Container, Paper, Button, Card, CardContent } from '@mui/material';
import { Add as AddIcon, LibraryBooks as LibraryBooksIcon } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { getTechniques, getJournalEntries } from '../services/db';
import { useAuth } from '../context/AuthContext';
import Login from './Login';

const Home = () => {
    const { currentUser } = useAuth();
    const [techniquesCount, setTechniquesCount] = useState<number | null>(null);
    const [sessionsCount, setSessionsCount] = useState<number | null>(null);
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
                const [techniquesData, sessionsData] = await Promise.all([
                    getTechniques(),
                    getJournalEntries(currentUser.uid)
                ]);

                setTechniquesCount(techniquesData.length);
                setSessionsCount(sessionsData.length);
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
        return <Login />;
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
                {/* Techniques Stat Card */}
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <Card elevation={3} sx={{ height: '100%', borderRadius: 2, transition: '0.3s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 } }}>
                        <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 4 }}>
                            <LibraryBooksIcon color="primary" sx={{ fontSize: 48, mb: 2 }} />
                            <Typography variant="h3" color="primary" sx={{ fontWeight: 'bold' }}>
                                {techniquesCount !== null ? techniquesCount : '-'}
                            </Typography>
                            <Typography variant="h6" color="text.secondary">
                                Total Techniques
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Sessions Stat Card */}
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <Card elevation={3} sx={{ height: '100%', borderRadius: 2, transition: '0.3s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 } }}>
                        <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 4 }}>
                            <AddIcon color="secondary" sx={{ fontSize: 48, mb: 2 }} />
                            <Typography variant="h3" color="secondary" sx={{ fontWeight: 'bold' }}>
                                {sessionsCount !== null ? sessionsCount : '-'}
                            </Typography>
                            <Typography variant="h6" color="text.secondary">
                                Logged Sessions
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Quick Actions */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper elevation={3} sx={{ height: '100%', p: 3, borderRadius: 2, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <Typography variant="h6" gutterBottom>
                            Quick Actions
                        </Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            size="large"
                            component={RouterLink}
                            to="/journal"
                            startIcon={<AddIcon />}
                            sx={{ mt: 2, py: 1.5 }}
                            fullWidth
                        >
                            Log New Session
                        </Button>
                        <Button
                            variant="outlined"
                            color="secondary"
                            size="large"
                            component={RouterLink}
                            to="/techniques"
                            startIcon={<LibraryBooksIcon />}
                            sx={{ mt: 2, py: 1.5 }}
                            fullWidth
                        >
                            Browse Techniques
                        </Button>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default Home;
