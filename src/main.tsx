import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { CustomThemeProvider } from './context/ThemeContext';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CustomThemeProvider>
      <App />
    </CustomThemeProvider>
  </StrictMode>,
)
