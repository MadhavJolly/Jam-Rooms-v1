
import React, { useState, useMemo } from 'react';
import { User, Room, MusicLink } from '../types';
import { UserIcon } from './icons';

interface ProfileProps {
    user: User;
    currentUser: User;
    publicRooms: Room[];
    onUpdateProfile: (details: Partial<User>) => void;
    onBack: () => void;
    onSendFriendRequest: (targetUserId: string) => void;
    onRemoveFriend: (friendId: string) => void;
}

const colorPalette = [
    '#A78BFA', '#39FF14', '#00FFFF', '#FF00FF', '#FFFF00', '#FF5F1F',
];

const Profile: React.FC<ProfileProps> = ({ user, currentUser, publicRooms, onUpdateProfile, onBack, onSendFriendRequest, onRemoveFriend }) => {
    const isOwnProfile = user.id === currentUser.id;

    // State for editing form
    const [name, setName] = useState(user.name);
    const [color, setColor] = useState(user.color || '#A78BFA');
    const [bio, setBio] = useState(user.bio || '');
    const [status, setStatus] = useState(user.status || '');
    const [onlineStatus, setOnlineStatus] = useState(user.onlineStatus || 'online');
    const [favoriteGenres, setFavoriteGenres] = useState((user.favoriteGenres || []).join(', '));
    
    const activityData = useMemo(() => {
        let recentlyShared: (MusicLink & {roomName: string})[] = [];
        let recentlyLiked: (MusicLink & {roomName: string})[] = [];

        for (const room of publicRooms) {
            for (const link of room.musicLinks) {
                if (link.user.id === user.id) {
                    recentlyShared.push({...link, roomName: room.name});
                }
                if (link.likes.includes(user.id)) {
                    recentlyLiked.push({...link, roomName: room.name});
                }
            }
        }
        return { 
            recentlyShared: recentlyShared.sort((a,b) => b.timestamp - a.timestamp).slice(0, 5),
            recentlyLiked: recentlyLiked.sort((a,b) => b.timestamp - a.timestamp).slice(0, 5),
            createdRooms: publicRooms.filter(r => r.creatorId === user.id).slice(0, 5)
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

    const friendStatus = useMemo(() => {
        if (isOwnProfile) return 'self';
        if (currentUser.friendIds?.includes(user.id)) return 'friends';
        if (currentUser.incomingFriendRequests?.includes(user.id)) return 'request_received';
        if (user.incomingFriendRequests?.includes(currentUser.id)) return 'request_sent';
        return 'not_friends';
    }, [currentUser, user, isOwnProfile]);

    const renderSocialButton = () => {
        switch(friendStatus) {
            case 'friends':
                return <button onClick={() => onRemoveFriend(user.id)} className="w-full matrix-button matrix-button-danger">Remove Friend</button>;
            case 'request_sent':
                return <button className="w-full matrix-button matrix-button-secondary" disabled>Request Pending</button>;
            case 'request_received':
                 return <p className="text-center text-yellow-400">This user sent you a friend request. Check your Friends page to respond.</p>;
            case 'not_friends':
                return <button onClick={() => onSendFriendRequest(user.id)} className="w-full matrix-button matrix-button-primary">Add Friend</button>;
            default:
                return null;
        }
    };
    
    return (
        <div className="w-full min-h-full p-8 md:p-12">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Profile Info / Edit Form */}
                <div className="lg:col-span-1">
                    <div className="p-6 matrix-bg matrix-border">
                        {isOwnProfile ? (
                            <>
                                <h2 className="text-4xl mb-6 matrix-text">{'// EDIT PROFILE'}</h2>
                                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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
                                        <textarea value={bio} onChange={(e) => setBio(e.target.value)} className="w-full p-2 matrix-input h-24 resize-none" placeholder="Tell us about yourself..." maxLength={150}/>
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
                                                    className={`w-10 h-10 rounded-md transition-transform duration-150 ${color === c ? 'ring-2 ring-offset-2 ring-offset-black ring-white scale-110' : ''}`}
                                                    style={{ backgroundColor: c }} aria-label={`Select color ${c}`}/>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block mb-1 text-lg">Visibility</label>
                                        <div className="flex items-center gap-4 p-2 matrix-input bg-transparent">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input type="radio" name="status" checked={onlineStatus === 'online'} onChange={() => setOnlineStatus('online')} className="w-4 h-4 appearance-none rounded-full border border-gray-400 checked:bg-[var(--color-accent)] checked:border-transparent"/> Online
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input type="radio" name="status" checked={onlineStatus === 'offline'} onChange={() => setOnlineStatus('offline')} className="w-4 h-4 appearance-none rounded-full border border-gray-400 checked:bg-[var(--color-accent)] checked:border-transparent"/> Offline
                                            </label>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 mt-4">
                                        <button type="button" onClick={onBack} className="w-full matrix-button matrix-button-secondary">{'Back'}</button>
                                        <button type="submit" className="w-full matrix-button matrix-button-primary" disabled={!name.trim()}>{'Save'}</button>
                                    </div>
                                </form>
                            </>
                        ) : (
                             <>
                                <h2 className="text-4xl mb-6 matrix-text truncate">{`// PROFILE: ${user.name}`}</h2>
                                <div className="space-y-4 text-lg">
                                    <div className="flex items-center gap-2">
                                        <span className={`w-3 h-3 rounded-full ${user.onlineStatus === 'online' ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                                        <span>{user.onlineStatus === 'online' ? 'Online' : 'Offline'}</span>
                                    </div>
                                    {user.status && <p className="italic text-gray-400">"{user.status}"</p>}
                                    {user.bio && <p>{user.bio}</p>}
                                    {user.favoriteGenres && user.favoriteGenres.length > 0 && (
                                        <div>
                                            <h3 className="font-bold text-gray-300">Loves:</h3>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {user.favoriteGenres.map(g => <span key={g} className="text-sm bg-black/30 px-2 py-1 border border-white/10 rounded-full">{g}</span>)}
                                            </div>
                                        </div>
                                    )}
                                    <div className="pt-6 space-y-3">
                                        {renderSocialButton()}
                                        <button onClick={onBack} className="w-full matrix-button matrix-button-secondary">{'Back'}</button>
                                    </div>
                                </div>
                             </>
                        )}
                    </div>
                </div>

                {/* Right Column: Activity */}
                <div className="lg:col-span-2 space-y-8">
                    <div>
                        <h2 className="text-4xl mb-6 matrix-text">{'// RECENT ACTIVITY'}</h2>
                        <div className="space-y-6">
                            <div className="p-6 matrix-bg matrix-border">
                                <h3 className="text-2xl border-b border-white/10 pb-3 mb-3">Recently Shared Tracks</h3>
                                {activityData.recentlyShared.length > 0 ? (
                                    <ul className="space-y-2 text-base">
                                        {activityData.recentlyShared.map(link => <li key={link.id}>{`"${link.title}" in room "${link.roomName}"`}</li>)}
                                    </ul>
                                ) : <p className="text-gray-500">No tracks shared recently.</p>}
                            </div>
                            <div className="p-6 matrix-bg matrix-border">
                                <h3 className="text-2xl border-b border-white/10 pb-3 mb-3">Recently Liked Tracks</h3>
                                 {activityData.recentlyLiked.length > 0 ? (
                                    <ul className="space-y-2 text-base">
                                        {activityData.recentlyLiked.map(link => <li key={link.id}>{`"${link.title}" shared by ${link.user.name} in room "${link.roomName}"`}</li>)}
                                    </ul>
                                ) : <p className="text-gray-500">No tracks liked recently.</p>}
                            </div>
                            <div className="p-6 matrix-bg matrix-border">
                                <h3 className="text-2xl border-b border-white/10 pb-3 mb-3">Recently Created Rooms</h3>
                                 {activityData.createdRooms.length > 0 ? (
                                    <ul className="space-y-2 text-base">
                                        {activityData.createdRooms.map(room => <li key={room.id}>{`Created room "${room.name}"`}</li>)}
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
