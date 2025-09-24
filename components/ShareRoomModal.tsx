
import React, { useState } from 'react';
import { Room } from '../types';
import { CloseIcon } from './icons';

interface ShareRoomModalProps {
    room: Room;
    onClose: () => void;
}

const ShareRoomModal: React.FC<ShareRoomModalProps> = ({ room, onClose }) => {
    const [copyStatus, setCopyStatus] = useState('COPY LINK');
    const shareLink = `${window.location.origin}${window.location.pathname}#join=${room.id}`;
    
    // Using a public QR code generator API, themed to match the app
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(shareLink)}&bgcolor=121212&color=A78BFA&qzone=1&format=svg`;

    const handleCopy = () => {
        navigator.clipboard.writeText(shareLink);
        setCopyStatus('COPIED!');
        setTimeout(() => setCopyStatus('COPY LINK'), 2000);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-md matrix-bg matrix-border p-6 relative text-center">
                <button onClick={onClose} className="absolute top-3 right-3 p-1 text-gray-400 hover:text-rose-500 transition-colors">
                    <CloseIcon />
                </button>
                <h2 className="text-3xl mb-4 matrix-text">{`// SHARE ROOM: ${room.name}`}</h2>
                <p className="text-gray-400 mb-6">Invite others to join with this link or QR code.</p>
                
                <div className="mb-6 p-2 matrix-border bg-black inline-block rounded-lg">
                    <img src={qrCodeUrl} alt="Room QR Code" className="mx-auto rounded-md"/>
                </div>

                <div className="flex flex-col gap-2">
                    <label htmlFor="share-link-input" className="text-left text-lg">Shareable Link</label>
                    <div className="flex gap-2">
                        <input
                            id="share-link-input"
                            type="text"
                            readOnly
                            value={shareLink}
                            className="w-full p-2 matrix-input text-base"
                        />
                        <button onClick={handleCopy} className="px-4 py-2 matrix-button matrix-button-primary text-base w-40 flex-shrink-0">
                            {copyStatus}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShareRoomModal;
