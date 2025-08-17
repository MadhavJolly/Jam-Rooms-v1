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
        <div className="w-full min-h-full p-8">
            <main className="max-w-5xl mx-auto">
                <h1 className="text-5xl mb-6 matrix-text animate-pulse">{'// LIKED ROOMS'}</h1>
                {likedRooms.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {likedRooms.map(room => (
                            <div key={room.id} className="relative flex flex-col p-4 matrix-bg matrix-border group hover:bg-[#001c05] transition-all duration-200">
                                <div className="absolute top-2 right-2">
                                     <button onClick={() => onLikeToggle(room.id)} className="p-1 text-[#00FF41] hover:scale-125 transition-transform">
                                        <HeartSolidIcon />
                                    </button>
                                </div>
                                <div className="flex items-center gap-2 mb-2">
                                    <GlobeAltIcon />
                                    <h3 className="text-2xl matrix-text truncate">{room.name}</h3>
                                </div>
                                <div className="flex-grow space-y-2 text-lg mb-4">
                                    <p className="flex items-center gap-2"><UserIcon /> {room.userCount} Users</p>
                                    <p className="flex items-center gap-2"><MusicNoteIcon /> {room.songCount} Jams</p>
                                </div>
                                <button onClick={() => joinRoom(room.id)} className="w-full p-2 matrix-button text-lg">
                                    JOIN ROOM
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