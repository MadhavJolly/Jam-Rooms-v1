import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Room, User, Message, MusicLink } from '../types';
import { CloseIcon, MinimizeIcon, MusicNoteIcon, SendIcon, UserIcon, CogIcon } from './icons';

interface RoomProps {
    room: Room;
    currentUser: User;
    onClose: () => void;
    onMinimize: () => void;
    onFocus: () => void;
    onUpdate: <K extends keyof Room>(roomId: string, key: K, value: Room[K]) => void;
}

const RoomComponent: React.FC<RoomProps> = ({ room, currentUser, onClose, onMinimize, onFocus, onUpdate }) => {
    const [input, setInput] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const dragRef = useRef({ x: 0, y: 0 });
    const nodeRef = useRef<HTMLDivElement>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);

    const isCreator = room.creatorId === currentUser.id;

    const formatTimestamp = (ts: number) => new Date(ts).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!nodeRef.current || (e.target as HTMLElement).closest('button')) return;
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

        onUpdate(room.id, 'position', { x, y });
    }, [isDragging, room.id, onUpdate]);

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
                 alert(`Link rejected: Only links from SoundCloud, YouTube, Spotify, Apple Music, Bandcamp, and Discogs are allowed.`);
                return;
            }
        } catch (e) {
            alert('Invalid URL provided.');
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
                 // oEmbed for YouTube is heavily restricted by CORS. This is a best-effort approach.
                 // A backend proxy would be required for reliability.
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
            platform, title, thumbnail, timestamp: Date.now(),
        };
        onUpdate(room.id, 'musicLinks', [...room.musicLinks, newLink]);
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
            onUpdate(room.id, 'messages', [...room.messages, newMessage]);
        }
        setInput('');
    };

    return (
        <div
            ref={nodeRef}
            className="absolute flex flex-col w-[800px] h-[600px] matrix-bg matrix-border pointer-events-auto"
            style={{ top: room.position.y, left: room.position.x, zIndex: room.zIndex }}
            onMouseDown={onFocus}
        >
            <header className="flex items-center justify-between p-1 bg-black cursor-move" onMouseDown={handleMouseDown}>
                <h2 className="text-lg matrix-text select-none pl-2">{`// ROOM: ${room.name} [${room.id}]`}</h2>
                <div className="flex items-center">
                    {isCreator && (
                        <button onClick={() => setShowSettings(!showSettings)} className={`p-1 hover:bg-[#00FF41] hover:text-black ${showSettings ? 'bg-[#00FF41] text-black' : ''}`}><CogIcon /></button>
                    )}
                    <button onClick={onMinimize} className="p-1 hover:bg-[#00FF41] hover:text-black"><MinimizeIcon /></button>
                    <button onClick={onClose} className="p-1 hover:bg-[#00FF41] hover:text-red-600"><CloseIcon /></button>
                </div>
            </header>
            
            <div className="flex-grow grid grid-cols-2 gap-px bg-[#00FF41] overflow-hidden">
                {/* Chat Section */}
                <div className="bg-black flex flex-col">
                    <div className="flex-grow p-2 overflow-y-auto">
                        {room.messages.map(msg => (
                            <div key={msg.id} className="mb-2 text-base leading-tight break-words">
                                <span className="text-gray-500 text-xs">{formatTimestamp(msg.timestamp)}</span>
                                <div>
                                    <span style={{ color: msg.user.color || '#00FF41' }}>{msg.user.name}:~$ </span>
                                    <span>{msg.text}</span>
                                </div>
                            </div>
                        ))}
                        <div ref={chatEndRef} />
                    </div>
                </div>

                {/* Music & Users Section */}
                <div className="bg-black flex flex-col overflow-hidden">
                     {showSettings && isCreator ? (
                        <div className="p-2 flex flex-col gap-2">
                             <h3 className="matrix-text text-xl border-b border-[#00FF41] pb-1">ADMIN CONTROLS</h3>
                             <p className="text-sm">Rename Room:</p>
                             <input type="text" defaultValue={room.name} className="p-1 matrix-input"/>
                             <button className="matrix-button p-1 text-sm">SAVE</button>
                             <p className="text-sm mt-2">Kick User:</p>
                             <select className="p-1 matrix-input bg-black">
                                {room.users.filter(u => u.id !== currentUser.id).map(u => <option key={u.id}>{u.name}</option>)}
                             </select>
                             <button className="matrix-button p-1 text-sm text-red-500 border-red-500 hover:bg-red-500 hover:text-black">KICK</button>
                        </div>
                    ) : (
                        <>
                            <div className="p-2 border-b border-[#00FF41]">
                                <h3 className="matrix-text text-xl flex items-center gap-2"><UserIcon /> USERS ({room.users.length})</h3>
                                <div className="text-sm flex flex-wrap gap-x-4">
                                    {room.users.map(u => <span key={u.id} style={{color: u.color}}>{u.name}</span>)}
                                </div>
                            </div>
                            <div className="p-2 border-b border-[#00FF41]">
                                <h3 className="matrix-text text-xl flex items-center gap-2"><MusicNoteIcon />SHARED JAMS ({room.musicLinks.length})</h3>
                            </div>
                            <div className="flex-grow p-2 overflow-y-auto">
                                {room.musicLinks.slice().reverse().map(link => (
                                     <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="block mb-2 p-2 bg-[#021002] hover:bg-green-900/50 transition-colors duration-200">
                                        <div className="flex items-start gap-3">
                                            {link.thumbnail ? 
                                                <img src={link.thumbnail} alt={link.title} className="w-16 h-16 object-cover border border-[#00FF41]/50"/>
                                                : <div className="w-16 h-16 flex items-center justify-center border border-[#00FF41]/50 bg-black"><MusicNoteIcon /></div>
                                            }
                                            <div className="flex-1 break-words">
                                                <p className="text-sm font-bold leading-tight">{link.title}</p>
                                                <p className="text-xs mt-1" style={{color: link.user.color}}>Shared by {link.user.name}</p>
                                                <p className="text-xs text-gray-500">{formatTimestamp(link.timestamp)}</p>
                                                <p className="text-xs text-gray-400 underline mt-1">{link.platform}</p>
                                            </div>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="p-2 border-t border-[#00FF41] flex gap-2 bg-black">
                <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && handleSubmit()}
                    placeholder="Send message or paste music link..."
                    className="flex-grow p-2 matrix-input"
                />
                <button onClick={handleSubmit} className="p-2 matrix-button"><SendIcon /></button>
            </div>
        </div>
    );
};

export default RoomComponent;