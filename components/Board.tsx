type ChessPieceType = 'queen' | 'pawn' | 'rook' | 'bishop' | 'king' | 'knight';
type ChessPieceColor = 'light' | 'dark';

class ChessPiece {
    constructor(public type: ChessPieceType, public player: ChessPieceColor) {}
}

function dp(type: ChessPieceType = 'pawn') {
    return new ChessPiece(type, 'dark');
}

function lp(type: ChessPieceType = 'pawn') {
    return new ChessPiece(type, 'light');
}

export class Board {
    fields: Array<Array<ChessPiece | 0>>;
    enPassantTarget: [number, number] | null = null;
    castlingRights: { [color in ChessPieceColor]: { kingSide: boolean; queenSide: boolean } } = {
        light: { kingSide: true, queenSide: true },
        dark: { kingSide: true, queenSide: true },
    };

    constructor() {
        this.fields = [
            [dp('rook'), dp('knight'), dp('bishop'), dp('queen'), dp('king'), dp('bishop'), dp('knight'), dp('rook')],
            [dp(), dp(), dp(), dp(), dp(), dp(), dp(), dp()],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [lp(), lp(), lp(), lp(), lp(), lp(), lp(), lp()],
            [lp('rook'), lp('knight'), lp('bishop'), lp('queen'), lp('king'), lp('bishop'), lp('knight'), lp('rook')],
        ];
    }

    clone(): Board {
        const newBoard = new Board();
        newBoard.fields = this.fields.map(row => row.map(cell => (cell ? new ChessPiece(cell.type, cell.player) : 0)));
        newBoard.enPassantTarget = this.enPassantTarget;
        newBoard.castlingRights = JSON.parse(JSON.stringify(this.castlingRights));
        return newBoard;
    }

    movePiece(start: [number, number], end: [number, number]): boolean {
        const [startX, startY] = start;
        const [endX, endY] = end;
        const piece = this.fields[startX][startY];
        const target = this.fields[endX][endY];

        if (piece && this.isValidMove(piece, start, end, target)) {
            // Handle en passant
            if (piece.type === 'pawn' && Math.abs(endX - startX) === 2) {
                this.enPassantTarget = [endX - (piece.player === 'light' ? 1 : -1), endY];
            } else {
                this.enPassantTarget = null;
            }

            if (piece.type === 'pawn' && endY !== startY && target === 0) {
                // En passant capture
                this.fields[startX][endY] = 0;
            }

            if (piece.type === 'pawn' && (endX === 0 || endX === 7)) {
                // Pawn promotion
                this.fields[endX][endY] = new ChessPiece('queen', piece.player);
            } else {
                this.fields[endX][endY] = piece;
            }
            this.fields[startX][startY] = 0;

            // Handle castling
            if (piece.type === 'king' && Math.abs(startY - endY) === 2) {
                if (endY === 6) {
                    // Kingside castling
                    this.fields[startX][5] = this.fields[startX][7];
                    this.fields[startX][7] = 0;
                } else if (endY === 2) {
                    // Queenside castling
                    this.fields[startX][3] = this.fields[startX][0];
                    this.fields[startX][0] = 0;
                }
                this.castlingRights[piece.player].kingSide = false;
                this.castlingRights[piece.player].queenSide = false;
            }

            // Update castling rights for rooks and kings
            if (piece.type === 'rook') {
                if (startX === 0 && startY === 0) {
                    this.castlingRights.dark.queenSide = false;
                } else if (startX === 0 && startY === 7) {
                    this.castlingRights.dark.kingSide = false;
                } else if (startX === 7 && startY === 0) {
                    this.castlingRights.light.queenSide = false;
                } else if (startX === 7 && startY === 7) {
                    this.castlingRights.light.kingSide = false;
                }
            }
            if (piece.type === 'king') {
                this.castlingRights[piece.player].kingSide = false;
                this.castlingRights[piece.player].queenSide = false;
            }

            return true;
        }
        return false;
    }

    isValidMove(piece: ChessPiece, start: [number, number], end: [number, number], target: ChessPiece | 0): boolean {
        if (target && target.player === piece.player) {
            return false; // Can't capture your own piece
        }

        // Simulate the move to see if it puts the king in check
        const boardCopy = this.clone();
        boardCopy.fields[end[0]][end[1]] = piece;
        boardCopy.fields[start[0]][start[1]] = 0;
        if (boardCopy.isInCheck(piece.player)) {
            return false; // Can't move into check
        }

        const [startX, startY] = start;
        const [endX, endY] = end;

        switch (piece.type) {
            case 'pawn':
                return this.isValidPawnMove(piece, start, end, target);
            case 'rook':
                return this.isValidRookMove(start, end);
            case 'knight':
                return this.isValidKnightMove(start, end);
            case 'bishop':
                return this.isValidBishopMove(start, end);
            case 'queen':
                return this.isValidQueenMove(start, end);
            case 'king':
                return this.isValidKingMove(piece, start, end);
            default:
                return false;
        }
    }

