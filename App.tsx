
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Room, User, Message, MusicLink, ConfirmationState, Notification } from './types';
import Home from './components/Lobby';
import RoomComponent from './components/Room';
import MinimizedRoomTab from './components/MinimizedRoomTab';
import Auth from './components/Auth';
import Navbar from './components/Navbar';
import Profile from './components/Profile';
import LikedRooms from './components/LikedRooms';
import Friends from './components/Friends';
import ConfirmationModal from './components/ConfirmationModal';
import NotificationContainer from './components/NotificationContainer';
import NotificationPanel from './components/NotificationPanel';
import ShareRoomModal from './components/ShareRoomModal';


const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
};

const mockUsers: User[] = [
    { id: 'mock-1', name: 'Synthwave_Kid', color: '#00FFFF', onlineStatus: 'online', status: 'Cruising the neon grid', bio: 'Just a guy looking for the next best synth track.', favoriteGenres: ['synthwave', 'retrowave'], friendIds: [], incomingFriendRequests: [] },
    { id: 'mock-2', name: 'Glitch_Master', color: '#FF00FF', onlineStatus: 'online', status: 'Deconstructing beats', bio: 'If it doesn\'t glitch, it isn\'t music.', favoriteGenres: ['glitch', 'idm', 'experimental'], friendIds: [], incomingFriendRequests: [] },
    { id: 'mock-3', name: 'Beat_Prophet', color: '#FFFF00', onlineStatus: 'offline', status: 'In the zone', bio: 'Producer and DJ. All about that lofi life.', favoriteGenres: ['lofi hip-hop', 'chillhop'], friendIds: [], incomingFriendRequests: [] },
    { id: 'mock-4', name: 'Rhythm_Rider', color: '#39FF14', onlineStatus: 'online', bio: 'Riding the sound waves.', favoriteGenres: ['drum & bass', 'jungle'], friendIds: [], incomingFriendRequests: [] },
    { id: 'mock-5', name: 'Echo_Drifter', color: '#FF5F1F', onlineStatus: 'online', bio: 'Ambient soundscapes and dreamy vocals are my jam.', favoriteGenres: ['ambient', 'dreampop', 'shoegaze'], friendIds: [], incomingFriendRequests: [] },
];

const mockMusicLinks: MusicLink[] = [
     { id: 'link-1', user: mockUsers[0], url: 'https://soundcloud.com/kavinsky/kavinsky-nightcall', platform: 'SoundCloud', title: 'Kavinsky - Nightcall', timestamp: Date.now() - 200000, likes: [mockUsers[1].id, mockUsers[4].id] },
     { id: 'link-2', user: mockUsers[1], url: 'https://www.youtube.com/watch?v=5qap5aO4i9A', platform: 'YouTube', title: 'Aphex Twin - T69 Collapse', timestamp: Date.now() - 150000, likes: [] },
     { id: 'link-3', user: mockUsers[2], url: 'https://www.youtube.com/watch?v=jfKfPfyJRdk', platform: 'YouTube', title: 'Nujabes - Aruarian Dance', timestamp: Date.now() - 100000, likes: [mockUsers[0].id, mockUsers[3].id, mockUsers[4].id] },
];

