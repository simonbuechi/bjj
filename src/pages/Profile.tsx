import { useState, useEffect } from 'react';
import {
    Typography, Box, Container, Paper, TextField,
    Button, MenuItem, CircularProgress, Alert, Grid,
    FormControlLabel, Checkbox, FormGroup, FormLabel,
    List, ListItem, ListItemText, Divider
} from '@mui/material';
import { Favorite, School, MenuBook } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserProfile, updateUserProfile, createUserProfile, getTechniques } from '../services/db';
import type { UserProfile, BeltColor, Technique } from '../types';

const BELTS: BeltColor[] = ['white', 'blue', 'purple', 'brown', 'black'];
const STRIPES = [1, 2, 3, 4, 5];

const Profile = () => {
    const { currentUser } = useAuth();
    const [profile, setProfile] = useState<Partial<UserProfile>>({
        name: '',
        birthYear: undefined,
        bjjExperience: undefined,
        trainingsPerWeek: undefined,
        giTraining: false,
        noGiTraining: false,
        belt: 'white',
        stripes: 1,
        notes: '',
        markedTechniques: {}
    });

    const [allTechniques, setAllTechniques] = useState<Technique[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            if (!currentUser) return;
            try {
                setLoading(true);
                const [userData, techniquesData] = await Promise.all([
                    getUserProfile(currentUser.uid),
                    getTechniques()
                ]);

                setAllTechniques(techniquesData);

                if (userData) {
                    setProfile(userData);
                } else {
                    // If no profile exists, set the name to email prefix or display name as default
                    setProfile(prev => ({
                        ...prev,
                        name: currentUser.displayName || currentUser.email?.split('@')[0] || ''
                    }));
                }
            } catch (err) {
                console.error(err);
                setError('Failed to load profile data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [currentUser]);

    const handleChange = (field: keyof UserProfile) => (event: React.ChangeEvent<HTMLInputElement>) => {
        let value: any = event.target.value;

        // Convert specific fields to numbers
        if (field === 'birthYear' || field === 'bjjExperience' || field === 'trainingsPerWeek') {
            value = value === '' ? undefined : Number(value);
        } else if (field === 'giTraining' || field === 'noGiTraining') {
            value = event.target.checked;
        }

        setProfile({ ...profile, [field]: value });
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) return;

        try {
            setSaving(true);
            setError('');
            setMessage('');

            const existing = await getUserProfile(currentUser.uid);
            if (existing) {
                await updateUserProfile(currentUser.uid, profile as Partial<UserProfile>);
            } else {
                await createUserProfile(currentUser.uid, profile as Partial<UserProfile>);
            }

            setMessage('Profile updated successfully');
        } catch (err) {
            console.error(err);
            setError('Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <Box display="flex" justifyContent="center" mt={8}><CircularProgress /></Box>;

    const getMarkedTechniques = (statusKey: 'favorite' | 'learning' | 'toLearn') => {
        if (!profile.markedTechniques) return [];
        return Object.entries(profile.markedTechniques)
            .filter(([, status]) => status[statusKey])
            .map(([techniqueId]) => allTechniques.find(t => t.id === techniqueId))
            .filter((t): t is Technique => t !== undefined);
    };

    const favoriteTechs = getMarkedTechniques('favorite');
    const learningTechs = getMarkedTechniques('learning');
    const toLearnTechs = getMarkedTechniques('toLearn');

    return (
        <Container maxWidth="lg">
            <Grid container spacing={4}>
                <Grid size={{ xs: 12, md: 7 }}>
                    <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, mt: 4, borderRadius: 2 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                            <Typography variant="h4" component="h1">
                                Your profile
                            </Typography>
                        </Box>

                        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
                        {message && <Alert severity="success" sx={{ mb: 3 }}>{message}</Alert>}

                        <form onSubmit={handleSave}>
                            <Grid container spacing={3}>
                                <Grid size={{ xs: 12 }}>
                                    <TextField
                                        label="Name"
                                        fullWidth
                                        value={profile.name || ''}
                                        onChange={handleChange('name')}
                                        required
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <TextField
                                        select
                                        label="Belt"
                                        fullWidth
                                        value={profile.belt || 'white'}
                                        onChange={handleChange('belt')}
                                        sx={{ textTransform: 'capitalize' }}
                                    >
                                        {BELTS.map((belt) => (
                                            <MenuItem key={belt} value={belt} sx={{ textTransform: 'capitalize' }}>
                                                {belt}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <TextField
                                        select
                                        label="Stripes"
                                        fullWidth
                                        value={profile.stripes || 1}
                                        onChange={handleChange('stripes')}
                                    >
                                        {STRIPES.map((stripe) => (
                                            <MenuItem key={stripe} value={stripe}>
                                                {stripe}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 4 }}>
                                    <TextField
                                        label="Birth Year"
                                        type="number"
                                        fullWidth
                                        value={profile.birthYear || ''}
                                        onChange={handleChange('birthYear')}
                                        inputProps={{ min: 1900, max: new Date().getFullYear() }}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 4 }}>
                                    <TextField
                                        label="BJJ Experience (Years)"
                                        type="number"
                                        fullWidth
                                        value={profile.bjjExperience || ''}
                                        onChange={handleChange('bjjExperience')}
                                        inputProps={{ min: 0, step: 0.5 }}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 4 }}>
                                    <TextField
                                        select
                                        label="Trainings Per Week"
                                        fullWidth
                                        value={profile.trainingsPerWeek || ''}
                                        onChange={handleChange('trainingsPerWeek')}
                                    >
                                        {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                                            <MenuItem key={num} value={num}>
                                                {num} {num === 1 ? 'time' : 'times'}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                                <Grid size={{ xs: 12 }}>
                                    <FormLabel component="legend">Training Preferences</FormLabel>
                                    <FormGroup row>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={!!profile.giTraining}
                                                    onChange={handleChange('giTraining')}
                                                    name="giTraining"
                                                />
                                            }
                                            label="Gi"
                                        />
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={!!profile.noGiTraining}
                                                    onChange={handleChange('noGiTraining')}
                                                    name="noGiTraining"
                                                />
                                            }
                                            label="No-Gi"
                                        />
                                    </FormGroup>
                                </Grid>
                                <Grid size={{ xs: 12 }}>
                                    <TextField
                                        label="Training Notes / Journey"
                                        multiline
                                        rows={4}
                                        fullWidth
                                        value={profile.notes || ''}
                                        onChange={handleChange('notes')}
                                        placeholder="Keep track of your overall BJJ goals, favorite quotes, or general thoughts..."
                                    />
                                </Grid>
                                <Grid size={{ xs: 12 }}>
                                    <Box display="flex" justifyContent="flex-end">
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            color="primary"
                                            size="large"
                                            disabled={saving}
                                        >
                                            {saving ? 'Saving...' : 'Save Profile'}
                                        </Button>
                                    </Box>
                                </Grid>
                            </Grid>
                        </form>
                    </Paper>
                </Grid>

                <Grid size={{ xs: 12, md: 5 }}>
                    <Box sx={{ position: 'sticky', top: 24, display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <Paper elevation={3} sx={{ p: 3, mt: { xs: 0, md: 4 }, borderRadius: 2 }}>
                            <Typography variant="h6" gutterBottom display="flex" alignItems="center">
                                <Favorite color="primary" sx={{ mr: 1 }} /> Favorites
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            {favoriteTechs.length === 0 ? (
                                <Typography variant="body2" color="text.secondary">No favorite techniques yet.</Typography>
                            ) : (
                                <List disablePadding>
                                    {favoriteTechs.map(tech => (
                                        <ListItem key={tech.id} component={RouterLink} to={`/techniques/${tech.id}`} sx={{ px: 1, color: 'inherit', textDecoration: 'none', '&:hover': { bgcolor: 'action.hover' }, borderRadius: 1 }}>
                                            <ListItemText primary={tech.name} secondary={tech.type} secondaryTypographyProps={{ textTransform: 'capitalize' }} />
                                        </ListItem>
                                    ))}
                                </List>
                            )}
                        </Paper>

                        <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                            <Typography variant="h6" gutterBottom display="flex" alignItems="center">
                                <School color="primary" sx={{ mr: 1 }} /> Currently Learning
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            {learningTechs.length === 0 ? (
                                <Typography variant="body2" color="text.secondary">No techniques currently learning.</Typography>
                            ) : (
                                <List disablePadding>
                                    {learningTechs.map(tech => (
                                        <ListItem key={tech.id} component={RouterLink} to={`/techniques/${tech.id}`} sx={{ px: 1, color: 'inherit', textDecoration: 'none', '&:hover': { bgcolor: 'action.hover' }, borderRadius: 1 }}>
                                            <ListItemText primary={tech.name} secondary={tech.type} secondaryTypographyProps={{ textTransform: 'capitalize' }} />
                                        </ListItem>
                                    ))}
                                </List>
                            )}
                        </Paper>

                        <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                            <Typography variant="h6" gutterBottom display="flex" alignItems="center">
                                <MenuBook color="primary" sx={{ mr: 1 }} /> To Learn
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            {toLearnTechs.length === 0 ? (
                                <Typography variant="body2" color="text.secondary">No techniques marked to learn.</Typography>
                            ) : (
                                <List disablePadding>
                                    {toLearnTechs.map(tech => (
                                        <ListItem key={tech.id} component={RouterLink} to={`/techniques/${tech.id}`} sx={{ px: 1, color: 'inherit', textDecoration: 'none', '&:hover': { bgcolor: 'action.hover' }, borderRadius: 1 }}>
                                            <ListItemText primary={tech.name} secondary={tech.type} secondaryTypographyProps={{ textTransform: 'capitalize' }} />
                                        </ListItem>
                                    ))}
                                </List>
                            )}
                        </Paper>
                    </Box>
                </Grid>
            </Grid>
        </Container>
    );
};

export default Profile;
