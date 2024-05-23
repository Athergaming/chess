import React, { useRef, useEffect } from 'react';
import { useDrag } from 'react-dnd';
import { FaChessBishop, FaChessKing, FaChessKnight, FaChessPawn, FaChessQueen, FaChessRook } from 'react-icons/fa';

const ItemTypes = {
    PIECE: 'piece',
};

interface ChessPieceProps {
    type: 'queen' | 'pawn' | 'rook' | 'bishop' | 'king' | 'knight';
    player: 'light' | 'dark';
    position: [number, number];
    currentTurn: 'light' | 'dark';
}

const ChessPiece: React.FC<ChessPieceProps> = ({ type, player, position, currentTurn }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [{ isDragging }, drag] = useDrag(() => ({
        type: ItemTypes.PIECE,
        item: { type, player, position },
        canDrag: () => player === currentTurn,
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    }));

    useEffect(() => {
        drag(ref);
    }, [currentTurn, drag]);

    console.log(`Can drag ${type} at ${position}: ${player === currentTurn}`);

    return (
        <div
            ref={ref}
            className={`text-[40px] w-full h-full flex justify-center items-center ${player === 'dark' ? 'text-[#5C5957]' : 'text-[#F9F9F9]'}`}
            style={{ opacity: isDragging ? 0.5 : 1, cursor: player === currentTurn ? 'move' : 'default' }}
        >
            {type === 'pawn' && <FaChessPawn />}
            {type === 'knight' && <FaChessKnight />}
            {type === 'bishop' && <FaChessBishop />}
            {type === 'rook' && <FaChessRook />}
            {type === 'queen' && <FaChessQueen />}
            {type === 'king' && <FaChessKing />}
        </div>
    );
}

export default ChessPiece;
