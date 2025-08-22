
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
        className={`relative flex items-center gap-2 px-4 py-2 text-lg border-b-2 transition-colors duration-200 ${
            isActive
                ? 'border-[#00FF41] matrix-text'
                : 'border-transparent hover:border-[#00FF41]/50 hover:text-white'
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
        <nav className="w-full p-2 flex justify-between items-center matrix-bg matrix-border border-b-2">
            <div className="flex items-center">
                <h1 className="text-3xl matrix-text pr-6">// JAM_ROOMS</h1>
                <div className="flex items-center">
                    <NavButton icon={<GlobeAltIcon/>} label="Home" isActive={currentPage === 'home'} onClick={() => { setCurrentPage('home'); setViewingProfileId(null); }} />
                    <NavButton icon={<HeartIcon/>} label="Liked Rooms" isActive={currentPage === 'liked'} onClick={() => { setCurrentPage('liked'); setViewingProfileId(null); }} />
                    <NavButton icon={<UserIcon/>} label="Friends" isActive={currentPage === 'friends'} onClick={() => { setCurrentPage('friends'); setViewingProfileId(null); }}>
                        {pendingRequestsCount > 0 && (
                            <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
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
                        className="px-2 py-1 pl-8 matrix-input w-48 transition-all duration-300 focus:w-64"
                    />
                    <div className="absolute left-2 top-1/2 -translate-y-1/2 text-[#00FF41]">
                        <SearchIcon />
                    </div>
                 </div>
                 <NavButton 
                    icon={<UserIcon/>} 
                    label={user.name} 
                    isActive={currentPage === 'profile'} 
                    onClick={() => { setCurrentPage('profile'); setViewingProfileId(null); }}
                    className="border-none"
                 />
                <button onClick={onToggleNotificationPanel} title="Notifications" className="relative flex items-center gap-2 p-2 matrix-button">
                    <BellIcon/>
                    {unreadNotificationsCount > 0 && (
                        <span className="absolute top-0 right-0 -mt-2 -mr-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                            {unreadNotificationsCount}
                        </span>
                    )}
                </button>
                <button onClick={onLogout} title="Logout" className="flex items-center gap-2 p-2 matrix-button">
                    <LogoutIcon/>
                </button>
            </div>
        </nav>
    );
};

export default Navbar;