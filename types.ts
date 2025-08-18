
export interface User {
  id: string;
  name: string;
  color: string;
  password?: string;
  bio?: string;
  status?: string;
  onlineStatus?: 'online' | 'offline';
  favoriteGenres?: string[];
  stats?: {
    roomsCreated: number;
    tracksShared: number;
    messagesPosted: number;
    likesReceived: number;
  }
}

export interface Message {
  id: string;
  user: User;
  text: string;
  timestamp: number;
}

export interface MusicLink {
  id: string;
  user: User;
  url: string;
  platform: 'Spotify' | 'YouTube' | 'SoundCloud' | 'Apple Music' | 'Bandcamp' | 'Discogs' | 'Other';
  title: string;
  thumbnail?: string;
  timestamp: number;
  likes: string[]; // Array of user IDs who liked it
}

export interface Room {
  id: string;
  name: string;
  description: string;
  tags: string[];
  isPrivate: boolean;
  creatorId: string;
  adminIds: string[];
  status: 'open' | 'minimized';
  position: { x: number; y: number };
  size: { width: number; height: number };
  messages: Message[];
  musicLinks: MusicLink[];
  users: User[];
  zIndex: number;
  userCount?: number;
  songCount?: number;
}