import { useState, useEffect } from 'react';
import {
    Typography, Box, Container, Paper, TextField,
    Button, MenuItem, CircularProgress, Alert, Grid,
    FormControlLabel, Checkbox, FormGroup, FormLabel,
    List, ListItem, ListItemText, Divider, Chip,
    Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Collapse
} from '@mui/material';
import { Favorite, School, MenuBook, Close, Edit, Logout, ExpandLess, ExpandMore } from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserProfile, updateUserProfile, createUserProfile, getTechniques } from '../services/db';
import type { UserProfile, BeltColor, Technique } from '../types';

const BELTS: BeltColor[] = ['white', 'blue', 'purple', 'brown', 'black'];
const STRIPES = [1, 2, 3, 4, 5];

const Profile = () => {
    const { currentUser, logout } = useAuth();
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
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [favoritesExpanded, setFavoritesExpanded] = useState(true);
    const [learningExpanded, setLearningExpanded] = useState(true);
    const [toLearnExpanded, setToLearnExpanded] = useState(true);

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

    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error("Failed to log out", error);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        // ... (existing handleSave)
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
            setIsEditDialogOpen(false);
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
                            <Button
                                variant="outlined"
                                startIcon={<Edit />}
                                onClick={() => setIsEditDialogOpen(true)}
                                sx={{ borderRadius: 8 }}
                            >
                                Edit Profile
                            </Button>
                        </Box>

                        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
                        {message && <Alert severity="success" sx={{ mb: 3 }}>{message}</Alert>}

                        <Grid container spacing={3}>
                            <Grid size={{ xs: 12 }}>
                                <Typography variant="h5" fontWeight="bold">{profile.name || 'Anonymous Grappler'}</Typography>
                                <Typography color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                                    {profile.belt || 'White'} Belt • {profile.stripes || 0} Stripes
                                </Typography>
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Typography variant="subtitle2" color="text.secondary">Birth Year</Typography>
                                <Typography variant="body1">{profile.birthYear || 'Not specified'}</Typography>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Typography variant="subtitle2" color="text.secondary">BJJ Experience</Typography>
                                <Typography variant="body1">
                                    {profile.bjjExperience !== undefined ? `${profile.bjjExperience} years` : 'Not specified'}
                                </Typography>
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Typography variant="subtitle2" color="text.secondary">Trainings Per Week</Typography>
                                <Typography variant="body1">
                                    {profile.trainingsPerWeek ? `${profile.trainingsPerWeek} times` : 'Not specified'}
                                </Typography>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Typography variant="subtitle2" color="text.secondary">Preferences</Typography>
                                <Typography variant="body1">
                                    {[profile.giTraining && 'Gi', profile.noGiTraining && 'No-Gi'].filter(Boolean).join(' • ') || 'Not specified'}
                                </Typography>
                            </Grid>

                            {profile.notes && (
                                <Grid size={{ xs: 12 }}>
                                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Notes & Journey</Typography>
                                    <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                                        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                                            {profile.notes}
                                        </Typography>
                                    </Paper>
                                </Grid>
                            )}

                            {currentUser && (
                                <>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <Typography variant="subtitle2" color="text.secondary">Member Since</Typography>
                                        <Typography variant="body1">
                                            {currentUser.metadata.creationTime ? new Date(currentUser.metadata.creationTime).toLocaleDateString() : 'Unknown'}
                                        </Typography>
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <Typography variant="subtitle2" color="text.secondary">Last Login</Typography>
                                        <Typography variant="body1">
                                            {currentUser.metadata.lastSignInTime ? new Date(currentUser.metadata.lastSignInTime).toLocaleDateString() : 'Unknown'}
                                        </Typography>
                                    </Grid>
                                </>
                            )}

                            {currentUser && (
                                <Grid size={{ xs: 12 }}>
                                    <Box mt={2}>
                                        <Button
                                            variant="outlined"
                                            color="error"
                                            onClick={handleLogout}
                                            startIcon={<Logout />}
                                            fullWidth
                                        >
                                            Logout
                                        </Button>
                                    </Box>
                                </Grid>
                            )}
                        </Grid>
                    </Paper>

                    <Dialog
                        open={isEditDialogOpen}
                        onClose={() => setIsEditDialogOpen(false)}
                        maxWidth="sm"
                        fullWidth
                        PaperProps={{
                            sx: { borderRadius: 3 }
                        }}
                    >
                        <DialogTitle sx={{ pb: 1 }}>
                            Edit Profile
                            <IconButton
                                aria-label="close"
                                onClick={() => setIsEditDialogOpen(false)}
                                sx={{
                                    position: 'absolute',
                                    right: 16,
                                    top: 16,
                                    color: (theme) => theme.palette.grey[500],
                                }}
                            >
                                <Close />
                            </IconButton>
                        </DialogTitle>
                        <form onSubmit={handleSave}>
                            <DialogContent dividers sx={{ pt: 3 }}>
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
                                            value={profile.bjjExperience === undefined ? '' : profile.bjjExperience}
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
                                </Grid>
                            </DialogContent>
                            <DialogActions sx={{ px: 3, py: 2 }}>
                                <Button onClick={() => setIsEditDialogOpen(false)} color="inherit" sx={{ fontWeight: 600 }}>
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    disabled={saving}
                                    sx={{ fontWeight: 600, px: 3 }}
                                >
                                    {saving ? 'Saving...' : 'Save Profile'}
                                </Button>
                            </DialogActions>
                        </form>
                    </Dialog>
                </Grid>

                <Grid size={{ xs: 12, md: 5 }}>
                    <Box sx={{ position: 'sticky', top: 24, display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <Paper elevation={3} sx={{ p: 3, mt: { xs: 0, md: 4 }, borderRadius: 2 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center" onClick={() => setFavoritesExpanded(!favoritesExpanded)} sx={{ cursor: 'pointer' }}>
                                <Typography variant="h6" display="flex" alignItems="center">
                                    <Favorite color="primary" sx={{ mr: 1 }} /> Favorites ({favoriteTechs.length})
                                </Typography>
                                <IconButton size="small" disableRipple sx={{ p: 0 }}>
                                    {favoritesExpanded ? <ExpandLess /> : <ExpandMore />}
                                </IconButton>
                            </Box>
                            <Collapse in={favoritesExpanded}>
                                <Box mt={2}>
                                    <Divider sx={{ mb: 2 }} />
                                    {favoriteTechs.length === 0 ? (
                                        <Typography variant="body2" color="text.secondary">No favorite techniques yet.</Typography>
                                    ) : (
                                        <List disablePadding>
                                            {favoriteTechs.map(tech => (
                                                <ListItem
                                                    key={tech.id}
                                                    component={RouterLink}
                                                    to={`/techniques/${tech.id}`}
                                                    dense
                                                    sx={{
                                                        px: 1,
                                                        py: 0.5,
                                                        color: 'inherit',
                                                        textDecoration: 'none',
                                                        '&:hover': { bgcolor: 'action.hover' },
                                                        borderRadius: 1,
                                                        display: 'flex',
                                                        justifyContent: 'flex-start',
                                                        alignItems: 'center',
                                                        gap: 1.5
                                                    }}
                                                >
                                                    <Chip
                                                        label={tech.type}
                                                        size="small"
                                                        variant="outlined"
                                                        color="primary"
                                                        sx={{
                                                            height: 20,
                                                            fontSize: '0.65rem',
                                                            textTransform: 'capitalize',
                                                            flexShrink: 0,
                                                            minWidth: '75px'
                                                        }}
                                                    />
                                                    <Typography variant="body2" sx={{ mr: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {tech.name}
                                                    </Typography>
                                                </ListItem>
                                            ))}
                                        </List>
                                    )}
                                </Box>
                            </Collapse>
                        </Paper>

                        <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center" onClick={() => setLearningExpanded(!learningExpanded)} sx={{ cursor: 'pointer' }}>
                                <Typography variant="h6" display="flex" alignItems="center">
                                    <School color="primary" sx={{ mr: 1 }} /> Currently Learning ({learningTechs.length})
                                </Typography>
                                <IconButton size="small" disableRipple sx={{ p: 0 }}>
                                    {learningExpanded ? <ExpandLess /> : <ExpandMore />}
                                </IconButton>
                            </Box>
                            <Collapse in={learningExpanded}>
                                <Box mt={2}>
                                    <Divider sx={{ mb: 2 }} />
                                    {learningTechs.length === 0 ? (
                                        <Typography variant="body2" color="text.secondary">No techniques currently learning.</Typography>
                                    ) : (
                                        <List disablePadding>
                                            {learningTechs.map(tech => (
                                                <ListItem
                                                    key={tech.id}
                                                    component={RouterLink}
                                                    to={`/techniques/${tech.id}`}
                                                    dense
                                                    sx={{
                                                        px: 1,
                                                        py: 0.5,
                                                        color: 'inherit',
                                                        textDecoration: 'none',
                                                        '&:hover': { bgcolor: 'action.hover' },
                                                        borderRadius: 1,
                                                        display: 'flex',
                                                        justifyContent: 'flex-start',
                                                        alignItems: 'center',
                                                        gap: 1.5
                                                    }}
                                                >
                                                    <Chip
                                                        label={tech.type}
                                                        size="small"
                                                        variant="outlined"
                                                        color="primary"
                                                        sx={{
                                                            height: 20,
                                                            fontSize: '0.65rem',
                                                            textTransform: 'capitalize',
                                                            flexShrink: 0,
                                                            minWidth: '75px'
                                                        }}
                                                    />
                                                    <Typography variant="body2" sx={{ mr: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {tech.name}
                                                    </Typography>
                                                </ListItem>
                                            ))}
                                        </List>
                                    )}
                                </Box>
                            </Collapse>
                        </Paper>

                        <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center" onClick={() => setToLearnExpanded(!toLearnExpanded)} sx={{ cursor: 'pointer' }}>
                                <Typography variant="h6" display="flex" alignItems="center">
                                    <MenuBook color="primary" sx={{ mr: 1 }} /> To Learn ({toLearnTechs.length})
                                </Typography>
                                <IconButton size="small" disableRipple sx={{ p: 0 }}>
                                    {toLearnExpanded ? <ExpandLess /> : <ExpandMore />}
                                </IconButton>
                            </Box>
                            <Collapse in={toLearnExpanded}>
                                <Box mt={2}>
                                    <Divider sx={{ mb: 2 }} />
                                    {toLearnTechs.length === 0 ? (
                                        <Typography variant="body2" color="text.secondary">No techniques marked to learn.</Typography>
                                    ) : (
                                        <List disablePadding>
                                            {toLearnTechs.map(tech => (
                                                <ListItem
                                                    key={tech.id}
                                                    component={RouterLink}
                                                    to={`/techniques/${tech.id}`}
                                                    dense
                                                    sx={{
                                                        px: 1,
                                                        py: 0.5,
                                                        color: 'inherit',
                                                        textDecoration: 'none',
                                                        '&:hover': { bgcolor: 'action.hover' },
                                                        borderRadius: 1,
                                                        display: 'flex',
                                                        justifyContent: 'flex-start',
                                                        alignItems: 'center',
                                                        gap: 1.5
                                                    }}
                                                >
                                                    <Chip
                                                        label={tech.type}
                                                        size="small"
                                                        variant="outlined"
                                                        color="primary"
                                                        sx={{
                                                            height: 20,
                                                            fontSize: '0.65rem',
                                                            textTransform: 'capitalize',
                                                            flexShrink: 0,
                                                            minWidth: '75px'
                                                        }}
                                                    />
                                                    <Typography variant="body2" sx={{ mr: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {tech.name}
                                                    </Typography>
                                                </ListItem>
                                            ))}
                                        </List>
                                    )}
                                </Box>
                            </Collapse>
                        </Paper>
                    </Box>
                </Grid>
            </Grid>
        </Container>
    );
};

export default Profile;
