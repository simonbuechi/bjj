import { createContext, useContext, useState, useMemo, type ReactNode } from 'react';
import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';
import { getAppTheme } from '../theme/theme';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
    mode: ThemeMode;
    toggleColorMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useAppTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useAppTheme must be used within a ThemeProvider');
    }
    return context;
};

export const CustomThemeProvider = ({ children }: { children: ReactNode }) => {
    // Option to base default on system preference, but user requested 'light' default
    const [mode, setMode] = useState<ThemeMode>('light');

    const toggleColorMode = () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
    };

    const theme = useMemo(() => getAppTheme(mode), [mode]);

    return (
        <ThemeContext.Provider value={{ mode, toggleColorMode }}>
            <MuiThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </MuiThemeProvider>
        </ThemeContext.Provider>
    );
};
