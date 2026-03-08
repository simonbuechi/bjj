import { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Menu, MenuItem } from '@mui/material';
import { Menu as MenuIcon, Brightness4, Brightness7 } from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAppTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
    const { mode, toggleColorMode } = useAppTheme();
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();
    const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
            handleCloseNavMenu();
        } catch (error) {
            console.error("Failed to log out", error);
        }
    };

    const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElNav(event.currentTarget);
    };

    const handleCloseNavMenu = () => {
        setAnchorElNav(null);
    };

    const pages = [
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
                            fontWeight: 700
                        }}
                    >
                        BJJ Companion
                    </Typography>
                </Box>

                {/* Mobile menu */}
                <Box sx={{ display: { xs: 'flex', md: 'none' }, gap: 1, alignItems: 'center' }}>
                    <IconButton onClick={toggleColorMode} color="inherit">
                        {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
                    </IconButton>
                    <IconButton
                        size="large"
                        onClick={handleOpenNavMenu}
                        color="inherit"
                    >
                        <MenuIcon />
                    </IconButton>
                    <Menu
                        anchorEl={anchorElNav}
                        open={Boolean(anchorElNav)}
                        onClose={handleCloseNavMenu}
                        sx={{ display: { xs: 'block', md: 'none' } }}
                    >
                        {pages.map((page) => (
                            <MenuItem key={page.title} onClick={handleCloseNavMenu} component={RouterLink} to={page.path}>
                                <Typography textAlign="center">{page.title}</Typography>
                            </MenuItem>
                        ))}
                        {currentUser && (
                            <MenuItem onClick={handleLogout}>
                                <Typography textAlign="center">Logout</Typography>
                            </MenuItem>
                        )}
                    </Menu>
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