    isPathClear(start: [number, number], end: [number, number]): boolean {
        const [startX, startY] = start;
        const [endX, endY] = end;

        const dx = Math.sign(endX - startX);
        const dy = Math.sign(endY - startY);

        let x = startX + dx;
        let y = startY + dy;

        while (x !== endX || y !== endY) {
            if (this.fields[x][y] !== 0) {
                return false;
            }
            x += dx;
            y += dy;
        }

        return true;
    }

    isValidPawnMove(piece: ChessPiece, start: [number, number], end: [number, number], target: ChessPiece | 0): boolean {
        const [startX, startY] = start;
        const [endX, endY] = end;
        const direction = piece.player === 'light' ? -1 : 1;
        const startRow = piece.player === 'light' ? 6 : 1;

        if (startY === endY && target === 0) {
            if (endX === startX + direction) {
                return true;
            }
            if (startX === startRow && endX === startX + 2 * direction && this.fields[startX + direction][startY] === 0) {
                return true;
            }
        } else if (Math.abs(startY - endY) === 1 && endX === startX + direction) {
            if (target !== 0) {
                return true;
            }
            if (this.enPassantTarget && this.enPassantTarget[0] === endX && this.enPassantTarget[1] === endY) {
                return true;
            }
        }

        return false;
    }

    isValidRookMove(start: [number, number], end: [number, number]): boolean {
        const [startX, startY] = start;
        const [endX, endY] = end;
        if (startX === endX || startY === endY) {
            return this.isPathClear(start, end);
        }
        return false;
    }

    isValidKnightMove(start: [number, number], end: [number, number]): boolean {
        const [startX, startY] = start;
        const [endX, endY] = end;
        const dx = Math.abs(endX - startX);
        const dy = Math.abs(endY - startY);
        return (dx === 2 && dy === 1) || (dx === 1 && dy === 2);
    }

    isValidBishopMove(start: [number, number], end: [number, number]): boolean {
        const [startX, startY] = start;
        const [endX, endY] = end;
        if (Math.abs(endX - startX) === Math.abs(endY - startY)) {
            return this.isPathClear(start, end);
        }
        return false;
    }

    isValidQueenMove(start: [number, number], end: [number, number]): boolean {
        return this.isValidRookMove(start, end) || this.isValidBishopMove(start, end);
    }

    isValidKingMove(piece: ChessPiece, start: [number, number], end: [number, number]): boolean {
        const [startX, startY] = start;
        const [endX, endY] = end;
        const dx = Math.abs(endX - startX);
        const dy = Math.abs(endY - startY);

        // Castling
        if (dx === 2 && dy === 0) {
            if (endY === 6 && this.castlingRights[piece.player].kingSide) {
                return this.isPathClear(start, [startX, 7]);
            } else if (endY === 2 && this.castlingRights[piece.player].queenSide) {
                return this.isPathClear(start, [startX, 0]);
            }
        }

        return dx <= 1 && dy <= 1;
    }

    isInCheck(player: ChessPieceColor): boolean {
        const kingPosition = this.findKing(player);
        if (!kingPosition) return false;

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.fields[row][col];
                if (piece && piece.player !== player && this.isValidMove(piece, [row, col], kingPosition, 0)) {
                    return true;
                }
            }
        }
        return false;
    }

    isCheckmate(player: ChessPieceColor): boolean {
        if (!this.isInCheck(player)) return false;

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.fields[row][col];
                if (piece && piece.player === player) {
                    for (let newRow = 0; newRow < 8; newRow++) {
                        for (let newCol = 0; newCol < 8; newCol++) {
                            const newBoard = this.clone();
                            if (newBoard.movePiece([row, col], [newRow, newCol]) && !newBoard.isInCheck(player)) {
                                return false;
                            }
                        }
                    }
                }
            }
        }
        return true;
    }

    findKing(player: ChessPieceColor): [number, number] | null {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.fields[row][col];
                if (piece && piece.player === player && piece.type === 'king') {
                    return [row, col];
                }
            }
        }
        return null;
    }
}
