
import React, { useState } from 'react';
import { User } from '../types';

interface ProfileProps {
    user: User;
    onUpdateProfile: (name: string, color: string) => void;
    onBack: () => void;
}

const colorPalette = [
    '#00FF41', // Matrix Green
    '#39FF14', // Neon Green
    '#00FFFF', // Cyan
    '#FF00FF', // Magenta
    '#FFFF00', // Yellow
    '#FF5F1F', // Bright Orange
];

const Profile: React.FC<ProfileProps> = ({ user, onUpdateProfile, onBack }) => {
    const [name, setName] = useState(user.name);
    const [color, setColor] = useState(user.color);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            onUpdateProfile(name.trim(), color);
        }
    };

    return (
        <div className="w-full h-full flex items-center justify-center p-8">
            <div className="w-full max-w-lg p-6 matrix-bg matrix-border">
                <h1 className="text-4xl mb-6 matrix-text text-center">{'// USER PROFILE'}</h1>
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <div>
                        <label className="block mb-2 text-xl">Username</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-2 matrix-input text-lg"
                            maxLength={15}
                        />
                    </div>
                    <div>
                        <label className="block mb-2 text-xl">Chat Color</label>
                        <div className="flex gap-2 flex-wrap">
                            {colorPalette.map(c => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => setColor(c)}
                                    className={`w-12 h-12 transition-transform duration-150 ${color === c ? 'ring-2 ring-offset-2 ring-offset-black ring-white scale-110' : ''}`}
                                    style={{ backgroundColor: c }}
                                    aria-label={`Select color ${c}`}
                                ></button>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="text-xl">Preview:</span>
                        <span className="text-xl font-bold" style={{ color: color }}>
                            {name.trim() || user.name}:~$ Hello world!
                        </span>
                    </div>
                    <div className="flex gap-4 mt-4">
                        <button type="button" onClick={onBack} className="w-full p-3 matrix-button text-xl">
                            {'<< BACK'}
                        </button>
                        <button type="submit" className="w-full p-3 matrix-button text-xl" disabled={!name.trim()}>
                            {'SAVE >>'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Profile;