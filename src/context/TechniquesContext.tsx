import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from 'react';
import { getTechniques as fetchTechniques } from '../services/db';
import type { Technique } from '../types';

interface TechniquesContextType {
    techniques: Technique[];
    loading: boolean;
    error: string;
    loadTechniques: () => Promise<void>;
    refreshTechniques: () => Promise<void>;
}

const TechniquesContext = createContext<TechniquesContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useTechniques = () => {
    const context = useContext(TechniquesContext);
    if (context === undefined) {
        throw new Error('useTechniques must be used within a TechniquesProvider');
    }
    return context;
};

export const TechniquesProvider = ({ children }: { children: ReactNode }) => {
    const [techniques, setTechniques] = useState<Technique[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const hasFetched = useRef(false);

    const loadTechniques = useCallback(async (force = false) => {
        // Return cached data if already fetched and not forced
        if (hasFetched.current && !force) return;

        try {
            setLoading(true);
            setError('');
            const data = await fetchTechniques();
            setTechniques(data);
            hasFetched.current = true;
        } catch (err) {
            console.error(err);
            setError('Failed to load techniques.');
        } finally {
            setLoading(false);
        }
    }, []);

    const refreshTechniques = useCallback(async () => {
        await loadTechniques(true);
    }, [loadTechniques]);

    return (
        <TechniquesContext.Provider value={{ techniques, loading, error, loadTechniques: () => loadTechniques(false), refreshTechniques }}>
            {children}
        </TechniquesContext.Provider>
    );
};
