import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Typography, Box, Container, Paper, TextField,
    Button, CircularProgress, Alert, Grid, MenuItem, Autocomplete
} from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';
import imageCompression from 'browser-image-compression';
import { getTechniqueById, createTechnique, updateTechnique, getTechniques, uploadImage, deleteImage } from '../services/db';
import type { Technique, TechniqueType } from '../types';
import { useAuth } from '../context/AuthContext';

const TECHNIQUE_TYPES: TechniqueType[] = ['position', 'submission', 'escape', 'guard pass', 'sweep', 'frame'];

const isValidUrl = (str: string): boolean => {
    try {
        const url = new URL(str);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
        return false;
    }
};

export default function TechniqueForm() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const isEditing = Boolean(id);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [loading, setLoading] = useState(isEditing);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const [allTechniques, setAllTechniques] = useState<Technique[]>([]);

    const [formData, setFormData] = useState<Omit<Technique, 'id'>>({
        name: '',
        type: 'position',
        description: '',
        images: [],
        videos: [],
        resources: [],
        connectedTechniques: []
    });

    const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
    const [imagesToRemove, setImagesToRemove] = useState<string[]>([]);

    const [videoInput, setVideoInput] = useState('');
    const [resourceInput, setResourceInput] = useState('');
    const [videoInputError, setVideoInputError] = useState('');
    const [resourceInputError, setResourceInputError] = useState('');

    // Create stable object URLs for image previews and revoke on cleanup
    const previewUrls = useMemo(() => {
        return newImageFiles.map(file => URL.createObjectURL(file));
    }, [newImageFiles]);

    useEffect(() => {
        return () => {
            previewUrls.forEach(url => URL.revokeObjectURL(url));
        };
    }, [previewUrls]);

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
                            videos: tech.videos || [],
                            resources: tech.resources || [],
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

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            try {
                const options = {
                    maxSizeMB: 1,
                    maxWidthOrHeight: 2000,
                    useWebWorker: true,
                    fileType: 'image/webp' as string, // Force conversion to webp
                    initialQuality: 0.6
                };

                const compressedFile = await imageCompression(file, options);

                // Keep the file in state to upload during submit
                setNewImageFiles(prev => [...prev, compressedFile]);

                // Reset standard file input
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            } catch (error) {
                console.error("Error compressing image:", error);
                setError("Failed to process image.");
            }
        }
    };

    const handleRemoveExistingImage = (indexToRemove: number) => {
        const urlToRemove = formData.images[indexToRemove];
        setImagesToRemove(prev => [...prev, urlToRemove]);

        setFormData({
            ...formData,
            images: formData.images.filter((_, index) => index !== indexToRemove)
        });
    };

    const handleRemoveNewImage = (indexToRemove: number) => {
        setNewImageFiles(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const handleAddVideo = () => {
        const trimmed = videoInput.trim();
        if (!trimmed) return;
        if (!isValidUrl(trimmed)) {
            setVideoInputError('Please enter a valid URL (https://...)');
            return;
        }
        if (formData.videos?.includes(trimmed)) {
            setVideoInputError('This URL has already been added');
            return;
        }
        setFormData({
            ...formData,
            videos: [...(formData.videos || []), trimmed]
        });
        setVideoInput('');
        setVideoInputError('');
    };

    const handleRemoveVideo = (indexToRemove: number) => {
        setFormData({
            ...formData,
            videos: formData.videos?.filter((_, index) => index !== indexToRemove) || []
        });
    };

    const handleAddResource = () => {
        const trimmed = resourceInput.trim();
        if (!trimmed) return;
        if (!isValidUrl(trimmed)) {
            setResourceInputError('Please enter a valid URL (https://...)');
            return;
        }
        if (formData.resources?.includes(trimmed)) {
            setResourceInputError('This URL has already been added');
            return;
        }
        setFormData({
            ...formData,
            resources: [...(formData.resources || []), trimmed]
        });
        setResourceInput('');
        setResourceInputError('');
    };

    const handleRemoveResource = (indexToRemove: number) => {
        setFormData({
            ...formData,
            resources: formData.resources?.filter((_, index) => index !== indexToRemove) || []
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!currentUser) {
            setError("You must be logged in to save techniques.");
            return;
        }

        try {
            setSubmitting(true);
            setError('');

            // 1. Delete removed images from storage
            for (const url of imagesToRemove) {
                if (url.includes('firebasestorage')) {
                    await deleteImage(url);
                }
            }

            // 2. Upload new images
            const newImageUrls = [];
            for (const file of newImageFiles) {
                // Create a unique filename based on time and user ID
                const timestamp = new Date().getTime();
                const path = `techniques/${currentUser.uid}/${timestamp}_${file.name}`;
                const url = await uploadImage(file, path);
                newImageUrls.push(url);
            }

            // 3. Combine existing remaining images with new ones
            const finalData = {
                ...formData,
                images: [...formData.images, ...newImageUrls]
            };

            // 4. Save to firestore
            if (isEditing && id) {
                await updateTechnique(id, finalData);
                navigate(`/techniques/${id}`);
            } else {
                const newId = await createTechnique(finalData);
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
                                <input
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    id="icon-button-file"
                                    type="file"
                                    onChange={handleFileChange}
                                    ref={fileInputRef}
                                />
                                <label htmlFor="icon-button-file">
                                    <Button
                                        variant="outlined"
                                        component="span"
                                        startIcon={<PhotoCamera />}
                                    >
                                        Upload Image
                                    </Button>
                                </label>
                            </Box>

                            {(formData.images.length > 0 || newImageFiles.length > 0) && (
                                <Box display="flex" flexWrap="wrap" gap={2}>
                                    {/* Existing Images */}
                                    {formData.images.map((img, index) => (
                                        <Box key={`existing-${img}`} position="relative" width={100} height={100}>
                                            <img src={img} alt={`Existing ${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4 }} />
                                            <Button
                                                size="small"
                                                color="error"
                                                variant="contained"
                                                sx={{ position: 'absolute', top: 0, right: 0, minWidth: 'auto', p: 0.5 }}
                                                onClick={() => handleRemoveExistingImage(index)}
                                            >
                                                X
                                            </Button>
                                        </Box>
                                    ))}

                                    {/* New Images Pending Upload */}
                                    {newImageFiles.map((file, index) => (
                                        <Box key={`new-${file.name}-${file.size}`} position="relative" width={100} height={100}>
                                            <img src={previewUrls[index]} alt={`New ${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4, filter: 'brightness(0.7)' }} />
                                            <Typography variant="caption" sx={{ position: 'absolute', bottom: 4, left: 4, color: 'white', fontWeight: 'bold' }}>New</Typography>
                                            <Button
                                                size="small"
                                                color="error"
                                                variant="contained"
                                                sx={{ position: 'absolute', top: 0, right: 0, minWidth: 'auto', p: 0.5 }}
                                                onClick={() => handleRemoveNewImage(index)}
                                            >
                                                X
                                            </Button>
                                        </Box>
                                    ))}
                                </Box>
                            )}
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <Typography variant="subtitle2" gutterBottom>Videos (YouTube)</Typography>
                            <Box display="flex" gap={1} mb={2}>
                                <TextField
                                    label="Video URL"
                                    fullWidth
                                    size="small"
                                    value={videoInput}
                                    onChange={(e) => { setVideoInput(e.target.value); setVideoInputError(''); }}
                                    placeholder="https://youtube.com/watch?v=..."
                                    error={!!videoInputError}
                                    helperText={videoInputError}
                                />
                                <Button variant="outlined" onClick={handleAddVideo}>Add</Button>
                            </Box>

                            {formData.videos && formData.videos.length > 0 && (
                                <Box display="flex" flexDirection="column" gap={1}>
                                    {formData.videos.map((vid, index) => (
                                        <Box key={index} display="flex" alignItems="center" gap={2}>
                                            <Typography variant="body2" sx={{ flexGrow: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>{vid}</Typography>
                                            <Button size="small" color="error" onClick={() => handleRemoveVideo(index)}>Remove</Button>
                                        </Box>
                                    ))}
                                </Box>
                            )}
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <Typography variant="subtitle2" gutterBottom>Other Resources</Typography>
                            <Box display="flex" gap={1} mb={2}>
                                <TextField
                                    label="Resource URL"
                                    fullWidth
                                    size="small"
                                    value={resourceInput}
                                    onChange={(e) => { setResourceInput(e.target.value); setResourceInputError(''); }}
                                    placeholder="https://example.com/article"
                                    error={!!resourceInputError}
                                    helperText={resourceInputError}
                                />
                                <Button variant="outlined" onClick={handleAddResource}>Add</Button>
                            </Box>

                            {formData.resources && formData.resources.length > 0 && (
                                <Box display="flex" flexDirection="column" gap={1}>
                                    {formData.resources.map((res, index) => (
                                        <Box key={index} display="flex" alignItems="center" gap={2}>
                                            <Typography variant="body2" sx={{ flexGrow: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>{res}</Typography>
                                            <Button size="small" color="error" onClick={() => handleRemoveResource(index)}>Remove</Button>
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
