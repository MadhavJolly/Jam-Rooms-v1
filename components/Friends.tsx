
import React from 'react';
import { User } from '../types';

interface FriendsProps {
    currentUser: User;
    allUsers: User[];
    onAccept: (userId: string) => void;
    onReject: (userId:string) => void;
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
        <div className="w-full min-h-full p-8 md:p-12">
            <main className="max-w-5xl mx-auto space-y-12">
                <h1 className="text-6xl matrix-text">{'// FRIENDS'}</h1>

                {/* Friend Requests */}
                <div>
                    <h2 className="text-4xl mb-6 matrix-text">{`// PENDING REQUESTS (${friendRequests.length})`}</h2>
                    <div className="p-6 matrix-bg matrix-border">
                        {friendRequests.length > 0 ? (
                            <ul className="space-y-4">
                                {friendRequests.map(user => (
                                    <li key={user.id} className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                                        <button onClick={() => onViewProfile(user.id)} className="text-2xl hover:underline">{user.name}</button>
                                        <div className="flex items-center gap-3">
                                            <button onClick={() => onAccept(user.id)} className="matrix-button matrix-button-primary text-sm px-4 py-1">ACCEPT</button>
                                            <button onClick={() => onReject(user.id)} className="matrix-button matrix-button-secondary text-sm px-4 py-1">REJECT</button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-500 text-lg">You have no pending friend requests.</p>
                        )}
                    </div>
                </div>
                
                {/* Friends List */}
                <div>
                    <h2 className="text-4xl mb-6 matrix-text">{`// ALL FRIENDS (${friends.length})`}</h2>
                     <div className="p-6 matrix-bg matrix-border">
                        {friends.length > 0 ? (
                             <ul className="space-y-4">
                                {onlineFriends.map(user => (
                                    <li key={user.id} className="flex items-center justify-between p-3 hover:bg-white/5 rounded-lg">
                                        <button onClick={() => onViewProfile(user.id)} className="text-2xl hover:underline flex items-center gap-3">
                                            <span className="w-3 h-3 rounded-full bg-green-500"></span>
                                            {user.name}
                                        </button>
                                        <button onClick={() => onRemove(user.id)} className="matrix-button matrix-button-danger text-sm px-4 py-1">REMOVE</button>
                                    </li>
                                ))}
                                {offlineFriends.map(user => (
                                    <li key={user.id} className="flex items-center justify-between p-3 text-gray-400 hover:bg-white/5 hover:text-white rounded-lg">
                                        <button onClick={() => onViewProfile(user.id)} className="text-2xl hover:underline flex items-center gap-3">
                                            <span className="w-3 h-3 rounded-full bg-gray-600"></span>
                                            {user.name}
                                        </button>
                                        <button onClick={() => onRemove(user.id)} className="matrix-button matrix-button-danger text-sm px-4 py-1">REMOVE</button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                             <p className="text-gray-500 text-lg">You haven't added any friends yet.</p>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Friends;
