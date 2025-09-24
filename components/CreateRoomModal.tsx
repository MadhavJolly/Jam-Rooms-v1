
import React, { useState } from 'react';
import { CloseIcon } from './icons';

interface CreateRoomModalProps {
    onClose: () => void;
    onCreate: (details: { name: string; isPrivate: boolean; description: string; tags: string[] }) => void;
}

const CreateRoomModal: React.FC<CreateRoomModalProps> = ({ onClose, onCreate }) => {
    const [roomName, setRoomName] = useState('');
    const [description, setDescription] = useState('');
    const [tags, setTags] = useState('');
    const [isPrivate, setIsPrivate] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (roomName.trim() && description.trim()) {
            onCreate({
                name: roomName.trim(),
                isPrivate,
                description: description.trim(),
                tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
            });
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-lg matrix-bg matrix-border p-6 relative">
                <button onClick={onClose} className="absolute top-3 right-3 p-1 text-gray-400 hover:text-rose-500 transition-colors">
                    <CloseIcon />
                </button>
                <h2 className="text-4xl mb-6 matrix-text">CREATE NEW ROOM</h2>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input
                        type="text"
                        value={roomName}
                        onChange={(e) => setRoomName(e.target.value)}
                        placeholder="Room Name..."
                        className="p-3 matrix-input text-lg"
                        required
                        maxLength={30}
                    />
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Room Description..."
                        className="p-3 matrix-input text-lg h-28 resize-none"
                        required
                        maxLength={150}
                    />
                    <input
                        type="text"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        placeholder="Genre Tags (comma-separated)..."
                        className="p-3 matrix-input text-lg"
                        maxLength={50}
                    />
                    <label className="flex items-center gap-3 text-lg cursor-pointer group py-2">
                        <div className="w-5 h-5 border border-[var(--color-border)] rounded-sm flex items-center justify-center transition-all duration-200 group-hover:border-[var(--color-accent)]">
                           <input
                                type="checkbox"
                                checked={isPrivate}
                                onChange={(e) => setIsPrivate(e.target.checked)}
                                className="w-full h-full appearance-none cursor-pointer checked:bg-[var(--color-accent)]"
                            />
                        </div>
                        <span>Make Room Private (Invite Only)</span>
                    </label>
                    <button type="submit" className="matrix-button matrix-button-primary w-full mt-2" disabled={!roomName.trim() || !description.trim()}>
                        CREATE
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateRoomModal;
