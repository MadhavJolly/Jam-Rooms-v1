
import React from 'react';
import { Notification } from '../types';
import { CloseIcon } from './icons';

interface NotificationPanelProps {
    notifications: Notification[];
    onClose: () => void;
    onClearAll: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ notifications, onClose, onClearAll }) => {
    const formatTimestamp = (ts: number) => {
        const now = new Date();
        const date = new Date(ts);
        const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
        
        if (diffSeconds < 60) return `${diffSeconds}s ago`;
        const diffMinutes = Math.floor(diffSeconds / 60);
        if (diffMinutes < 60) return `${diffMinutes}m ago`;
        const diffHours = Math.floor(diffMinutes / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        return date.toLocaleDateString();
    };
    
    const typeColors = {
        success: 'var(--color-success, #10B981)',
        error: 'var(--color-danger, #F43F5E)',
        info: 'var(--color-accent, #A78BFA)',
    };
    
    return (
        <div className="fixed inset-0 bg-black/50 z-[9990]" onClick={onClose}>
            <div 
                className="absolute top-20 right-4 w-full max-w-md matrix-bg matrix-border flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <header className="flex justify-between items-center p-3 border-b border-white/10">
                    <h3 className="matrix-text text-2xl">NOTIFICATIONS</h3>
                    <button onClick={onClose} className="p-1 text-gray-400 hover:text-rose-500 transition-colors"><CloseIcon/></button>
                </header>
                <div className="flex-grow p-3 overflow-y-auto max-h-[60vh]">
                    {notifications.length > 0 ? (
                        <ul className="space-y-3">
                            {notifications.map(n => (
                                <li key={n.id} className="text-base border-l-2 pl-3" style={{ borderColor: typeColors[n.type] }}>
                                    <p>{n.message}</p>
                                    <span className="text-xs text-gray-500">{formatTimestamp(n.timestamp)}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500 text-center p-4">No new notifications.</p>
                    )}
                </div>
                {notifications.length > 0 && (
                     <footer className="p-2 border-t border-white/10">
                        <button onClick={onClearAll} className="w-full matrix-button matrix-button-secondary !border-gray-600 !text-gray-400 hover:!bg-gray-700 hover:!text-white text-sm">
                            CLEAR ALL
                        </button>
                    </footer>
                )}
            </div>
        </div>
    );
};

export default NotificationPanel;
