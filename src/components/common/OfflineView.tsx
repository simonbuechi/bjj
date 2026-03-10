import { Box, Typography, Button } from '@mui/material';
import WifiOffIcon from '@mui/icons-material/WifiOff';

const OfflineView = () => {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '60vh',
                textAlign: 'center',
                px: 3,
            }}
        >
            <WifiOffIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
            <Typography variant="h4" gutterBottom fontWeight="bold">
                You're Offline
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 400 }}>
                It looks like you've lost your connection. Some features of BJJ Amigo may be unavailable until you're back online.
            </Typography>
            <Button
                variant="contained"
                onClick={() => window.location.reload()}
                sx={{
                    borderRadius: '50px',
                    px: 4,
                    background: 'linear-gradient(45deg, #2e9fd0 30%, #4fc3f7 90%)',
                    boxShadow: '0 3px 5px 2px rgba(46, 159, 208, .3)',
                }}
            >
                Retry Connection
            </Button>
        </Box>
    );
};

export default OfflineView;
