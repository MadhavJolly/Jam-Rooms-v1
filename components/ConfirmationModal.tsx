
import React from 'react';
import { CloseIcon } from './icons';

interface ConfirmationModalProps {
    title: string;
    message: React.ReactNode;
    confirmText?: string;
    confirmClass?: string;
    onClose: () => void;
    onConfirm: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ 
    title, message, confirmText = 'CONFIRM', confirmClass = 'matrix-button-primary', onClose, onConfirm 
}) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[9999] p-4">
            <div className="w-full max-w-md matrix-bg matrix-border p-6 relative">
                <button onClick={onClose} className="absolute top-3 right-3 p-1 text-gray-400 hover:text-rose-500 transition-colors">
                    <CloseIcon />
                </button>
                <h2 className="text-3xl mb-4 matrix-text">{`// ${title}`}</h2>
                <div className="text-lg text-gray-300 mb-8">
                    {message}
                </div>
                <div className="flex justify-end gap-4">
                    <button onClick={onClose} className="matrix-button matrix-button-secondary">
                        CANCEL
                    </button>
                    <button onClick={onConfirm} className={`matrix-button ${confirmClass}`}>
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
