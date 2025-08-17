
export interface User {
  id: string;
  name: string;
  color: string;
  password?: string;
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
