import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Typography, Box, Container, Paper, TextField,
    Button, CircularProgress, Alert, Grid, MenuItem, Autocomplete
} from '@mui/material';
import { getTechniqueById, createTechnique, updateTechnique, getTechniques } from '../services/db';
import type { Technique, TechniqueType } from '../types';

const TECHNIQUE_TYPES: TechniqueType[] = ['position', 'submission', 'escape', 'frame'];

export default function TechniqueForm() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEditing = Boolean(id);

    const [loading, setLoading] = useState(isEditing);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const [allTechniques, setAllTechniques] = useState<Technique[]>([]);

    const [formData, setFormData] = useState<Omit<Technique, 'id'>>({
        name: '',
        type: 'position',
        description: '',
        images: [],
        connectedTechniques: []
    });

    const [imageInput, setImageInput] = useState('');

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                // Fetch all techniques for the connected techniques dropdown
                const techniques = await getTechniques();
                setAllTechniques(techniques);

                if (isEditing && id) {
                    const tech = await getTechniqueById(id);
                    if (tech) {
                        setFormData({
                            name: tech.name,
                            type: tech.type,
                            description: tech.description,
                            images: tech.images || [],
                            connectedTechniques: tech.connectedTechniques || []
                        });
                    } else {
                        setError('Technique not found');
                    }
                }
            } catch (err) {
                console.error(err);
                setError('Failed to load data');
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, [id, isEditing]);

    const handleChange = (field: keyof Omit<Technique, 'id'>) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [field]: e.target.value });
    };

    const handleAddImage = () => {
        if (imageInput.trim() && !formData.images.includes(imageInput.trim())) {
            setFormData({
                ...formData,
                images: [...formData.images, imageInput.trim()]
            });
            setImageInput('');
        }
    };

    const handleRemoveImage = (indexToRemove: number) => {
        setFormData({
            ...formData,
            images: formData.images.filter((_, index) => index !== indexToRemove)
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            setError('');

            if (isEditing && id) {
                await updateTechnique(id, formData);
                navigate(`/techniques/${id}`);
            } else {
                const newId = await createTechnique(formData);
                navigate(`/techniques/${newId}`);
            }
        } catch (err) {
            console.error(err);
            setError(`Failed to ${isEditing ? 'update' : 'create'} technique`);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <Box display="flex" justifyContent="center" mt={8}><CircularProgress /></Box>;

    const selectedConnectedTechniques = allTechniques.filter(t =>
        formData.connectedTechniques.includes(t.id) && t.id !== id
    );

    return (
        <Container maxWidth="md">
            <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, mt: 4, borderRadius: 2 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    {isEditing ? 'Edit Technique' : 'Add New Technique'}
                </Typography>

                {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, sm: 8 }}>
                            <TextField
                                label="Technique Name"
                                fullWidth
                                required
                                value={formData.name}
                                onChange={handleChange('name')}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <TextField
                                select
                                label="Type"
                                fullWidth
                                required
                                value={formData.type}
                                onChange={handleChange('type')}
                                sx={{ textTransform: 'capitalize' }}
                            >
                                {TECHNIQUE_TYPES.map((type) => (
                                    <MenuItem key={type} value={type} sx={{ textTransform: 'capitalize' }}>
                                        {type}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <TextField
                                label="Description"
                                multiline
                                rows={6}
                                fullWidth
                                required
                                value={formData.description}
                                onChange={handleChange('description')}
                            />
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <Typography variant="subtitle2" gutterBottom>Images</Typography>
                            <Box display="flex" gap={1} mb={2}>
                                <TextField
                                    label="Image URL"
                                    fullWidth
                                    size="small"
                                    value={imageInput}
                                    onChange={(e) => setImageInput(e.target.value)}
                                    placeholder="https://example.com/image.jpg"
                                />
                                <Button variant="outlined" onClick={handleAddImage}>Add</Button>
                            </Box>

                            {formData.images.length > 0 && (
                                <Box display="flex" flexWrap="wrap" gap={2}>
                                    {formData.images.map((img, index) => (
                                        <Box key={index} position="relative" width={100} height={100}>
                                            <img src={img} alt={`Preview ${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4 }} />
                                            <Button
                                                size="small"
                                                color="error"
                                                variant="contained"
                                                sx={{ position: 'absolute', top: 0, right: 0, minWidth: 'auto', p: 0.5 }}
                                                onClick={() => handleRemoveImage(index)}
                                            >
                                                X
                                            </Button>
                                        </Box>
                                    ))}
                                </Box>
                            )}
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <Autocomplete
                                multiple
                                options={allTechniques.filter(t => t.id !== id)} // don't allow connecting to itself
                                getOptionLabel={(option) => option.name}
                                value={selectedConnectedTechniques}
                                onChange={(_, newValue) => {
                                    setFormData({
                                        ...formData,
                                        connectedTechniques: newValue.map(t => t.id)
                                    });
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        variant="outlined"
                                        label="Connected Techniques"
                                        placeholder="Select techniques..."
                                    />
                                )}
                            />
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
                                <Button
                                    variant="outlined"
                                    onClick={() => navigate(isEditing ? `/techniques/${id}` : '/')}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    disabled={submitting}
                                >
                                    {submitting ? 'Saving...' : 'Save Technique'}
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
        </Container>
    );
}
