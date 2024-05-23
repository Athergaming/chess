import React, { useRef, useEffect } from 'react';
import { useDrop } from 'react-dnd';
import ChessPiece from './ChessPiece';

const ItemTypes = {
    PIECE: 'piece',
};

interface ChessSquareProps {
    rowIndex: number;
    columnIndex: number;
    field: any;
    movePiece: (start: [number, number], end: [number, number]) => void;
    currentTurn: 'light' | 'dark';
    gameOver: boolean;
}

const ChessSquare: React.FC<ChessSquareProps> = ({ rowIndex, columnIndex, field, movePiece, currentTurn, gameOver }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [, drop] = useDrop(() => ({
        accept: ItemTypes.PIECE,
        canDrop: () => !gameOver,
        drop: (item: { position: [number, number] }) => {
            if (!gameOver) {
                console.log(`Attempting to move piece from ${item.position} to [${rowIndex}, ${columnIndex}]`);
                movePiece(item.position, [rowIndex, columnIndex]);
            }
        },
    }));

    useEffect(() => {
        drop(ref);
    }, [currentTurn]);

    return (
        <div
            ref={ref}
            className={`w-full h-full ${(rowIndex + columnIndex) % 2 === 0 ? 'bg-[#EBECD0]' : 'bg-[#739552]'}`}
        >
            {field !== 0 && (
                <ChessPiece
                    key={`${rowIndex}_${columnIndex}`}
                    type={field.type}
                    player={field.player}
                    position={[rowIndex, columnIndex]}
                    currentTurn={currentTurn}
                />
            )}
        </div>
    );
}

export default ChessSquare;
