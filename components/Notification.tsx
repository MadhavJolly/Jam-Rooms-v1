
import React, { useEffect } from 'react';

interface NotificationProps {
    notification: { message: string; type: 'success' | 'error' } | null;
    onClear: () => void;
}

const Notification: React.FC<NotificationProps> = ({ notification, onClear }) => {
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => {
                onClear();
            }, 5000); // Notification disappears after 5 seconds

            return () => clearTimeout(timer);
        }
    }, [notification, onClear]);

    if (!notification) {
        return null;
    }

    const isSuccess = notification.type === 'success';
    const bgColor = isSuccess ? 'bg-green-500/10' : 'bg-red-500/10';
    const borderColor = isSuccess ? 'border-green-500' : 'border-red-500';
    const textColor = isSuccess ? 'text-green-400' : 'text-red-400';

    return (
        <div 
            className={`relative mx-4 my-2 p-3 matrix-bg matrix-border ${borderColor} ${bgColor} ${textColor} transition-opacity duration-300`}
            role="alert"
        >
            <div className="flex justify-between items-center">
                <p>{notification.message}</p>
                <button onClick={onClear} className="ml-4 text-2xl leading-none">&times;</button>
            </div>
        </div>
    );
};

export default Notification;