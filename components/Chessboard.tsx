'use client';

import React, { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Board } from './Board';
import ChessSquare from './ChessSquare';

const Chessboard: React.FC = () => {
    const [currentBoard, setCurrentBoard] = useState(new Board());
    const [currentTurn, setCurrentTurn] = useState<'light' | 'dark'>('light');
    const [gameOver, setGameOver] = useState<string | null>(null);

    const movePiece = (start: [number, number], end: [number, number]) => {
        const boardCopy = currentBoard.clone();
        const startPiece = boardCopy.fields[start[0]][start[1]];

        if (!startPiece || startPiece.player !== currentTurn) {
            console.log(`Invalid move by ${currentTurn}: Not the player's turn or no piece at the start position.`);
            return;
        }

        if (boardCopy.movePiece(start, end)) {
            console.log(`Move valid: ${currentTurn} moved from ${start} to ${end}`);
            setCurrentBoard(boardCopy);

            const opponent = currentTurn === 'light' ? 'dark' : 'light';
            if (boardCopy.isInCheck(opponent)) {
                if (boardCopy.isCheckmate(opponent)) {
                    setGameOver(`${currentTurn} wins by checkmate`);
                } else {
                    console.log(`${opponent} is in check`);
                }
            } else {
                console.log(`${opponent} is not in check`);
            }

            const nextTurn = currentTurn === 'light' ? 'dark' : 'light';
            setCurrentTurn(nextTurn);
        } else {
            console.log(`Invalid move from ${start} to ${end}`);
        }
    };

    useEffect(() => {
        console.log(`Current turn: ${currentTurn}`);
    }, [currentTurn]);

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="border-1 shadow-md">
                <div className="w-[600px] h-[600px] bg-yellow-500 grid grid-cols-8 grid-rows-8">
                    {currentBoard.fields.map((row, rowIndex) => {
                        return row.map((field, columnIndex) => {
                            return (
                                <ChessSquare
                                    key={`${rowIndex}_${columnIndex}-${currentTurn}`}
                                    rowIndex={rowIndex}
                                    columnIndex={columnIndex}
                                    field={field}
                                    movePiece={movePiece}
                                    currentTurn={currentTurn}
                                    gameOver={gameOver !== null}
                                />
                            );
                        });
                    })}
                </div>
                <div className="mt-4 text-center bg-white text-lg font-semibold rounded-md">
                    {gameOver ? <span>Game Over: {gameOver}</span> : <span>Current Turn: {currentTurn.charAt(0).toUpperCase() + currentTurn.slice(1)}</span>}
                </div>
            </div>
        </DndProvider>
    );
}

export default Chessboard;
