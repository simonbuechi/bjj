import { useState, useEffect } from 'react';
import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import { Home, LibraryBooks, Book, Person } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const MobileNavigation = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [value, setValue] = useState(0);

    useEffect(() => {
        // Keep the selected state in sync with the current URL path
        if (location.pathname === '/') {
            setValue(0);
        } else if (location.pathname.startsWith('/techniques')) {
            setValue(1);
        } else if (location.pathname.startsWith('/journal')) {
            setValue(2);
        } else if (location.pathname.startsWith('/profile')) {
            setValue(3);
        }
    }, [location.pathname]);

    return (
        <Paper
            sx={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                display: { xs: 'block', md: 'none' }, // Only show on mobile
                zIndex: 1000,
            }}
            elevation={3}
        >
            <BottomNavigation
                showLabels
                value={value}
                onChange={(_, newValue) => {
                    setValue(newValue);
                    if (newValue === 0) navigate('/');
                    else if (newValue === 1) navigate('/techniques');
                    else if (newValue === 2) navigate('/journal');
                    else if (newValue === 3) navigate('/profile');
                }}
            >
                <BottomNavigationAction label="Home" icon={<Home />} />
                <BottomNavigationAction label="Techniques" icon={<LibraryBooks />} />
                <BottomNavigationAction label="Journal" icon={<Book />} />
                <BottomNavigationAction label="Profile" icon={<Person />} />
            </BottomNavigation>
        </Paper>
    );
};

export default MobileNavigation;
