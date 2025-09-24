
import React from 'react';
import { Room } from '../types';
import { GlobeAltIcon, MusicNoteIcon, UserIcon, HeartSolidIcon } from './icons';

interface LikedRoomsProps {
    likedRooms: Room[];
    joinRoom: (id: string) => void;
    onLikeToggle: (id: string) => void;
}

const LikedRooms: React.FC<LikedRoomsProps> = ({ likedRooms, joinRoom, onLikeToggle }) => {
    return (
        <div className="w-full min-h-full p-8 md:p-12">
            <main className="max-w-7xl mx-auto">
                <h1 className="text-6xl mb-10 matrix-text">{'// LIKED ROOMS'}</h1>
                {likedRooms.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {likedRooms.map(room => (
                            <div key={room.id} className="relative flex flex-col p-6 matrix-bg matrix-border hover:border-[var(--color-accent)] transition-all duration-200">
                                <div className="absolute top-3 right-3 z-10">
                                     <button onClick={() => onLikeToggle(room.id)} className="p-1 text-[#A78BFA] hover:scale-125 transition-transform">
                                        <HeartSolidIcon />
                                    </button>
                                </div>
                                <div className="flex items-center gap-2 mb-3">
                                    <GlobeAltIcon />
                                    <h3 className="text-3xl matrix-text truncate">{room.name}</h3>
                                </div>
                                <div className="flex-grow space-y-2 text-xl mb-6">
                                    <p className="flex items-center gap-2"><UserIcon /> {room.userCount} Users</p>
                                    <p className="flex items-center gap-2"><MusicNoteIcon /> {room.songCount} Jams</p>
                                </div>
                                <button onClick={() => joinRoom(room.id)} className="w-full matrix-button matrix-button-primary">
                                    Join Room
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-xl text-gray-500">You haven't liked any rooms yet. Go back to the <span className="underline">Home</span> page to find some!</p>
                )}
            </main>
        </div>
    );
};

export default LikedRooms;
