import { Outlet } from 'react-router-dom';
import { Box, Container } from '@mui/material';
import Navbar from './Navbar';
import Footer from './Footer';
import MobileNavigation from './MobileNavigation';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import OfflineView from '../common/OfflineView';

const Layout = () => {
    const isOnline = useOnlineStatus();

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar />
            <Box component="main" sx={{ flexGrow: 1, py: 4, pb: { xs: 10, md: 4 } }}>
                <Container maxWidth="lg">
                    {isOnline ? <Outlet /> : <OfflineView />}
                </Container>
            </Box>
            <Footer />
            <MobileNavigation />
        </Box>
    );
};

export default Layout;
