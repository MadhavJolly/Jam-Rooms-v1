
import React from 'react';
import { Room } from '../types';

interface MinimizedRoomTabProps {
    room: Room;
    onRestore: () => void;
}

const MinimizedRoomTab: React.FC<MinimizedRoomTabProps> = ({ room, onRestore }) => {
    return (
        <button
            onClick={onRestore}
            className="px-4 py-2 matrix-button matrix-text animate-pulse"
        >
            {`// RESTORE: ${room.name}`}
        </button>
    );
};

export default MinimizedRoomTab;
