import React from 'react';
import { User } from '../types';

interface FriendsProps {
    currentUser: User;
    allUsers: User[];
    onAccept: (userId: string) => void;
    onReject: (userId: string) => void;
    onRemove: (userId: string) => void;
    onViewProfile: (userId: string) => void;
}

const Friends: React.FC<FriendsProps> = ({ currentUser, allUsers, onAccept, onReject, onRemove, onViewProfile }) => {
    
    const friendRequests = (currentUser.incomingFriendRequests || [])
        .map(id => allUsers.find(u => u.id === id))
        .filter((u): u is User => !!u);

    const friends = (currentUser.friendIds || [])
        .map(id => allUsers.find(u => u.id === id))
        .filter((u): u is User => !!u);
        
    const onlineFriends = friends.filter(f => f.onlineStatus === 'online');
    const offlineFriends = friends.filter(f => f.onlineStatus !== 'online');

    return (
        <div className="w-full min-h-full p-8">
            <main className="max-w-5xl mx-auto space-y-8">
                <h1 className="text-5xl matrix-text animate-pulse">{'// FRIENDS'}</h1>

                {/* Friend Requests */}
                <div>
                    <h2 className="text-3xl mb-4 matrix-text">{`>> PENDING REQUESTS (${friendRequests.length})`}</h2>
                    <div className="p-4 matrix-bg matrix-border">
                        {friendRequests.length > 0 ? (
                            <ul className="space-y-3">
                                {friendRequests.map(user => (
                                    <li key={user.id} className="flex items-center justify-between p-2 hover:bg-[#002200]">
                                        <button onClick={() => onViewProfile(user.id)} className="text-xl hover:underline">{user.name}</button>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => onAccept(user.id)} className="px-3 py-1 text-sm matrix-button">ACCEPT</button>
                                            <button onClick={() => onReject(user.id)} className="px-3 py-1 text-sm matrix-button !bg-gray-800/50 hover:!bg-gray-700">REJECT</button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-500">You have no pending friend requests.</p>
                        )}
                    </div>
                </div>
                
                {/* Online Friends */}
                <div>
                    <h2 className="text-3xl mb-4 matrix-text">{`>> ONLINE FRIENDS (${onlineFriends.length})`}</h2>
                     <div className="p-4 matrix-bg matrix-border">
                        {onlineFriends.length > 0 ? (
                            <ul className="space-y-3">
                                {onlineFriends.map(user => (
                                    <li key={user.id} className="flex items-center justify-between p-2 hover:bg-[#002200]">
                                        <button onClick={() => onViewProfile(user.id)} className="text-xl hover:underline">{user.name}</button>
                                        <button onClick={() => onRemove(user.id)} className="px-3 py-1 text-sm matrix-button !bg-red-900/50 hover:!bg-red-700">REMOVE</button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-500">None of your friends are currently online.</p>
                        )}
                    </div>
                </div>

                {/* All Friends */}
                <div>
                    <h2 className="text-3xl mb-4 matrix-text">{`>> ALL FRIENDS (${friends.length})`}</h2>
                     <div className="p-4 matrix-bg matrix-border">
                        {friends.length > 0 ? (
                            <ul className="space-y-3">
                                {offlineFriends.map(user => (
                                    <li key={user.id} className="flex items-center justify-between p-2 text-gray-500 hover:bg-[#002200] hover:text-[#00FF41]">
                                        <button onClick={() => onViewProfile(user.id)} className="text-xl hover:underline">{user.name}</button>
                                        <button onClick={() => onRemove(user.id)} className="px-3 py-1 text-sm matrix-button !bg-red-900/50 hover:!bg-red-700">REMOVE</button>
                                    </li>
                                ))}
                                {onlineFriends.map(user => (
                                    <li key={user.id} className="flex items-center justify-between p-2 hover:bg-[#002200]">
                                        <button onClick={() => onViewProfile(user.id)} className="text-xl hover:underline">{user.name}</button>
                                        <button onClick={() => onRemove(user.id)} className="px-3 py-1 text-sm matrix-button !bg-red-900/50 hover:!bg-red-700">REMOVE</button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                             <p className="text-gray-500">You haven't added any friends yet.</p>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Friends;