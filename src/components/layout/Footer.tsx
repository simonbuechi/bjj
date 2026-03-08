import { Box, Container, Typography, Link as MuiLink } from '@mui/material';
import packageJson from '../../../package.json';

const Footer = () => {
    return (
        <Box
            component="footer"
            sx={{
                py: 3,
                px: 2,
                mt: 'auto',
                backgroundColor: (theme) => theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[900]
            }}
        >
            <Container
                maxWidth="lg"
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexDirection: 'column',
                    gap: 1
                }}
            >

                <Typography variant="body2" color="text.secondary">
                    &copy; {new Date().getFullYear()} Simon Buechi | v{packageJson.version} | &nbsp;
                    <MuiLink href="https://github.com/simonbuechi/bjj" target="_blank" rel="noopener noreferrer" color="inherit">
                        GitHub Repo
                    </MuiLink>
                </Typography>
            </Container>
        </Box>
    );
};

export default Footer;
