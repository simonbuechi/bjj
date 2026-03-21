import { AppBar, Toolbar, Typography, Button, Box, IconButton } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAppTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
    const { mode, toggleColorMode } = useAppTheme();
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error("Failed to log out", error);
        }
    };

    const pages = [
        { title: 'Techniques', path: '/techniques' },
        { title: 'Journal', path: '/journal' },
        { title: 'Profile', path: '/profile' }
    ];

    return (
        <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Toolbar>
                <Box
                    component={RouterLink}
                    to="/"
                    sx={{
                        flexGrow: 1,
                        display: 'flex',
                        alignItems: 'center',
                        textDecoration: 'none'
                    }}
                >
                    <Box
                        component="img"
                        src={`${import.meta.env.BASE_URL}logo.webp`}
                        alt="Logo"
                        sx={{ height: 32, mr: 1.5 }}
                    />
                    <Typography
                        variant="h6"
                        sx={{
                            color: 'primary.main',
                            fontWeight: 600
                        }}
                    >
                        BJJ Amigo
                    </Typography>
                </Box>

                {/* Desktop menu */}
                <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2, alignItems: 'center' }}>
                    {pages.map((page) => (
                        <Button key={page.title} color="inherit" component={RouterLink} to={page.path}>
                            {page.title}
                        </Button>
                    ))}
                    {currentUser && (
                        <Button color="inherit" onClick={handleLogout}>
                            Logout
                        </Button>
                    )}
                    <IconButton sx={{ ml: 1 }} onClick={toggleColorMode} color="inherit">
                        {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
                    </IconButton>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;
