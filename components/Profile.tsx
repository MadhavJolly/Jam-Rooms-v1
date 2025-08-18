
import React, { useState, useMemo } from 'react';
import { User, Room, MusicLink } from '../types';
import { UserIcon, HeartIcon, PlusCircleIcon, ArrowUpTrayIcon, ChatBubbleLeftIcon } from './icons';

interface ProfileProps {
    user: User;
    publicRooms: Room[];
    onUpdateProfile: (details: Partial<User>) => void;
    onBack: () => void;
}

const colorPalette = [
    '#00FF41', '#39FF14', '#00FFFF', '#FF00FF', '#FFFF00', '#FF5F1F',
];

const Profile: React.FC<ProfileProps> = ({ user, publicRooms, onUpdateProfile, onBack }) => {
    const [name, setName] = useState(user.name);
    const [color, setColor] = useState(user.color);
    const [bio, setBio] = useState(user.bio || '');
    const [status, setStatus] = useState(user.status || '');
    const [onlineStatus, setOnlineStatus] = useState(user.onlineStatus || 'online');
    const [favoriteGenres, setFavoriteGenres] = useState((user.favoriteGenres || []).join(', '));
    
    const stats = useMemo(() => {
        let roomsCreated = 0;
        let tracksShared = 0;
        let messagesPosted = 0;
        let likesReceived = 0;
        let recentlyShared: (MusicLink & {roomName: string})[] = [];
        let recentlyLiked: (MusicLink & {roomName: string})[] = [];

        for (const room of publicRooms) {
            if (room.creatorId === user.id) {
                roomsCreated++;
            }
            for (const msg of room.messages) {
                if (msg.user.id === user.id) {
                    messagesPosted++;
                }
            }
            for (const link of room.musicLinks) {
                if (link.user.id === user.id) {
                    tracksShared++;
                    likesReceived += link.likes.length;
                    recentlyShared.push({...link, roomName: room.name});
                }
                if (link.likes.includes(user.id)) {
                    recentlyLiked.push({...link, roomName: room.name});
                }
            }
        }
        return { 
            roomsCreated, 
            tracksShared, 
            messagesPosted, 
            likesReceived,
            recentlyShared: recentlyShared.sort((a,b) => b.timestamp - a.timestamp).slice(0, 5),
            recentlyLiked: recentlyLiked.sort((a,b) => b.timestamp - a.timestamp).slice(0, 5), // Assuming we want to sort by when the track was posted
            createdRooms: publicRooms.filter(r => r.creatorId === user.id).sort((a,b) => b.messages[0]?.timestamp - a.messages[0]?.timestamp).slice(0, 5) // A bit of a guess on timestamp
        };
    }, [user.id, publicRooms]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            onUpdateProfile({
                name: name.trim(),
                color,
                bio: bio.trim(),
                status: status.trim(),
                onlineStatus,
                favoriteGenres: favoriteGenres.split(',').map(g => g.trim()).filter(Boolean),
            });
        }
    };
    
    const StatCard: React.FC<{icon: React.ReactNode, label: string, value: number | string}> = ({icon, label, value}) => (
        <div className="flex items-center gap-3 p-3 matrix-bg border border-[#00FF41]/30">
            <div className="text-[#00FF41]">{icon}</div>
            <div>
                <p className="text-2xl font-bold leading-none">{value}</p>
                <p className="text-sm text-gray-400 leading-none">{label}</p>
            </div>
        </div>
    );

    return (
        <div className="w-full min-h-full p-8">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Edit Profile */}
                <div className="lg:col-span-1">
                    <div className="p-4 matrix-bg matrix-border">
                        <h2 className="text-3xl mb-4 matrix-text">{'// EDIT PROFILE'}</h2>
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <div>
                                <label className="block mb-1 text-lg">Handle</label>
                                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 matrix-input" maxLength={15} />
                            </div>
                             <div>
                                <label className="block mb-1 text-lg">Status</label>
                                <input type="text" value={status} onChange={(e) => setStatus(e.target.value)} className="w-full p-2 matrix-input" placeholder="What are you listening to?" maxLength={40} />
                            </div>
                            <div>
                                <label className="block mb-1 text-lg">Bio</label>
                                <textarea value={bio} onChange={(e) => setBio(e.target.value)} className="w-full p-2 matrix-input h-20 resize-none" placeholder="Tell us about yourself..." maxLength={150}/>
                            </div>
                             <div>
                                <label className="block mb-1 text-lg">Favorite Genres</label>
                                <input type="text" value={favoriteGenres} onChange={(e) => setFavoriteGenres(e.target.value)} className="w-full p-2 matrix-input" placeholder="synthwave, lofi, rock..." maxLength={80}/>
                            </div>
                            <div>
                                <label className="block mb-1 text-lg">Chat Color</label>
                                <div className="flex gap-2 flex-wrap">
                                    {colorPalette.map(c => (
                                        <button key={c} type="button" onClick={() => setColor(c)}
                                            className={`w-10 h-10 transition-transform duration-150 ${color === c ? 'ring-2 ring-offset-2 ring-offset-black ring-white scale-110' : ''}`}
                                            style={{ backgroundColor: c }} aria-label={`Select color ${c}`}/>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block mb-1 text-lg">Visibility</label>
                                <div className="flex items-center gap-4 p-2 matrix-input">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" name="status" checked={onlineStatus === 'online'} onChange={() => setOnlineStatus('online')} className="w-4 h-4 appearance-none matrix-input checked:bg-[#00FF41]"/> Online
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" name="status" checked={onlineStatus === 'offline'} onChange={() => setOnlineStatus('offline')} className="w-4 h-4 appearance-none matrix-input checked:bg-[#00FF41]"/> Offline
                                    </label>
                                </div>
                            </div>
                            <div className="flex gap-4 mt-2">
                                <button type="button" onClick={onBack} className="w-full p-2 matrix-button text-lg">{'<< BACK'}</button>
                                <button type="submit" className="w-full p-2 matrix-button text-lg" disabled={!name.trim()}>{'SAVE >>'}</button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Right Column: Stats and Activity */}
                <div className="lg:col-span-2 space-y-8">
                     {/* Stats */}
                    <div>
                        <h2 className="text-3xl mb-4 matrix-text">{'// STATISTICS'}</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <StatCard icon={<PlusCircleIcon />} label="Rooms Created" value={stats.roomsCreated} />
                            <StatCard icon={<ArrowUpTrayIcon />} label="Tracks Shared" value={stats.tracksShared} />
                            <StatCard icon={<ChatBubbleLeftIcon />} label="Messages Sent" value={stats.messagesPosted} />
                            <StatCard icon={<HeartIcon />} label="Likes Received" value={stats.likesReceived} />
                        </div>
                    </div>

                    {/* Activity */}
                    <div>
                        <h2 className="text-3xl mb-4 matrix-text">{'// RECENT ACTIVITY'}</h2>
                        <div className="space-y-4">
                            <div className="p-4 matrix-bg matrix-border">
                                <h3 className="text-xl border-b border-[#00FF41]/30 pb-2 mb-2">Recently Shared Tracks</h3>
                                {stats.recentlyShared.length > 0 ? (
                                    <ul className="space-y-1 text-sm">
                                        {stats.recentlyShared.map(link => <li key={link.id}>{`"${link.title}" in room "${link.roomName}"`}</li>)}
                                    </ul>
                                ) : <p className="text-gray-500">No tracks shared recently.</p>}
                            </div>
                            <div className="p-4 matrix-bg matrix-border">
                                <h3 className="text-xl border-b border-[#00FF41]/30 pb-2 mb-2">Recently Liked Tracks</h3>
                                 {stats.recentlyLiked.length > 0 ? (
                                    <ul className="space-y-1 text-sm">
                                        {stats.recentlyLiked.map(link => <li key={link.id}>{`"${link.title}" shared by ${link.user.name} in room "${link.roomName}"`}</li>)}
                                    </ul>
                                ) : <p className="text-gray-500">No tracks liked recently.</p>}
                            </div>
                            <div className="p-4 matrix-bg matrix-border">
                                <h3 className="text-xl border-b border-[#00FF41]/30 pb-2 mb-2">Recently Created Rooms</h3>
                                 {stats.createdRooms.length > 0 ? (
                                    <ul className="space-y-1 text-sm">
                                        {stats.createdRooms.map(room => <li key={room.id}>{`Created room "${room.name}"`}</li>)}
                                    </ul>
                                ) : <p className="text-gray-500">No rooms created recently.</p>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
