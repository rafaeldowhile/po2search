import { useEffect, useCallback } from 'react';

type ShortcutHandler = () => void;

interface ShortcutMap {
    [key: string]: {
        handler: ShortcutHandler;
        description: string;
    };
}

export function useKeyboardShortcuts(shortcuts: ShortcutMap) {
    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        // Don't trigger shortcuts when typing in input fields
        if (event.target instanceof HTMLInputElement ||
            event.target instanceof HTMLTextAreaElement) {
            return;
        }

        const key = event.key.toLowerCase();
        const shortcut = shortcuts[key];

        if (shortcut && !event.ctrlKey && !event.metaKey) {
            event.preventDefault();
            shortcut.handler();
        }
    }, [shortcuts]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    return Object.entries(shortcuts).map(([key, { description }]) => ({
        key,
        description,
    }));
} 