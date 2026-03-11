import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { CustomThemeProvider } from './context/ThemeContext';
import App from './App.tsx';

import '@fontsource/poppins/300.css';
import '@fontsource/poppins/400.css';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CustomThemeProvider>
      <App />
    </CustomThemeProvider>
  </StrictMode>,
)

