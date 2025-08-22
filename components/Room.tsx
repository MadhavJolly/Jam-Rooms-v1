
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Room, User, Message, MusicLink, ConfirmationState } from '../types';
import { CloseIcon, MinimizeIcon, MusicNoteIcon, SendIcon, CogIcon, StarIcon, TrashIcon, HeartIcon, HeartSolidIcon, CrownIcon, ShareIcon, GripVerticalIcon } from './icons';

interface RoomProps {
    room: Room;
    currentUser: User;
    onClose: () => void;
    onMinimize: () => void;
    onFocus: () => void;
    onUpdatePosition: (position: { x: number, y: number }) => void;
    onShutdown: () => void;
    onAdminAction: (roomId: string, action: 'kick' | 'promote' | 'demote', targetUser: User) => void;
    onRemoveLink: (roomId: string, linkId: string, user: User) => void;
    onAddMessage: (roomId: string, message: Message) => void;
    onAddLink: (roomId: string, link: MusicLink) => void;
    onLikeTrack: (roomId: string, linkId: string) => void;
    onReorderLinks: (roomId: string, sourceIndex: number, destinationIndex: number) => void;
    onConfirmRequest: (details: ConfirmationState) => void;
    onShareRequest: (room: Room) => void;
    onViewProfile: (userId: string) => void;
}

