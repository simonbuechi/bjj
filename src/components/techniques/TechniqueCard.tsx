import { Card, CardActionArea, CardContent, CardMedia, Typography, Chip, Box, Tooltip } from '@mui/material';
import { PlayCircleOutline, Link as LinkIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import type { Technique, UserProfile } from '../../types';
import MarkerIcons from './MarkerIcons';

interface TechniqueCardProps {
    technique: Technique;
    userProfile?: UserProfile | null;
}

const TechniqueCard = ({ technique, userProfile }: TechniqueCardProps) => {
    const navigate = useNavigate();
    const markerStatus = userProfile?.markedTechniques?.[technique.id];

    return (
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardActionArea onClick={() => navigate(`/techniques/${technique.id}`)} sx={{ flexGrow: 1 }}>
                <Box sx={{ position: 'relative', height: 140 }}>
                    {technique.images && technique.images.length > 0 ? (
                        <CardMedia
                            component="img"
                            height="140"
                            image={technique.images[0]}
                            alt={technique.name}
                            sx={{ objectFit: 'cover' }}
                            loading="lazy"
                        />
                    ) : (
                        <Box
                            sx={{
                                height: '100%',
                                backgroundColor: 'primary.main',
                            }}
                        />
                    )}
                    <Box sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        p: 1.5,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        background: technique.images && technique.images.length > 0
                            ? 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 70%, rgba(0,0,0,0.7) 100%)'
                            : 'none'
                    }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Chip
                                label={technique.type}
                                size="small"
                                sx={{
                                    textTransform: 'capitalize',
                                    bgcolor: 'background.paper',
                                    color: 'text.primary',
                                    boxShadow: 1
                                }}
                            />
                            <Box sx={{ display: 'flex', gap: 0.5, color: 'white' }}>
                                {technique.videos && technique.videos.length > 0 && (
                                    <Tooltip title="Has Video">
                                        <PlayCircleOutline fontSize="small" sx={{ filter: 'drop-shadow(0px 1px 2px rgba(0,0,0,0.8))' }} />
                                    </Tooltip>
                                )}
                                {technique.resources && technique.resources.length > 0 && (
                                    <Tooltip title="Has External Link">
                                        <LinkIcon fontSize="small" sx={{ filter: 'drop-shadow(0px 1px 2px rgba(0,0,0,0.8))' }} />
                                    </Tooltip>
                                )}
                            </Box>
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                            {markerStatus && (
                                <MarkerIcons status={markerStatus} withShadow />
                            )}
                        </Box>
                    </Box>
                </Box>
                <CardContent>
                    <Typography gutterBottom variant="h5" component="div">
                        {technique.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                    }}>
                        {technique.description}
                    </Typography>
                </CardContent>
            </CardActionArea>
        </Card>
    );
};

export default TechniqueCard;
