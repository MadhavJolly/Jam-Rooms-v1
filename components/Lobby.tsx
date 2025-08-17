import React, { useState } from 'react';
import { Room } from '../types';
import CreateRoomModal from './CreateRoomModal';
import JoinRoomModal from './JoinRoomModal';
import { GlobeAltIcon, MusicNoteIcon, UserIcon, HeartIcon, HeartSolidIcon } from './icons';

interface HomeProps {
    publicRooms: Room[];
    createRoom: (details: { name: string, isPrivate: boolean, description: string, tags: string[] }) => void;
    joinRoom: (id: string) => void;
    likedRoomIds: Set<string>;
    onLikeToggle: (id: string) => void;
    searchQuery: string;
}

const Home: React.FC<HomeProps> = ({ publicRooms, createRoom, joinRoom, likedRoomIds, onLikeToggle, searchQuery }) => {
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [isJoinModalOpen, setJoinModalOpen] = useState(false);

    return (
        <>
            <div className="w-full min-h-full p-8">
                <header className="max-w-5xl mx-auto flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-6xl matrix-text animate-pulse">JAM ROOMS</h1>
                        <p className="text-xl">The decentralized hub for sharing and discovering music.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={() => setCreateModalOpen(true)} className="px-6 py-3 text-2xl matrix-button flex-shrink-0">
                            {'>> CREATE ROOM <<'}
                        </button>
                         <button onClick={() => setJoinModalOpen(true)} className="px-6 py-3 text-2xl matrix-button flex-shrink-0">
                            {'>> JOIN WITH CODE <<'}
                        </button>
                    </div>
                </header>
                
                <hr className="border-[#00FF41]/20 max-w-5xl mx-auto my-8"/>

                <main className="max-w-5xl mx-auto">
                    {searchQuery ? (
                         <h2 className="text-3xl mb-4 matrix-text">{`>> SEARCH RESULTS FOR "${searchQuery}"`}</h2>
                    ) : (
                         <h2 className="text-3xl mb-4 matrix-text">{'>>'} PUBLIC LOBBIES</h2>
                    )}
                    
                    {publicRooms.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {publicRooms.map(room => (
                                <div key={room.id} className="relative flex flex-col p-4 matrix-bg matrix-border hover:bg-[#001c05] transition-all duration-200">
                                    <div className="absolute top-2 right-2 z-10">
                                        <button onClick={() => onLikeToggle(room.id)} className="p-1 text-[#00FF41] hover:scale-125 transition-transform">
                                            {likedRoomIds.has(room.id) ? <HeartSolidIcon /> : <HeartIcon />}
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <GlobeAltIcon />
                                        <h3 className="text-2xl matrix-text truncate">{room.name}</h3>
                                    </div>
                                    <div className="flex flex-wrap gap-1 mb-3">
                                        {room.tags.slice(0, 3).map(tag => <span key={tag} className="text-xs bg-[#002200] px-2 py-0.5 border border-[#00FF41]/50">{tag}</span>)}
                                    </div>
                                    <p className="text-sm text-gray-400 mb-3 h-12 overflow-hidden">
                                        {room.description}
                                    </p>
                                    <div className="flex-grow space-y-2 text-lg mb-4">
                                        <p className="flex items-center gap-2"><UserIcon /> {room.userCount} Users</p>
                                        <p className="flex items-center gap-2"><MusicNoteIcon /> {room.songCount} Jams</p>
                                    </div>
                                    <button onClick={() => joinRoom(room.id)} className="w-full p-2 matrix-button text-lg z-0">
                                        JOIN ROOM
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
            {isJoinModalOpen && (
                <JoinRoomModal
                    onClose={() => setJoinModalOpen(false)}
                    onJoin={joinRoom}
                />
            )}
        </>
    );
};

export default Home;