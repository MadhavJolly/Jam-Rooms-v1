import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Room, User } from './types';
import Home from './components/Lobby';
import RoomComponent from './components/Room';
import MinimizedRoomTab from './components/MinimizedRoomTab';
import Auth from './components/Auth';
import Navbar from './components/Navbar';
import Profile from './components/Profile';
import LikedRooms from './components/LikedRooms';

const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
};

const App: React.FC = () => {
    const [allUsers, setAllUsers] = useState<User[]>(() => {
        try {
            const savedUsers = localStorage.getItem('jam_rooms_users');
            return savedUsers ? JSON.parse(savedUsers) : [];
        } catch (error) {
            console.error('Failed to parse users from localStorage', error);
            return [];
        }
    });
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [publicRooms, setPublicRooms] = useState<Room[]>([]);
    const [likedRoomIds, setLikedRoomIds] = useState<Set<string>>(new Set());
    const [nextZIndex, setNextZIndex] = useState(10);
    const [currentPage, setCurrentPage] = useState<'home' | 'liked' | 'profile'>('home');
    const [searchQuery, setSearchQuery] = useState('');
    const mainContentRef = useRef<HTMLElement>(null);
    
    useEffect(() => {
        try {
            localStorage.setItem('jam_rooms_users', JSON.stringify(allUsers));
        } catch (error) {
            console.error('Failed to save users to localStorage', error);
        }
    }, [allUsers]);

    useEffect(() => {
        // Mock public rooms data
        setPublicRooms([
            {
                id: 'CYBERPUNK', name: 'Cyberpunk Beats', description: 'Synthwave, Darksynth, and Cyberpunk ambient. Drop your futuristic tracks.', tags: ['synthwave', 'darksynth', 'cyberpunk'], isPrivate: false, creatorId: 'system-user', status: 'open',
                position: { x: 0, y: 0 }, size: { width: 800, height: 600 }, messages: [], musicLinks: [], users: [], zIndex: 0,
                userCount: 42, songCount: 138,
            },
            {
                id: 'LOFIHIVE', name: 'Lofi Hive', description: 'Chill beats to relax/study to. Keep it mellow.', tags: ['lofi', 'chillhop', 'instrumental'], isPrivate: false, creatorId: 'system-user', status: 'open',
                position: { x: 0, y: 0 }, size: { width: 800, height: 600 }, messages: [], musicLinks: [], users: [], zIndex: 0,
                userCount: 127, songCount: 301,
            },
        ]);
    }, []);

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
    };

    const handleUpdateProfile = (name: string, color: string) => {
        if (currentUser) {
             if (name.toLowerCase() !== currentUser.name.toLowerCase() && allUsers.some(u => u.name.toLowerCase() === name.toLowerCase())) {
                alert('Username is already taken!');
                return;
            }

            const updatedUser = { ...currentUser, name, color };
            setCurrentUser(updatedUser);
            
            // Update the master user list, keeping the password
            setAllUsers(prevUsers => prevUsers.map(u => {
                if (u.id === currentUser.id) {
                    return { ...u, name, color };
                }
                return u;
            }));

            // Propagate visual changes to open rooms
            setRooms(prevRooms => prevRooms.map(room => ({
                ...room,
                users: room.users.map(u => u.id === currentUser.id ? updatedUser : u),
                messages: room.messages.map(msg => msg.user.id === currentUser.id ? { ...msg, user: updatedUser } : msg),
                musicLinks: room.musicLinks.map(link => link.user.id === currentUser.id ? { ...link, user: updatedUser } : link),
            })));

            alert('Profile updated!');
            setCurrentPage('home');
        }
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
        
        const newRoom: Room = {
            id: newRoomCode,
            name,
            isPrivate,
            description,
            tags,
            creatorId: currentUser.id,
            status: 'open',
            position: positionNewRoom(),
            size: { width: 800, height: 600 },
            messages: [{ id: 'msg-0', user: {id: 'system', name: 'system', color: '#FFFF00'}, text: `Room created by ${currentUser.name}. ${isPrivate ? `Share this code: ${newRoomCode}` : ''}`, timestamp: Date.now() }],
            musicLinks: [],
            users: [currentUser],
            zIndex: nextZIndex,
        };
        setRooms(prev => [...prev, newRoom]);
        if (!isPrivate) {
            setPublicRooms(prev => [newRoom, ...prev]);
        }
        setNextZIndex(prev => prev + 1);
    }, [nextZIndex, currentUser]);

    const joinRoom = useCallback((roomId: string) => {
        if (!currentUser) return;
        if (rooms.some(r => r.id === roomId)) {
            bringToFront(roomId);
            return;
        }
        const roomToJoin = publicRooms.find(r => r.id === roomId) || rooms.find(r => r.id === roomId);
        if (roomToJoin) {
            if (roomToJoin.isPrivate && !rooms.some(r => r.id === roomId)) {
                 alert("Joining private rooms via code is a simulated feature. This room code is invalid or the room doesn't exist.");
                 return;
            }
            const newRoomInstance = {
                ...roomToJoin,
                position: positionNewRoom(),
                status: 'open' as const,
                users: [currentUser, ...roomToJoin.users.filter(u => u.id !== currentUser.id)],
                zIndex: nextZIndex,
            };
            setRooms(prev => [...prev, newRoomInstance]);
            setNextZIndex(prev => prev + 1);
        } else {
            alert("Joining private rooms via code is a simulated feature. This room code is invalid or the room doesn't exist.");
        }
    }, [rooms, publicRooms, nextZIndex, currentUser]);

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

    const closeRoom = (roomId: string) => {
        setRooms(prev => prev.filter(r => r.id !== roomId));
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

    const renderPage = () => {
        switch (currentPage) {
            case 'home':
                return <Home publicRooms={filteredPublicRooms} createRoom={createRoom} joinRoom={joinRoom} likedRoomIds={likedRoomIds} onLikeToggle={toggleLikeRoom} searchQuery={searchQuery} />;
            case 'liked':
                return <LikedRooms likedRooms={likedRooms} joinRoom={joinRoom} onLikeToggle={toggleLikeRoom} />;
            case 'profile':
                return <Profile user={currentUser} onUpdateProfile={handleUpdateProfile} onBack={() => setCurrentPage('home')} />;
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
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
            />
            <main ref={mainContentRef} className="relative flex-1">
                {/* Layer 1: Page Content (Scrollable) */}
                <div className="absolute inset-0 overflow-y-auto">
                    {renderPage()}
                </div>

                {/* Layer 2: Windowing System (Overlays) */}
                <div className="absolute inset-0 pointer-events-none">
                    {openRooms.map(room => (
                        <RoomComponent
                            key={room.id}
                            room={room}
                            currentUser={currentUser}
                            onClose={() => closeRoom(room.id)}
                            onMinimize={() => updateRoomState(room.id, 'status', 'minimized')}
                            onFocus={() => bringToFront(room.id)}
                            onUpdate={updateRoomState}
                        />
                    ))}

                    {/* Minimized Room Tabs are also part of the windowing layer */}
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
            <footer className="w-full p-1 text-xs text-center text-gray-500 bg-black border-t border-[#00FF41]/20">
                <span>Version 1.0</span>
                <span className="mx-2">|</span>
                <span>By using Jam Rooms, you accept our Terms and Conditions.</span>
            </footer>
        </div>
    );
};

export default App;