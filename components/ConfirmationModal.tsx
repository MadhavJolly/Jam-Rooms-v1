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
    title, message, confirmText = 'CONFIRM', confirmClass = '', onClose, onConfirm 
}) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[9999]">
            <div className="w-full max-w-md matrix-bg matrix-border p-4 relative">
                <button onClick={onClose} className="absolute top-2 right-2 p-1 hover:text-red-500">
                    <CloseIcon />
                </button>
                <h2 className="text-3xl mb-4 matrix-text">{`// ${title}`}</h2>
                <div className="text-lg text-gray-300 mb-6">
                    {message}
                </div>
                <div className="flex justify-end gap-4">
                    <button onClick={onClose} className="px-4 py-2 matrix-button text-lg">
                        CANCEL
                    </button>
                    <button onClick={onConfirm} className={`px-4 py-2 matrix-button text-lg ${confirmClass}`}>
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
