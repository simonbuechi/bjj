import { Card, CardActionArea, CardContent, Typography, Chip, Box, Tooltip } from '@mui/material';
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
                <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                        <Chip
                            label={technique.type}
                            size="small"
                            color="primary"
                            variant="outlined"
                        />
                        <Box sx={{ display: 'flex', gap: 0.5, color: 'text.secondary' }}>
                            {technique.videos && technique.videos.length > 0 && (
                                <Tooltip title="Has Video">
                                    <PlayCircleOutline fontSize="small" />
                                </Tooltip>
                            )}
                            {technique.resources && technique.resources.length > 0 && (
                                <Tooltip title="Has External Link">
                                    <LinkIcon fontSize="small" />
                                </Tooltip>
                            )}
                        </Box>
                    </Box>

                    <Typography gutterBottom variant="h5" component="div" sx={{ fontWeight: 600 }}>
                        {technique.name}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        flexGrow: 1,
                        mb: 2
                    }}>
                        {technique.description}
                    </Typography>

                    {markerStatus && (
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <MarkerIcons status={markerStatus} />
                        </Box>
                    )}
                </CardContent>
            </CardActionArea>
        </Card>
    );
};

export default TechniqueCard;
