
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
            className="matrix-button matrix-button-secondary"
        >
            {`// RESTORE: ${room.name}`}
        </button>
    );
};

export default MinimizedRoomTab;
