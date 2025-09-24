
import React, { useState } from 'react';
import { Room } from '../types';
import CreateRoomModal from './CreateRoomModal';
import JoinRoomModal from './JoinRoomModal';
import { GlobeAltIcon, MusicNoteIcon, UserIcon, HeartIcon, HeartSolidIcon, LockClosedIcon } from './icons';

interface HomeProps {
    publicRooms: Room[];
    createRoom: (details: { name: string, isPrivate: boolean, description: string, tags: string[] }) => void;
    joinRoom: (id: string) => void;
    likedRoomIds: Set<string>;
    onLikeToggle: (id: string) => void;
    searchQuery: string;
}

interface JoinModalState {
    isOpen: boolean;
    roomName?: string;
}

const Home: React.FC<HomeProps> = ({ publicRooms, createRoom, joinRoom, likedRoomIds, onLikeToggle, searchQuery }) => {
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [joinModalState, setJoinModalState] = useState<JoinModalState>({ isOpen: false });


    const handleJoinClick = (room: Room) => {
        if (room.isPrivate) {
            setJoinModalState({ isOpen: true, roomName: room.name });
        } else {
            joinRoom(room.id);
        }
    };

    return (
        <>
            <div className="w-full min-h-full p-8 md:p-12">
                <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                    <div>
                        <h1 className="text-7xl matrix-text">JAM ROOMS</h1>
                        <p className="text-2xl text-gray-300">The decentralized hub for sharing and discovering music.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={() => setCreateModalOpen(true)} className="matrix-button matrix-button-secondary">
                            Create Room
                        </button>
                         <button onClick={() => setJoinModalState({ isOpen: true })} className="matrix-button matrix-button-secondary">
                            Join With Code
                        </button>
                    </div>
                </header>
                
                <hr className="border-white/10 max-w-7xl mx-auto my-12"/>

                <main className="max-w-7xl mx-auto">
                    {searchQuery ? (
                         <h2 className="text-4xl mb-6 matrix-text">{`// SEARCH RESULTS FOR "${searchQuery}"`}</h2>
                    ) : (
                         <h2 className="text-4xl mb-6 matrix-text">{'//'} PUBLIC LOBBIES</h2>
                    )}
                    
                    {publicRooms.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {publicRooms.map(room => (
                                <div key={room.id} className="relative flex flex-col p-6 matrix-bg matrix-border hover:border-[var(--color-accent)] transition-all duration-200">
                                    <div className="absolute top-3 right-3 z-10">
                                        <button onClick={() => onLikeToggle(room.id)} className="p-1 text-[#A78BFA] hover:scale-125 transition-transform">
                                            {likedRoomIds.has(room.id) ? <HeartSolidIcon /> : <HeartIcon />}
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-2 mb-3">
                                        {room.isPrivate ? <LockClosedIcon /> : <GlobeAltIcon />}
                                        <h3 className="text-3xl matrix-text truncate">{room.name}</h3>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {room.tags.slice(0, 3).map(tag => <span key={tag} className="text-xs bg-black/30 px-2 py-1 border border-white/10 rounded-full">{tag}</span>)}
                                    </div>
                                    <p className="text-base text-gray-400 mb-4 h-12 overflow-hidden">
                                        {room.description}
                                    </p>
                                    <div className="flex-grow space-y-2 text-xl mb-6">
                                        <p className="flex items-center gap-2"><UserIcon /> {room.userCount || room.users.length} Users</p>
                                        <p className="flex items-center gap-2"><MusicNoteIcon /> {room.songCount || room.musicLinks.length} Jams</p>
                                    </div>
                                    <button onClick={() => handleJoinClick(room)} className="w-full matrix-button matrix-button-primary">
                                        Join Room
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xl text-gray-500">
                            {searchQuery ? 'No rooms found matching your search.' : 'There are currently no public rooms.'}
                        </p>
                    )}
                </main>
            </div>

            {isCreateModalOpen && (
                <CreateRoomModal
                    onClose={() => setCreateModalOpen(false)}
                    onCreate={createRoom}
                />
            )}
            {joinModalState.isOpen && (
                <JoinRoomModal
                    roomName={joinModalState.roomName}
                    onClose={() => setJoinModalState({ isOpen: false })}
                    onJoin={joinRoom}
                />
            )}
        </>
    );
};

export default Home;
