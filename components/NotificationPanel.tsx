
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
    
    return (
        <div className="fixed inset-0 bg-black/50 z-[9990]" onClick={onClose}>
            <div 
                className="absolute top-16 right-4 w-full max-w-md matrix-bg matrix-border flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <header className="flex justify-between items-center p-2 border-b border-[#00FF41]/30">
                    <h3 className="matrix-text text-xl">NOTIFICATIONS</h3>
                    <button onClick={onClose} className="p-1 hover:text-red-500"><CloseIcon/></button>
                </header>
                <div className="flex-grow p-2 overflow-y-auto max-h-[60vh]">
                    {notifications.length > 0 ? (
                        <ul className="space-y-2">
                            {notifications.map(n => (
                                <li key={n.id} className="text-sm border-l-2 pl-2" style={{ borderColor: n.type === 'success' ? '#22c55e' : n.type === 'error' ? '#ef4444' : '#38bdf8' }}>
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
                     <footer className="p-2 border-t border-[#00FF41]/30">
                        <button onClick={onClearAll} className="w-full text-center py-1 text-sm matrix-button !bg-gray-800/50 hover:!bg-gray-700">
                            CLEAR ALL
                        </button>
                    </footer>
                )}
            </div>
        </div>
    );
};

export default NotificationPanel;