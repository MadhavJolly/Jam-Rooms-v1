
import React, { useState, useEffect } from 'react';
import { Notification } from '../types';
import { CloseIcon } from './icons';

interface ToastProps {
    notification: Notification;
    onDismiss: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ notification, onDismiss }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        setVisible(true); // Trigger fade-in
        const timer = setTimeout(() => {
            setVisible(false);
            // Wait for fade-out animation before calling dismiss
            setTimeout(() => onDismiss(notification.id), 300);
        }, 5000);

        return () => clearTimeout(timer);
    }, [notification, onDismiss]);

    const handleDismiss = () => {
        setVisible(false);
        setTimeout(() => onDismiss(notification.id), 300);
    }
    
    const typeClasses = {
        success: 'border-emerald-500 bg-emerald-900/50 text-emerald-300',
        error: 'border-rose-500 bg-rose-900/50 text-rose-300',
        info: 'border-violet-500 bg-violet-900/50 text-violet-300',
    };

    return (
        <div 
            className={`w-full max-w-sm p-4 matrix-bg matrix-border flex items-start justify-between gap-4 transition-all duration-300 ${typeClasses[notification.type]} ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'}`}
            role="alert"
        >
            <p className="text-base">{notification.message}</p>
            <button onClick={handleDismiss} className="p-1 -m-1 flex-shrink-0 text-gray-400 hover:text-white">
                <CloseIcon />
            </button>
        </div>
    );
};


interface NotificationContainerProps {
    notifications: Notification[];
}

const NotificationContainer: React.FC<NotificationContainerProps> = ({ notifications }) => {
    const [toasts, setToasts] = useState<Notification[]>([]);

    useEffect(() => {
        const unread = notifications.filter(n => !n.read);
        if (unread.length > 0) {
            // Add only the latest unread notification as a toast
            const latestNotification = unread[0];
            setToasts(prevToasts => {
                if (prevToasts.some(t => t.id === latestNotification.id)) {
                    return prevToasts;
                }
                return [...prevToasts, latestNotification];
            });
        }
    }, [notifications]);

    const handleDismiss = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    return (
        <div className="fixed top-20 right-4 z-[9999] w-full max-w-sm space-y-3">
            {toasts.map(toast => (
                <Toast key={toast.id} notification={toast} onDismiss={handleDismiss} />
            ))}
        </div>
    );
};

export default NotificationContainer;
