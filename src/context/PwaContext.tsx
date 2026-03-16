import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PwaContextType {
    isInstallable: boolean;
    install: () => Promise<void>;
}

const PwaContext = createContext<PwaContextType | undefined>(undefined);

export const PwaProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [isInstallable, setIsInstallable] = useState(false);

    useEffect(() => {
        const handler = (e: Event) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            // Update UI notify the user they can install the PWA
            setIsInstallable(true);
            console.log('beforeinstallprompt event fired');
        };

        window.addEventListener('beforeinstallprompt', handler);

        window.addEventListener('appinstalled', () => {
            // Clear the deferredPrompt so it can be garbage collected
            setDeferredPrompt(null);
            setIsInstallable(false);
            console.log('PWA was installed');
        });

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);

    const install = async () => {
        if (!deferredPrompt) {
            return;
        }
        // Show the install prompt
        await deferredPrompt.prompt();
        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        // We've used the prompt, and can't use it again, throw it away
        if (outcome === 'accepted') {
            setIsInstallable(false);
        }
    };

    return (
        <PwaContext.Provider value={{ isInstallable, install }}>
            {children}
        </PwaContext.Provider>
    );
};

export const usePwa = () => {
    const context = useContext(PwaContext);
    if (context === undefined) {
        throw new Error('usePwa must be used within a PwaProvider');
    }
    return context;
};
