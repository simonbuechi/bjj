import { Card, CardActionArea, CardContent, CardMedia, Typography, Chip, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import type { Technique } from '../../types';

interface TechniqueCardProps {
    technique: Technique;
}

const TechniqueCard = ({ technique }: TechniqueCardProps) => {
    const navigate = useNavigate();

    return (
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardActionArea onClick={() => navigate(`/techniques/${technique.id}`)} sx={{ flexGrow: 1 }}>
                {technique.images && technique.images.length > 0 ? (
                    <CardMedia
                        component="img"
                        height="140"
                        image={technique.images[0]}
                        alt={technique.name}
                        sx={{ objectFit: 'cover' }}
                    />
                ) : (
                    <Box
                        sx={{
                            height: 140,
                            backgroundColor: 'primary.main',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <Typography variant="body2" color="primary.contrastText">No Image</Typography>
                    </Box>
                )}
                <CardContent>
                    <Typography gutterBottom variant="h5" component="div">
                        {technique.name}
                    </Typography>
                    <Box sx={{ mb: 1.5 }}>
                        <Chip
                            label={technique.type}
                            size="small"
                            color="primary"
                            variant="outlined"
                            sx={{ textTransform: 'capitalize' }}
                        />
                    </Box>
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