const App: React.FC = () => {
    const [allUsers, setAllUsers] = useState<User[]>(() => {
        try {
            const savedUsers = localStorage.getItem('jam_rooms_users');
            const parsedUsers = savedUsers ? JSON.parse(savedUsers) : [];
            // Merge with mock users, giving precedence to saved data
            const userMap = new Map<string, User>();
            for (const user of mockUsers) {
                userMap.set(user.id, user);
            }
            for (const user of parsedUsers) {
                userMap.set(user.id, user); // Overwrites mock if ID matches
            }
            return Array.from(userMap.values());
        } catch (error) {
            console.error('Failed to parse users from localStorage', error);
            return mockUsers; // Fallback to mocks
        }
    });
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [publicRooms, setPublicRooms] = useState<Room[]>([]);
    const [likedRoomIds, setLikedRoomIds] = useState<Set<string>>(new Set());
    const [nextZIndex, setNextZIndex] = useState(10);
    const [currentPage, setCurrentPage] = useState<'home' | 'liked' | 'profile' | 'friends'>('home');
    const [viewingProfileId, setViewingProfileId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isNotificationPanelOpen, setNotificationPanelOpen] = useState(false);
    const [confirmation, setConfirmation] = useState<ConfirmationState | null>(null);
    const [sharingRoom, setSharingRoom] = useState<Room | null>(null);
    const mainContentRef = useRef<HTMLElement>(null);
    
    useEffect(() => {
        try {
            localStorage.setItem('jam_rooms_users', JSON.stringify(allUsers));
        } catch (error) {
            console.error('Failed to save users to localStorage', error);
        }
    }, [allUsers]);

    // This effect synchronizes the open room windows (rooms) with the master list (publicRooms)
    // It ensures that any data change in the master list is reflected in the open window.
    useEffect(() => {
        setRooms(currentOpenRooms => {
            const stillExisting = currentOpenRooms.filter(r => publicRooms.some(pr => pr.id === r.id));
            
            return stillExisting.map(openRoom => {
                const latestPublicRoomData = publicRooms.find(pr => pr.id === openRoom.id)!;
                // Preserve window-specific state (position, zIndex, etc.) while updating shared data
                return {
                    ...latestPublicRoomData,
                    position: openRoom.position,
                    zIndex: openRoom.zIndex,
                    status: openRoom.status,
                    size: openRoom.size,
                };
            });
        });
    }, [publicRooms]);

    useEffect(() => {
        // Mock public rooms data
        setPublicRooms([
            {
                id: 'CYBERPUNK', name: 'Cyberpunk Beats', description: 'Synthwave, Darksynth, and Cyberpunk ambient. Drop your futuristic tracks.', tags: ['synthwave', 'darksynth', 'cyberpunk'], isPrivate: false, creatorId: 'system-user', adminIds: ['system-user'], status: 'open',
                position: { x: 0, y: 0 }, size: { width: 800, height: 600 }, messages: [], musicLinks: [mockMusicLinks[0], mockMusicLinks[1]], users: [mockUsers[0], mockUsers[1], mockUsers[4]], zIndex: 0,
                userCount: 42, songCount: 138,
            },
            {
                id: 'LOFIHIVE', name: 'Lofi Hive', description: 'Chill beats to relax/study to. Keep it mellow.', tags: ['lofi', 'chillhop', 'instrumental'], isPrivate: false, creatorId: 'system-user-2', adminIds: ['system-user-2'], status: 'open',
                position: { x: 0, y: 0 }, size: { width: 800, height: 600 }, messages: [], musicLinks: [mockMusicLinks[2]], users: [mockUsers[2], mockUsers[3]], zIndex: 0,
                userCount: 127, songCount: 301,
            },
            {
                id: 'SYNTHRIDERS', name: 'Synth Riders', description: 'High-energy synthwave and retrowave for driving at night.', tags: ['retrowave', '80s', 'synthpop'], isPrivate: false, creatorId: 'system-user-3', adminIds: ['system-user-3'], status: 'open',
                position: { x: 0, y: 0 }, size: { width: 800, height: 600 }, messages: [], musicLinks: [], users: [mockUsers[0], mockUsers[3]], zIndex: 0, userCount: 88, songCount: 210,
            },
            {
                id: 'AMBIENTZONE', name: 'Ambient Zone', description: 'Deep, atmospheric, and immersive soundscapes.', tags: ['ambient', 'drone', 'soundscape'], isPrivate: true, creatorId: 'system-user-4', adminIds: ['system-user-4'], status: 'open',
                position: { x: 0, y: 0 }, size: { width: 800, height: 600 }, messages: [], musicLinks: [], users: [mockUsers[4]], zIndex: 0, userCount: 33, songCount: 95,
            },
            {
                id: 'METALFORGE', name: 'Metal Forge', description: 'For all things heavy. From classic rock to modern metal.', tags: ['metal', 'rock', 'heavy'], isPrivate: false, creatorId: 'system-user-5', adminIds: ['system-user-5'], status: 'open',
                position: { x: 0, y: 0 }, size: { width: 800, height: 600 }, messages: [], musicLinks: [], users: [], zIndex: 0, userCount: 66, songCount: 404,
            }
        ]);
    }, []);

    const addNotification = useCallback((message: string, type: Notification['type'] = 'info') => {
        const newNotification: Notification = {
            id: `notif-${Date.now()}-${Math.random()}`,
            message,
            type,
            timestamp: Date.now(),
            read: false,
        };
        setNotifications(prev => [newNotification, ...prev].slice(0, 50)); // Keep history to 50
    }, []);

    const joinRoom = useCallback((roomId: string) => {
        if (!currentUser) return;
        const code = roomId.toUpperCase();

        const existingRoom = rooms.find(r => r.id === code);
        if (existingRoom) {
            if (existingRoom.status === 'minimized') {
                 updateRoomState(code, 'status', 'open');
            }
            bringToFront(code);
            return;
        }

        const roomToJoin = publicRooms.find(r => r.id === code);

        if (roomToJoin) {
            const usersWithCurrentUser = roomToJoin.users.some(u => u.id === currentUser.id)
                ? roomToJoin.users
                : [...roomToJoin.users, currentUser];
            
            setPublicRooms(prev => prev.map(r => r.id === code ? { ...r, users: usersWithCurrentUser } : r));
            
            const newRoomInstance = {
                ...roomToJoin,
                position: positionNewRoom(),
                status: 'open' as const,
                users: usersWithCurrentUser,
                zIndex: nextZIndex,
            };

            setRooms(prev => [...prev, newRoomInstance]);
            setNextZIndex(prev => prev + 1);
        } else {
            addNotification('Invalid room code. The room may have been shut down or the code is incorrect.', 'error');
        }
    }, [rooms, publicRooms, nextZIndex, currentUser, addNotification]);

    // Effect to handle joining a room from a URL hash link
    useEffect(() => {
        if (!currentUser) return; // Only run if user is logged in

        const hash = window.location.hash;
        if (hash.startsWith('#join=')) {
            const roomCode = hash.substring(6);
            if (roomCode) {
                joinRoom(roomCode);
                // Clear the hash to prevent re-joining on re-renders
                window.history.replaceState(null, '', window.location.pathname + window.location.search);
            }
        }
    }, [currentUser, joinRoom]);

    const handleLogin = (name: string, password: string): string | null => {
        const user = allUsers.find(u => u.name.toLowerCase() === name.trim().toLowerCase());
        if (!user) {
            return "User not found.";
        }
        if (user.password !== password) {
            return "Invalid password.";
        }
        const { password: _, ...userWithoutPassword } = user;
        setCurrentUser(userWithoutPassword);
        return null; // Success
    };

    const handleSignup = (name: string, password: string): string | null => {
        const trimmedName = name.trim();
        if (allUsers.some(u => u.name.toLowerCase() === trimmedName.toLowerCase())) {
            return "Handle is already taken.";
        }
        const newUser: User = {
            id: `user-${Date.now()}`,
            name: trimmedName,
            color: '#00FF41',
            password: password,
            onlineStatus: 'online',
            favoriteGenres: [],
            bio: '',
            status: '',
            friendIds: [],
            incomingFriendRequests: [],
        };
        setAllUsers(prev => [...prev, newUser]);
        const { password: _, ...userWithoutPassword } = newUser;
        setCurrentUser(userWithoutPassword);
        return null; // Success
    };

    const handleLogout = () => {
        setCurrentUser(null);
        setRooms([]);
        setCurrentPage('home');
        setViewingProfileId(null);
    };

    const handleUpdateProfile = (details: Partial<User>) => {
        if (!currentUser) return;
        
        if (details.name && details.name.toLowerCase() !== currentUser.name.toLowerCase() && allUsers.some(u => u.name.toLowerCase() === details.name!.toLowerCase())) {
            addNotification('Username is already taken!', 'error');
            return;
        }

        const updatedUser = { ...currentUser, ...details };
        setCurrentUser(updatedUser);
        
        setAllUsers(prevUsers => prevUsers.map(u => u.id === currentUser.id ? { ...u, ...details } : u));
        
        const updateUserInRoom = (u: User) => u.id === currentUser.id ? updatedUser : u;
        const updateUserInMessage = (msg: Message) => msg.user.id === currentUser.id ? { ...msg, user: updatedUser } : msg;
        const updateUserInLink = (link: MusicLink) => link.user.id === currentUser.id ? { ...link, user: updatedUser } : link;

        const roomUpdater = (room: Room) => ({
            ...room,
            users: room.users.map(updateUserInRoom),
            messages: room.messages.map(updateUserInMessage),
            musicLinks: room.musicLinks.map(updateUserInLink),
        });

        setPublicRooms(prev => prev.map(roomUpdater));

        addNotification('Profile updated!', 'success');
        setViewingProfileId(null);
        setCurrentPage('home');
    };

    // --- Social Features ---
    const handleSendFriendRequest = (targetUserId: string) => {
        if (!currentUser) return;
        setAllUsers(prev => prev.map(u => {
            if (u.id === targetUserId) {
                const newRequests = [...(u.incomingFriendRequests || []), currentUser.id];
                return { ...u, incomingFriendRequests: Array.from(new Set(newRequests)) };
            }
            return u;
        }));
        addNotification('Friend request sent!', 'success');
    };

    const handleAcceptFriendRequest = (requestingUserId: string) => {
        if (!currentUser) return;

        setAllUsers(prev => prev.map(u => {
            // Add friend to current user's list and remove request
            if (u.id === currentUser.id) {
                const newFriends = [...(u.friendIds || []), requestingUserId];
                const newRequests = (u.incomingFriendRequests || []).filter(id => id !== requestingUserId);
                const updatedUser = { ...u, friendIds: Array.from(new Set(newFriends)), incomingFriendRequests: newRequests };
                setCurrentUser(updatedUser);
                return updatedUser;
            }
            // Add current user to the other user's friend list
            if (u.id === requestingUserId) {
                const newFriends = [...(u.friendIds || []), currentUser.id];
                return { ...u, friendIds: Array.from(new Set(newFriends)) };
            }
            return u;
        }));
        addNotification('Friend request accepted!', 'success');
    };

    const handleRejectFriendRequest = (requestingUserId: string) => {
        if (!currentUser) return;
        const updatedUser = {
            ...currentUser,
            incomingFriendRequests: (currentUser.incomingFriendRequests || []).filter(id => id !== requestingUserId),
        };
        setCurrentUser(updatedUser);
        setAllUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
        addNotification('Friend request rejected.', 'info');
    };

    const handleRemoveFriend = (friendId: string) => {
        if (!currentUser) return;
        setAllUsers(prev => prev.map(u => {
            if (u.id === currentUser.id) {
                const newFriends = (u.friendIds || []).filter(id => id !== friendId);
                const updatedUser = { ...u, friendIds: newFriends };
                setCurrentUser(updatedUser);
                return updatedUser;
            }
            if (u.id === friendId) {
                const newFriends = (u.friendIds || []).filter(id => id !== currentUser.id);
                return { ...u, friendIds: newFriends };
            }
            return u;
        }));
        addNotification('Friend removed.', 'info');
    };


    const bringToFront = (roomId: string) => {
        setRooms(prevRooms => {
            const room = prevRooms.find(r => r.id === roomId);
            if (room && room.zIndex < nextZIndex - 1) {
                const newZIndex = nextZIndex;
                setNextZIndex(newZIndex + 1);
                return prevRooms.map(r => r.id === roomId ? { ...r, zIndex: newZIndex } : r);
            }
            return prevRooms;
        });
    };
    
    const positionNewRoom = () => {
        if (!mainContentRef.current) {
            return { x: 50, y: 50 }; // Fallback position
        }
        const bounds = mainContentRef.current.getBoundingClientRect();
        const roomWidth = 800;
        const roomHeight = 600;

        const newX = (bounds.width - roomWidth) / 2 + (Math.random() - 0.5) * 100;
        const newY = (bounds.height - roomHeight) / 2 + (Math.random() - 0.5) * 100;

        return {
            x: Math.max(0, Math.min(newX, bounds.width - roomWidth)),
            y: Math.max(0, Math.min(newY, bounds.height - roomHeight))
        };
    };

    const createRoom = useCallback((details: { name: string; isPrivate: boolean; description: string; tags: string[] }) => {
        if (!currentUser) return;
        const { name, isPrivate, description, tags } = details;
        const newRoomCode = generateRoomCode();
        
        const shuffledMocks = [...mockUsers].sort(() => 0.5 - Math.random());
        const mockUsersForRoom = shuffledMocks.slice(0, Math.floor(Math.random() * 3) + 2);

        const newRoom: Room = {
            id: newRoomCode,
            name,
            isPrivate,
            description,
            tags,
            creatorId: currentUser.id,
            adminIds: [currentUser.id],
            status: 'open',
            position: positionNewRoom(),
            size: { width: 800, height: 600 },
            messages: [{ id: 'msg-0', user: {id: 'system', name: 'system', color: '#FFFF00'}, text: `Room created by ${currentUser.name}. ${isPrivate ? `The invite code is: ${newRoomCode}` : ''}`, timestamp: Date.now() }],
            musicLinks: [],
            users: [currentUser, ...mockUsersForRoom],
            zIndex: nextZIndex,
        };
        setRooms(prev => [...prev, newRoom]);
        setPublicRooms(prev => [newRoom, ...prev]);
        setNextZIndex(prev => prev + 1);
    }, [nextZIndex, currentUser]);

    const toggleLikeRoom = (roomId: string) => {
        setLikedRoomIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(roomId)) {
                newSet.delete(roomId);
            } else {
                newSet.add(roomId);
            }
            return newSet;
        });
    };

    const updateRoomState = <K extends keyof Room>(roomId: string, key: K, value: Room[K]) => {
        setRooms(prev => prev.map(r => r.id === roomId ? { ...r, [key]: value } : r));
    };
    
    const handleAddMessage = (roomId: string, message: Message) => {
        setPublicRooms(prev => prev.map(room => {
             if (room.id !== roomId) return room;
             return { ...room, messages: [...room.messages, message] };
        }));
    };

    const handleAddLink = (roomId: string, link: MusicLink) => {
        setPublicRooms(prev => prev.map(room => {
            if (room.id !== roomId) return room;
            return { ...room, musicLinks: [...room.musicLinks, link] };
        }));
    };

    const handleLikeTrack = (roomId: string, linkId: string) => {
        if (!currentUser) return;
        const userId = currentUser.id;

        setPublicRooms(prev => prev.map(room => {
            if (room.id !== roomId) return room;
            
            const updatedLinks = room.musicLinks.map(link => {
                if (link.id === linkId) {
                    const newLikes = link.likes.includes(userId)
                        ? link.likes.filter(id => id !== userId)
                        : [...link.likes, userId];
                    return { ...link, likes: newLikes };
                }
                return link;
            });

            return { ...room, musicLinks: updatedLinks };
        }));
    };

    const handleReorderLinks = (roomId: string, sourceIndex: number, destinationIndex: number) => {
        setPublicRooms(prev => prev.map(room => {
            if (room.id !== roomId) {
                return room;
            }
            const links = Array.from(room.musicLinks);
            const [removed] = links.splice(sourceIndex, 1);
            links.splice(destinationIndex, 0, removed);
            return { ...room, musicLinks: links };
        }));
    };

    const handleAdminAction = (roomId: string, action: 'kick' | 'promote' | 'demote', targetUser: User) => {
        if (!currentUser) return;
        const roomNameForAlert = rooms.find(r => r.id === roomId)?.name ?? publicRooms.find(r => r.id === roomId)?.name;

        setPublicRooms(prev => prev.map((room): Room => {
            if (room.id !== roomId || !room.adminIds.includes(currentUser.id)) {
                return room;
            }

            let newUsers = room.users;
            let newAdminIds = room.adminIds;
            let systemMessageText: string | null = null;
            
            switch (action) {
                case 'kick':
                    newUsers = room.users.filter(u => u.id !== targetUser.id);
                    systemMessageText = `${targetUser.name} was kicked from the room by ${currentUser.name}.`;
                    break;
                case 'promote':
                    if (!room.adminIds.includes(targetUser.id)) {
                        newAdminIds = [...room.adminIds, targetUser.id];
                        systemMessageText = `${targetUser.name} was promoted to admin by ${currentUser.name}.`;
                    }
                    break;
                case 'demote':
                    if (room.creatorId !== targetUser.id) {
                        newAdminIds = room.adminIds.filter(id => id !== targetUser.id);
                        systemMessageText = `${targetUser.name} was demoted by ${currentUser.name}.`;
                    }
                    break;
            }

            if (!systemMessageText) {
                return room;
            }
            
            const systemMessage: Message = {
                id: `msg-${Date.now()}`,
                user: { id: 'system', name: 'system', color: '#FFFF00' },
                text: systemMessageText,
                timestamp: Date.now(),
            };

            if (action === 'kick' && targetUser.id === currentUser.id) {
                setTimeout(() => {
                    closeRoom(roomId);
                    addNotification(`You have been kicked from "${roomNameForAlert || 'the room'}".`, 'error');
                }, 100);
            }

            return {
                ...room,
                users: newUsers,
                adminIds: newAdminIds,
                messages: [...room.messages, systemMessage],
            };
        }));
    };

    const handleRemoveLink = (roomId: string, linkId: string, user: User) => {
        setPublicRooms(prev => prev.map(room => {
            if (room.id !== roomId) {
                return room;
            }

            const updatedLinks = room.musicLinks.filter(link => link.id !== linkId);
            const systemMessage: Message = {
                id: `msg-${Date.now()}`,
                user: { id: 'system', name: 'system', color: '#FFFF00' },
                text: `${user.name} removed a shared link.`,
                timestamp: Date.now(),
            };

            return {
                ...room,
                musicLinks: updatedLinks,
                messages: [...room.messages, systemMessage],
            };
        }));
    };

    const closeRoom = (roomId: string) => {
        setRooms(prev => prev.filter(r => r.id !== roomId));
    };

    const shutdownRoom = (roomId: string) => {
        const roomToShutdown = publicRooms.find(r => r.id === roomId);
        if (roomToShutdown && roomToShutdown.creatorId === currentUser?.id) {
            setPublicRooms(prev => prev.filter(r => r.id !== roomId));
            // The useEffect hook will automatically remove it from `rooms`.
            addNotification(`Room "${roomToShutdown.name}" has been shut down.`, 'success');
        }
    };

    const handleShareRequest = (room: Room) => {
        setSharingRoom(room);
    };
    
    const handleViewProfile = (userId: string) => {
        setViewingProfileId(userId);
        setCurrentPage('profile');
    };

    const handleToggleNotificationPanel = () => {
        setNotificationPanelOpen(prev => {
            const isOpen = !prev;
            if (isOpen) {
                // Mark all as read when opening
                setNotifications(n => n.map(notif => ({...notif, read: true})));
            }
            return isOpen;
        });
    };

    const handleClearNotifications = () => {
        setNotifications([]);
    };

    const openRooms = rooms.filter(r => r.status === 'open');
    const minimizedRooms = rooms.filter(r => r.status === 'minimized');
    const likedRooms = publicRooms.filter(r => likedRoomIds.has(r.id));

    const filteredPublicRooms = publicRooms.filter(room => {
        const query = searchQuery.toLowerCase();
        return (
            room.name.toLowerCase().includes(query) ||
            room.description.toLowerCase().includes(query) ||
            room.tags.some(tag => tag.toLowerCase().includes(query))
        );
    });

    if (!currentUser) {
        return <Auth onLogin={handleLogin} onSignup={handleSignup} />;
    }
    
    const viewingUser = viewingProfileId ? allUsers.find(u => u.id === viewingProfileId) : currentUser;

    const renderPage = () => {
        switch (currentPage) {
            case 'home':
                return <Home publicRooms={filteredPublicRooms} createRoom={createRoom} joinRoom={joinRoom} likedRoomIds={likedRoomIds} onLikeToggle={toggleLikeRoom} searchQuery={searchQuery} />;
            case 'liked':
                return <LikedRooms likedRooms={likedRooms} joinRoom={joinRoom} onLikeToggle={toggleLikeRoom} />;
            case 'friends':
                return <Friends currentUser={currentUser} allUsers={allUsers} onAccept={handleAcceptFriendRequest} onReject={handleRejectFriendRequest} onRemove={handleRemoveFriend} onViewProfile={handleViewProfile} />;
            case 'profile':
                if (!viewingUser) {
                    addNotification('Could not find user profile.', 'error');
                    setCurrentPage('home');
                    setViewingProfileId(null);
                    return null;
                }
                return <Profile 
                    user={viewingUser}
                    currentUser={currentUser}
                    publicRooms={publicRooms} 
                    onUpdateProfile={handleUpdateProfile} 
                    onBack={() => { setCurrentPage('home'); setViewingProfileId(null); }} 
                    onSendFriendRequest={handleSendFriendRequest}
                    onRemoveFriend={handleRemoveFriend}
                />;
            default:
                return null;
        }
    };

    return (
        <div className="w-full h-full flex flex-col">
            <Navbar 
                user={currentUser} 
                onLogout={handleLogout} 
                currentPage={currentPage} 
                setCurrentPage={setCurrentPage}
                setViewingProfileId={setViewingProfileId}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                notifications={notifications}
                onToggleNotificationPanel={handleToggleNotificationPanel}
            />
            
            <NotificationContainer notifications={notifications} />
            
            {isNotificationPanelOpen && (
                <NotificationPanel 
                    notifications={notifications} 
                    onClose={() => setNotificationPanelOpen(false)} 
                    onClearAll={handleClearNotifications}
                />
            )}

            <main ref={mainContentRef} className="relative flex-1">
                <div className="absolute inset-0 overflow-y-auto">
                    {renderPage()}
                </div>

                <div className="absolute inset-0 pointer-events-none">
                    {openRooms.map(room => (
                        <RoomComponent
                            key={room.id}
                            room={room}
                            currentUser={currentUser}
                            onClose={() => closeRoom(room.id)}
                            onMinimize={() => updateRoomState(room.id, 'status', 'minimized')}
                            onFocus={() => bringToFront(room.id)}
                            onUpdatePosition={(pos) => updateRoomState(room.id, 'position', pos)}
                            onShutdown={() => shutdownRoom(room.id)}
                            onAdminAction={handleAdminAction}
                            onRemoveLink={handleRemoveLink}
                            onAddMessage={handleAddMessage}
                            onAddLink={handleAddLink}
                            onLikeTrack={handleLikeTrack}
                            onReorderLinks={handleReorderLinks}
                            onConfirmRequest={setConfirmation}
                            onShareRequest={handleShareRequest}
                            onViewProfile={handleViewProfile}
                        />
                    ))}

                    <div className="absolute bottom-0 left-0 right-0 flex items-center justify-start p-2 gap-2 pointer-events-auto">
                        {minimizedRooms.map(room => (
                            <MinimizedRoomTab
                                key={room.id}
                                room={room}
                                onRestore={() => {
                                    updateRoomState(room.id, 'status', 'open');
                                    bringToFront(room.id);
                                }}
                            />
                        ))}
                    </div>
                </div>
            </main>
            <footer className="w-full p-1 text-xs text-center text-gray-500 bg-[var(--color-background)] border-t border-[var(--color-border)]">
                <span>Version 1.2</span>
                <span className="mx-2">|</span>
                <span>By using Jam Rooms, you accept our Terms and Conditions.</span>
            </footer>
            {sharingRoom && (
                <ShareRoomModal
                    room={sharingRoom}
                    onClose={() => setSharingRoom(null)}
                />
            )}
            {confirmation && (
                <ConfirmationModal
                    {...confirmation}
                    onClose={() => setConfirmation(null)}
                    onConfirm={() => {
                        confirmation.onConfirm();
                        setConfirmation(null);
                    }}
                />
            )}
        </div>
    );
};

export default App;
