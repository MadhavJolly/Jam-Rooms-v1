
import React from 'react';
import { User, Notification } from '../types';
import { UserIcon, LogoutIcon, GlobeAltIcon, HeartIcon, SearchIcon, BellIcon } from './icons';

interface NavbarProps {
    user: User;
    onLogout: () => void;
    currentPage: 'home' | 'liked' | 'profile' | 'friends';
    setCurrentPage: (page: 'home' | 'liked' | 'profile' | 'friends') => void;
    setViewingProfileId: (id: string | null) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    notifications: Notification[];
    onToggleNotificationPanel: () => void;
}

const NavButton: React.FC<{
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
    onClick: () => void;
    className?: string;
    children?: React.ReactNode;
}> = ({ icon, label, isActive, onClick, className = '', children }) => (
    <button
        onClick={onClick}
        className={`relative flex items-center gap-2 px-4 py-2 text-lg rounded-md transition-colors duration-200 ${
            isActive
                ? 'bg-[var(--color-accent-transparent)] matrix-text'
                : 'text-gray-300 hover:bg-white/5 hover:text-white'
        } ${className}`}
    >
        {icon}
        {label}
        {children}
    </button>
);

const Navbar: React.FC<NavbarProps> = ({ user, onLogout, currentPage, setCurrentPage, setViewingProfileId, searchQuery, setSearchQuery, notifications, onToggleNotificationPanel }) => {
    
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        if (currentPage !== 'home') {
            setCurrentPage('home');
        }
    };
    
    const pendingRequestsCount = user.incomingFriendRequests?.length || 0;
    const unreadNotificationsCount = notifications.filter(n => !n.read).length;

    return (
        <nav className="w-full p-2 flex justify-between items-center matrix-bg rounded-none border-b border-[var(--color-border)]">
            <div className="flex items-center gap-4">
                <h1 className="text-3xl matrix-text pr-4">// JAM_ROOMS</h1>
                <div className="flex items-center gap-2">
                    <NavButton icon={<GlobeAltIcon/>} label="Home" isActive={currentPage === 'home'} onClick={() => { setCurrentPage('home'); setViewingProfileId(null); }} />
                    <NavButton icon={<HeartIcon/>} label="Liked" isActive={currentPage === 'liked'} onClick={() => { setCurrentPage('liked'); setViewingProfileId(null); }} />
                    <NavButton icon={<UserIcon/>} label="Friends" isActive={currentPage === 'friends'} onClick={() => { setCurrentPage('friends'); setViewingProfileId(null); }}>
                        {pendingRequestsCount > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-danger)] text-xs text-white">
                                {pendingRequestsCount}
                            </span>
                        )}
                    </NavButton>
                </div>
            </div>
            <div className="flex items-center gap-4">
                 <div className="relative flex items-center">
                    <input
                        type="text"
                        placeholder="Search rooms..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className="px-3 py-2 pl-10 matrix-input w-56 transition-all duration-300 focus:w-72"
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <SearchIcon />
                    </div>
                 </div>
                 <NavButton 
                    icon={<UserIcon/>} 
                    label={user.name} 
                    isActive={currentPage === 'profile'} 
                    onClick={() => { setCurrentPage('profile'); setViewingProfileId(null); }}
                 />
                <button onClick={onToggleNotificationPanel} title="Notifications" className="relative p-2 text-gray-300 rounded-md hover:bg-white/5 hover:text-white transition-colors">
                    <BellIcon/>
                    {unreadNotificationsCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-danger)] text-xs text-white">
                            {unreadNotificationsCount}
                        </span>
                    )}
                </button>
                <button onClick={onLogout} title="Logout" className="p-2 text-gray-300 rounded-md hover:bg-white/5 hover:text-white transition-colors">
                    <LogoutIcon/>
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
