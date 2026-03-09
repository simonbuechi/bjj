import { createTheme, type PaletteMode } from '@mui/material/styles';

// ==========================================
// CENTRAL THEME CONFIGURATION
// Modify these values to quickly change the app's look and feel
// ==========================================

export const THEME_COLORS = {
    light: {
        primary: '#22799eff',    // Vibrant Blue
        secondary: '#f58f00ff',  // Amber/Warm Orange
        background: '#eaf6fbff', // Soft Off-white
        paper: '#FFFFFF',
    },
    dark: {
        primary: '#2e9fd0ff',    // Light Blue
        secondary: '#f58f00ff',  // Light Amber
        background: '#0F172A', // Slate Dark
        paper: '#274862ff',      // Slate Slightly Lighter
    }
};

export const getAppTheme = (mode: PaletteMode) => createTheme({
    palette: {
        mode,
        primary: {
            main: mode === 'dark' ? THEME_COLORS.dark.primary : THEME_COLORS.light.primary,
        },
        secondary: {
            main: mode === 'dark' ? THEME_COLORS.dark.secondary : THEME_COLORS.light.secondary,
        },
        background: {
            default: mode === 'dark' ? THEME_COLORS.dark.background : THEME_COLORS.light.background,
            paper: mode === 'dark' ? THEME_COLORS.dark.paper : THEME_COLORS.light.paper,
        },
    },
    typography: {
        fontSize: 12, // Default is 14px. Adjust this to globally change font size.
        fontFamily: '"Poppins", "Inter", "Roboto", "Segoe UI", sans-serif',
        h1: {
            fontWeight: 700,
            letterSpacing: '-0.02em',
        },
        h2: {
            fontWeight: 700,
            letterSpacing: '-0.01em',
        },
        h3: {
            fontWeight: 600,
        },
        h4: {
            fontWeight: 600,
        },
        h5: {
            fontWeight: 600,
        },
        h6: {
            fontWeight: 600,
        },
        button: {
            fontWeight: 600,
            letterSpacing: '0.02em',
        }
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    borderRadius: 8,
                    fontWeight: 600,
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    boxShadow: mode === 'dark' ? '0 4px 6px rgba(0,0,0,0.3)' : '0 4px 6px rgba(0,0,0,0.1)',
                },
            },
        },
    },
});
