import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Keyboard } from "lucide-react";
import { memo } from 'react';

interface ShortcutInfo {
    key: string;
    description: string;
}

interface KeyboardShortcutsProps {
    shortcuts: ShortcutInfo[];
}

export const KeyboardShortcuts = memo(function KeyboardShortcuts({ shortcuts }: KeyboardShortcutsProps) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Keyboard className="h-4 w-4 mr-2" />
                    Keyboard Shortcuts
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Keyboard Shortcuts</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4">
                    {shortcuts.map(({ key, description }) => (
                        <div key={key} className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">{description}</span>
                            <kbd className="px-2 py-1 bg-muted rounded-md text-sm font-mono">
                                {key}
                            </kbd>
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}); 