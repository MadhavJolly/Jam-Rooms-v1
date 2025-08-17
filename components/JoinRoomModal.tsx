
import React, { useState } from 'react';
import { CloseIcon } from './icons';

interface JoinRoomModalProps {
    onClose: () => void;
    onJoin: (code: string) => void;
    roomName?: string;
}

const JoinRoomModal: React.FC<JoinRoomModalProps> = ({ onClose, onJoin, roomName }) => {
    const [joinCode, setJoinCode] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (joinCode.trim()) {
            onJoin(joinCode.trim().toUpperCase());
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="w-full max-w-md matrix-bg matrix-border p-4 relative">
                <button onClick={onClose} className="absolute top-2 right-2 p-1 hover:text-red-500">
                    <CloseIcon />
                </button>
                <h2 className="text-3xl mb-2 matrix-text text-center">
                    {roomName ? `JOIN "${roomName}"` : 'JOIN WITH CODE'}
                </h2>
                {roomName && (
                    <p className="text-center text-gray-400 mb-4">This room is private. Please enter the code to connect.</p>
                )}
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input
                        type="text"
                        value={joinCode}
                        onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                        placeholder="ENTER_ROOM_CODE..."
                        className="w-full p-2 matrix-input text-lg text-center"
                        maxLength={6}
                        autoFocus
                    />
                    <button type="submit" className="w-full p-2 matrix-button text-lg" disabled={!joinCode.trim()}>
                        CONNECT
                    </button>
                </form>
            </div>
        </div>
    );
};

export default JoinRoomModal;
