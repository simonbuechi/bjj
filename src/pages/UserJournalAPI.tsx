import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getJournalEntries, getTechniques } from '../services/db';

const UserJournalAPI = () => {
    const { userId } = useParams<{ userId: string }>();
    const [data, setData] = useState<any[] | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!userId) {
            setError('User ID is required');
            return;
        }
        
        Promise.all([
            getJournalEntries(userId),
            getTechniques()
        ])
            .then(([entries, techniques]) => {
                const techniquesMap = new Map(techniques.map(t => [t.id, t.name]));
                
                const enrichedEntries = entries.map(entry => {
                    const { techniqueIds, ...rest } = entry;
                    return {
                        ...rest,
                        techniques: techniqueIds ? techniqueIds.map(id => techniquesMap.get(id) || id) : []
                    };
                });
                
                setData(enrichedEntries);
            })
            .catch(err => {
                setError(err.message || 'Failed to fetch journal entries');
            });
    }, [userId]);

    if (error) {
        return <pre style={{ margin: 0, padding: 16 }}>{JSON.stringify({ error }, null, 2)}</pre>;
    }

    if (!data) {
        return <pre style={{ margin: 0, padding: 16 }}>{JSON.stringify({ loading: true }, null, 2)}</pre>;
    }

    return <pre style={{ margin: 0, padding: 16 }}>{JSON.stringify(data, null, 2)}</pre>;
};

export default UserJournalAPI;