const RoomComponent: React.FC<RoomProps> = ({ 
    room, currentUser, onClose, onMinimize, onFocus, onUpdatePosition, 
    onShutdown, onAdminAction, onRemoveLink, onAddMessage, onAddLink, onLikeTrack,
    onReorderLinks, onConfirmRequest, onShareRequest, onViewProfile
}) => {
    const [input, setInput] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [copyStatus, setCopyStatus] = useState('COPY');
    const dragRef = useRef({ x: 0, y: 0 });
    const nodeRef = useRef<HTMLDivElement>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);
    
    const draggedItemIndex = useRef<number | null>(null);
    const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

    const isAdmin = room.adminIds.includes(currentUser.id);

    const formatTimestamp = (ts: number) => new Date(ts).toLocaleString([], { hour: '2-digit', minute: '2-digit', hour12: false });

    const handleCopyCode = () => {
        navigator.clipboard.writeText(room.id);
        setCopyStatus('COPIED!');
        setTimeout(() => setCopyStatus('COPY'), 2000);
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!nodeRef.current || (e.target as HTMLElement).closest('button, input, a, textarea, [draggable="true"]')) return;
        onFocus();
        setIsDragging(true);
        const { left, top } = nodeRef.current.getBoundingClientRect();
        dragRef.current = {
            x: e.clientX - left,
            y: e.clientY - top,
        };
    };

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isDragging || !nodeRef.current) return;
        let x = e.clientX - dragRef.current.x;
        let y = e.clientY - dragRef.current.y;
        
        x = Math.max(0, Math.min(x, window.innerWidth - nodeRef.current.offsetWidth));
        y = Math.max(0, Math.min(y, window.innerHeight - nodeRef.current.offsetHeight));

        onUpdatePosition({ x, y });
    }, [isDragging, onUpdatePosition]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        } else {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, handleMouseMove, handleMouseUp]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [room.messages]);

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        draggedItemIndex.current = index;
        setDraggingIndex(index);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        e.preventDefault();
        if (index !== dragOverIndex) {
            setDragOverIndex(index);
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, destinationIndex: number) => {
        e.preventDefault();
        if (draggedItemIndex.current !== null && draggedItemIndex.current !== destinationIndex) {
            onReorderLinks(room.id, draggedItemIndex.current, destinationIndex);
        }
        draggedItemIndex.current = null;
        setDraggingIndex(null);
        setDragOverIndex(null);
    };

    const handleDragEnd = () => {
        draggedItemIndex.current = null;
        setDraggingIndex(null);
        setDragOverIndex(null);
    };
    
    const handleContainerDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
       if (!e.currentTarget.contains(e.relatedTarget as Node)) {
           setDragOverIndex(null);
       }
    };

    const getPlatform = (url: string): MusicLink['platform'] => {
        if (url.includes('spotify.com')) return 'Spotify';
        if (url.includes('youtube.com') || url.includes('youtu.be')) return 'YouTube';
        if (url.includes('soundcloud.com')) return 'SoundCloud';
        if (url.includes('music.apple.com')) return 'Apple Music';
        if (url.includes('bandcamp.com')) return 'Bandcamp';
        if (url.includes('discogs.com')) return 'Discogs';
        return 'Other';
    };

    const addMusicLink = async (url: string) => {
        const allowedHosts = ['spotify.com', 'youtube.com', 'youtu.be', 'soundcloud.com', 'music.apple.com', 'bandcamp.com', 'discogs.com'];
        try {
            const parsedUrl = new URL(url);
            if (!allowedHosts.some(host => parsedUrl.hostname.endsWith(host) || parsedUrl.hostname === host)) {
                 onConfirmRequest({
                    title: 'LINK REJECTED',
                    message: `Only links from SoundCloud, YouTube, Spotify, Apple Music, Bandcamp, and Discogs are currently allowed.`,
                    onConfirm: () => {},
                    confirmText: 'OK',
                 });
                return;
            }
        } catch (e) {
            onConfirmRequest({
                title: 'INVALID URL',
                message: 'The URL you provided appears to be invalid. Please check and try again.',
                onConfirm: () => {},
                confirmText: 'OK',
             });
            return;
        }

        let title = url.split('/').pop()?.split('?')[0] || 'Untitled';
        let thumbnail: string | undefined = undefined;
        const platform = getPlatform(url);

        try {
            if (platform === 'SoundCloud') {
                const response = await fetch(`https://soundcloud.com/oembed?format=json&url=${encodeURIComponent(url)}`);
                if (response.ok) {
                    const data = await response.json();
                    title = data.title || title;
                    thumbnail = data.thumbnail_url || undefined;
                }
            } else if (platform === 'YouTube') {
                const response = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`);
                 if(response.ok) {
                    const data = await response.json();
                    title = data.title || title;
                    thumbnail = data.thumbnail_url || undefined;
                 }
            } else if (platform === 'Spotify') {
                const response = await fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(url)}`);
                if (response.ok) {
                    const data = await response.json();
                    title = data.title || title;
                    thumbnail = data.thumbnail_url || undefined;
                }
            }
        } catch (error) {
             console.warn(`Could not fetch metadata for ${platform}. This often happens due to CORS policies. A backend is required for robust fetching.`, error);
        }

        const newLink: MusicLink = {
            id: `link-${Date.now()}`, user: currentUser, url,
            platform, title, thumbnail, timestamp: Date.now(), likes: []
        };
        onAddLink(room.id, newLink);
    };

    const handleSubmit = async () => {
        if (input.trim() === '') return;
        const urlRegex = /^(https?:\/\/[^\s]+)/;
        const match = urlRegex.exec(input.trim());

        if (match) {
            await addMusicLink(match[0]);
        } else {
            const newMessage: Message = {
                id: `msg-${Date.now()}`, user: currentUser, text: input, timestamp: Date.now(),
            };
            onAddMessage(room.id, newMessage);
        }
        setInput('');
    };

    return (
        <>
            <div
                ref={nodeRef}
                className="absolute flex flex-col w-full h-[85vh] max-w-6xl matrix-bg matrix-border pointer-events-auto"
                style={{ top: room.position.y, left: room.position.x, zIndex: room.zIndex }}
                onMouseDown={onFocus}
            >
                <header className="flex items-center justify-between p-1 bg-black cursor-move" onMouseDown={handleMouseDown}>
                    <h2 className="text-lg matrix-text select-none pl-2">{`// ROOM: ${room.name} [${room.id}]`}</h2>
                    <div className="flex items-center">
                        <button onClick={() => onShareRequest(room)} className="p-1 hover:bg-[#00FF41] hover:text-black"><ShareIcon /></button>
                        {isAdmin && (
                            <button onClick={() => setShowSettings(!showSettings)} className={`p-1 hover:bg-[#00FF41] hover:text-black ${showSettings ? 'bg-[#00FF41] text-black' : ''}`}><CogIcon /></button>
                        )}
                        <button onClick={onMinimize} className="p-1 hover:bg-[#00FF41] hover:text-black"><MinimizeIcon /></button>
                        <button onClick={onClose} className="p-1 hover:bg-[#00FF41] hover:text-red-600"><CloseIcon /></button>
                    </div>
                </header>
                
                <div className="flex-grow flex flex-row gap-px bg-[#00FF41] overflow-hidden">
                    {/* Main Content Column */}
                    <div className="bg-black flex flex-col w-3/4">
                        {/* Shared Jams */}
                        <div className="flex flex-col h-1/2">
                            <div className="p-2 border-b border-[#00FF41]/50">
                                <h3 className="matrix-text text-xl">SHARED JAMS ({room.musicLinks.length})</h3>
                            </div>
                            <div 
                                className="flex-grow p-2 overflow-y-auto"
                                onDragLeave={isAdmin ? handleContainerDragLeave : undefined}
                            >
                                {room.musicLinks.length === 0 && <p className="text-gray-500 text-center py-4">No jams shared yet. Drop a link in the chat!</p>}
                                {room.musicLinks.map((link, index) => {
                                    const canDelete = link.user.id === currentUser.id;
                                    const canDrag = isAdmin;

                                    return (
                                        <div 
                                            key={link.id}
                                            className={`p-2 border-b border-transparent border-b-[#00FF41]/20 flex items-center gap-3 transition-all duration-150 ${
                                                canDrag ? 'hover:bg-[#002200]' : ''
                                            } ${
                                                draggingIndex === index ? 'opacity-30' : ''
                                            } ${
                                                dragOverIndex === index ? 'border-[#00FF41]' : ''
                                            }`}
                                            onDragOver={canDrag ? (e) => handleDragOver(e, index) : undefined}
                                            onDrop={canDrag ? (e) => handleDrop(e, index) : undefined}
                                        >
                                            <div
                                                className={`p-1 ${canDrag ? 'cursor-move text-gray-400 hover:text-white' : 'cursor-not-allowed text-gray-800'}`}
                                                draggable={canDrag}
                                                onDragStart={canDrag ? (e) => handleDragStart(e, index) : undefined}
                                                onDragEnd={canDrag ? handleDragEnd : undefined}
                                                title={canDrag ? "Drag to reorder" : "Admin only: Drag to reorder"}
                                            >
                                                <GripVerticalIcon />
                                            </div>
                                            <div className="w-16 h-10 flex-shrink-0 bg-black flex items-center justify-center">
                                                {link.thumbnail ? <img src={link.thumbnail} alt={link.title} className="w-full h-full object-cover" /> : <MusicNoteIcon />}
                                            </div>
                                            <div className="flex-grow overflow-hidden min-w-0">
                                                <a href={link.url} target="_blank" rel="noopener noreferrer" className="font-bold truncate hover:underline block">{link.title}</a>
                                                <p className="text-xs text-gray-400">by {link.user.name} on {link.platform}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <button onClick={() => onLikeTrack(room.id, link.id)} className="flex items-center gap-1 text-xs p-1 hover:text-white">
                                                    {link.likes.includes(currentUser.id) ? <HeartSolidIcon /> : <HeartIcon />}
                                                    <span>{link.likes.length}</span>
                                                </button>
                                                <button 
                                                    onClick={canDelete ? () => onConfirmRequest({
                                                        title: 'DELETE LINK',
                                                        message: <p>Are you sure you want to permanently delete the link for <span className="font-bold">"{link.title}"</span>?</p>,
                                                        onConfirm: () => onRemoveLink(room.id, link.id, currentUser),
                                                        confirmText: 'DELETE',
                                                        confirmClass: 'bg-red-800 hover:bg-red-600'
                                                    }) : undefined}
                                                    disabled={!canDelete}
                                                    className={`p-1 transition-colors ${canDelete ? 'text-gray-500 hover:text-red-500' : 'text-gray-800 cursor-not-allowed'}`}
                                                    title={canDelete ? "Delete link" : "Only the user who shared this can delete it"}
                                                >
                                                    <TrashIcon />
                                                </button>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                        {/* Chat */}
                        <div className="flex flex-col flex-grow border-t border-[#00FF41]">
                            <div className="p-2 border-b border-[#00FF41]/50">
                                <h3 className="matrix-text text-xl">CHAT</h3>
                            </div>
                            <div className="flex-grow p-2 overflow-y-auto">
                                {room.messages.map(msg => (
                                    msg.user.id === 'system' ? (
                                        <div key={msg.id} className="my-2 text-sm text-center text-yellow-400/90 italic">
                                            <span className="px-2 py-1 bg-yellow-400/10 rounded-md">
                                                {msg.text}
                                            </span>
                                        </div>
                                    ) : (
                                        <div key={msg.id} className="mb-2 text-base leading-tight break-words">
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-gray-500 text-xs flex-shrink-0">{formatTimestamp(msg.timestamp)}</span>
                                                <button onClick={() => onViewProfile(msg.user.id)} className="font-bold hover:underline flex-shrink-0" style={{ color: msg.user.color || '#00FF41' }}>{msg.user.name}</button>
                                                <span className="text-gray-400">:~$</span>
                                                <p className="inline">{msg.text}</p>
                                            </div>
                                        </div>
                                    )
                                ))}
                                <div ref={chatEndRef} />
                            </div>
                            <div className="p-1 bg-black border-t border-[#00FF41]/50 mt-auto">
                                <form className="flex items-stretch gap-2" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                                    <input
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder="Send a message or drop a link..."
                                        className="w-full p-2 matrix-input bg-transparent border-transparent focus:border-transparent focus:ring-0"
                                    />
                                    <button type="submit" className="p-2 matrix-button flex items-center justify-center">
                                        <SendIcon />
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>

                    {/* Side Panel: Users / Admin */}
                    <div className="bg-black flex flex-col w-1/4 overflow-hidden">
                        {showSettings && isAdmin ? (
                            <div className="p-2 flex flex-col h-full">
                                <div className="border-b border-[#00FF41]/50 pb-2 mb-2">
                                    <h3 className="matrix-text text-xl">ADMIN CONTROLS</h3>
                                </div>
                                <div className="flex-grow overflow-y-auto pr-1">
                                    <h4 className="text-lg matrix-text mt-2">USER MANAGEMENT</h4>
                                    <ul className="space-y-2 mt-2">
                                        {room.users.map(user => {
                                            const isTargetAdmin = room.adminIds.includes(user.id);
                                            const isCreator = room.creatorId === user.id;
                                            return (
                                                <li key={user.id} className="flex items-center justify-between p-1 hover:bg-[#002200]">
                                                    <button onClick={() => onViewProfile(user.id)} className="hover:underline truncate">{user.name}</button>
                                                    <div className="flex items-center gap-1 flex-shrink-0">
                                                        {!isCreator && user.id !== currentUser.id && (
                                                            <>
                                                                {isTargetAdmin ? (
                                                                    <button onClick={() => onAdminAction(room.id, 'demote', user)} className="text-xs matrix-button px-2 py-0.5">DEMOTE</button>
                                                                ) : (
                                                                    <button onClick={() => onAdminAction(room.id, 'promote', user)} className="text-xs matrix-button px-2 py-0.5">PROMOTE</button>
                                                                )}
                                                                <button
                                                                    onClick={() => onConfirmRequest({
                                                                        title: 'KICK USER',
                                                                        message: <p>Are you sure you want to kick <span className="font-bold">{user.name}</span> from the room?</p>,
                                                                        onConfirm: () => onAdminAction(room.id, 'kick', user),
                                                                        confirmText: 'KICK',
                                                                        confirmClass: 'bg-red-800 hover:bg-red-600'
                                                                    })}
                                                                    className="text-xs matrix-button px-2 py-0.5 !bg-red-900/50 hover:!bg-red-700"
                                                                >
                                                                    KICK
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                                {room.isPrivate && (
                                    <div className="pt-2">
                                        <h4 className="text-lg matrix-text mt-4">ROOM CODE</h4>
                                        <div className="flex gap-2 mt-1">
                                            <input type="text" readOnly value={room.id} className="p-1 matrix-input flex-grow" />
                                            <button onClick={handleCopyCode} className="px-2 py-1 matrix-button">{copyStatus}</button>
                                        </div>
                                    </div>
                                )}
                                {currentUser.id === room.creatorId && (
                                    <div className="mt-auto pt-4">
                                        <button
                                            onClick={() => onConfirmRequest({
                                                title: 'SHUTDOWN ROOM',
                                                message: <p>Are you sure? This will permanently close the room for everyone.</p>,
                                                onConfirm: onShutdown,
                                                confirmText: 'SHUTDOWN',
                                                confirmClass: 'bg-red-800 hover:bg-red-600'
                                            })}
                                            className="w-full p-2 matrix-button text-lg !bg-red-900/50 hover:!bg-red-700"
                                        >
                                            SHUTDOWN ROOM
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col h-full">
                                <div className="p-2 border-b border-[#00FF41]/50">
                                    <h3 className="matrix-text text-xl">USERS ({room.users.length})</h3>
                                </div>
                                <div className="flex-grow p-2 overflow-y-auto">
                                    <ul className="space-y-1">
                                        {room.users.map(user => (
                                            <li key={user.id} className="flex flex-col items-start p-1 rounded hover:bg-[#001100]">
                                                <div className="flex items-center gap-2 w-full">
                                                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: user.color }}></span>
                                                    <button onClick={() => onViewProfile(user.id)} className="font-bold truncate hover:underline">{user.name}</button>
                                                    <div className="ml-auto flex items-center gap-1 flex-shrink-0">
                                                        {room.creatorId === user.id && <span title="Room Creator"><CrownIcon /></span>}
                                                        {room.adminIds.includes(user.id) && room.creatorId !== user.id && (
                                                            <span title="Room Admin"><StarIcon /></span>
                                                        )}
                                                    </div>
                                                </div>
                                                {user.status && <p className="text-xs text-gray-400 pl-4 italic truncate w-full">"{user.status}"</p>}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default RoomComponent;
