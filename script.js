window.addEventListener('DOMContentLoaded', () => {
  setup();
});

const board = {
    player: 1,
    ai: 2,
    blank: 3,
    draw: 4,
};

let gameState = null;

function setup() {
    createBoard();
    initializeState();
}

//добавили элменты по вертикали и горизонтали
function createBoard() {
    const rows = document.getElementById('rows');
    for (let x = 0; x < 3; x++) {
        const curRow = document.createElement('div');
        curRow.id = 'row' + x;
        curRow.className = 'row';
        rows.appendChild(curRow);

        for (let y = 0; y < 3; y++) {
        const node = document.createElement('img');
        node.className = 'square';
        node.id = x + '.' + y;
        node.onclick = playerClick;
        curRow.appendChild(node);
        }
    };
}

function initializeState() {
    gameState = {
        turn: 'player',
        active: true,
    };
}

function playerClick(evt) {
    const isBlank = !evt.target.src.length;
    if (isBlank &&
        gameState.active &&
        gameState.turn == 'player') {
        evt.target.src = 'x.png';
        gameOver();
        moveAI();
    };
}

function gameOver() {
    const winner = evaluateBoard(getBoardStates());
    if (winner == null) {
        return;
    }
    
    gameState.active = false;

    let desc = '';
    if (winner == board.ai) {
        desc = 'Вы проиграли!';
    } else if (winner == board.player) {
        desc = 'Вы победили!';
    } else {
        desc = 'Ничья.'
    }

    document.getElementById('description').innerText = desc;
}

function getBoardStates() {
    const boardStates = [];
    for (let x = 0; x < 3; x++) {
        const row = [];
        for (let y = 0; y < 3; y++) {
            const node = document.getElementById(x + '.' + y);
            if (node.src.includes('x.png')) {
                row.push(board.player);
            } else if (node.src.includes('o.png')) {
                row.push(board.ai);
            } else {
                row.push(board.blank);
            }
        }
        boardStates.push(row);
    }
    return boardStates;
}

function getSquare() {
    const nodes = [];
    for (let x = 0; x < 3; x++) {
        for (let y = 0; y < 3; y++) {
        nodes.push(document.getElementById(x + '.' + y))
        }
    }
    return nodes;
}

function highlightSquares(blinks) {
    if (blinks === undefined) {
        blinks = 10;
    }

    const nodes = getSquare();
    for (const n of nodes) {
        n.className = 'square';
    }

    if (blinks >= 0) {
        setTimeout(() => {
        moveAI(blinks - 1);
        }, 100);
        const x = Math.floor(Math.random() * 3);
        const y = Math.floor(Math.random() * 3);
        const node = document.getElementById(x + '.' + y);
        node.className = 'square highlight';
        return true;
    }
    return false;
}
//добавили ai
function moveAI(blinks) {
    gameState.turn = 'ai';

    if (highlightSquares(blinks)) {
        return;
    }

    const boardStates = getBoardStates();
    const [_, choice] = MINIMAX(boardStates, board.ai);
    
    if (choice != null) {
        const [x, y] = choice;
        document.getElementById(x + '.' + y).src = 'o.png';
    }

    gameOver();

    gameState.turn = 'player';
}

function evaluateBoard(boardStates) {
    const winningStates = [

        [[0, 0], [0, 1], [0, 2]],
        [[1, 0], [1, 1], [1, 2]],
        [[2, 0], [2, 1], [2, 2]],
        [[0, 0], [1, 0], [2, 0]],
        [[0, 1], [1, 1], [2, 1]],
        [[0, 2], [1, 2], [2, 2]],

        [[0, 0], [1, 1], [2, 2]],
        [[2, 0], [1, 1], [0, 2]],
    ];

    for (const possibleState of winningStates) {
        let curPlayer = null;
        let isWinner = true;
        for (const [x, y] of possibleState) {
            const occupant = boardStates[x][y];
            if (curPlayer == null && occupant != board.blank) {
                curPlayer = occupant;
            } else if (curPlayer != occupant) {
                isWinner = false;
            }
        }
        if (isWinner) {
        return curPlayer;
        }
    }

    let hasMoves = false;
    for (let x = 0; x < 3; x++) {
        for (let y = 0; y < 3; y++) {
            if (boardStates[x][y] == board.blank) {
                hasMoves = true;
            }
        }
    }
    if (!hasMoves) {
        return board.draw;
    }

    return null;
}

function MINIMAX(boardStates, player) {
    const winner = evaluateBoard(boardStates);
    if (winner == board.ai) {
        return [1, null];
    } else if (winner == board.player) {
        return [-1, null];
    }

    let move, moveScore;
    if (player == board.ai) {
        [moveScore, move] = MINIMAX_MAXIMIZE(boardStates);
    } else {
        [moveScore, move] = MINIMAX_MINIMIZE(boardStates);
    }

    if (move == null) {
        moveScore = 0;
    }

    return [moveScore, move];
}

function MINIMAX_MAXIMIZE(boardStates) {
    let moveScore = Number.NEGATIVE_INFINITY;
    let move = null;

    for (let x = 0; x < 3; x++) {
        for (let y = 0; y < 3; y++) {
            if (boardStates[x][y] == board.blank) {
                const newBoardStates = boardStates.map(r => r.slice());

                newBoardStates[x][y] = board.ai;

                const [newMoveScore, _] =  MINIMAX(
                    newBoardStates, board.player);

                if (newMoveScore > moveScore) {
                move = [x, y];
                moveScore = newMoveScore;
                }
            }
        }
    }

    return [moveScore, move];
}

function MINIMAX_MINIMIZE(boardStates) {
    let moveScore = Number.POSITIVE_INFINITY;
    let move = null;

    for (let x = 0; x < 3; x++) {
        for (let y = 0; y < 3; y++) {
            if (boardStates[x][y] == board.blank) {
                const newBoardStates = boardStates.map(r => r.slice());

                newBoardStates[x][y] = board.player;

                const [newMoveScore, _] =  MINIMAX(
                    newBoardStates, board.ai);

                if (newMoveScore < moveScore) {
                move = [x, y];
                moveScore = newMoveScore;
                }
            }
        }
    }

    return [moveScore, move];
}


function MINIMAX_POOL(boardStates, aiTurn) {
 
    const winner = evaluateBoard(boardStates);
    if (winner == board.ai) {
        return [1, null];
    } else if (winner == board.player) {
        return [-1, null];
    }

    let moveCost = Number.NEGATIVE_INFINITY;
    if (!aiTurn) {
        moveCost = Number.POSITIVE_INFINITY;
    }
    let move = null;

    for (let x = 0; x < 3; x++) {
        for (let y = 0; y < 3; y++) {
            if (boardStates[x][y] == board.blank) {
                const newBoardStates = boardStates.map(r => r.slice());

                if (aiTurn) {
                newBoardStates[x][y] = board.ai;
                } else {
                newBoardStates[x][y] = board.player;
                }

                const [newMoveCost, _] =  MINIMAX(newBoardStates, !aiTurn);

                if (aiTurn) {
                    if (newMoveCost > moveCost) {
                        move = [x, y];
                        moveCost = newMoveCost;
                    }
                } else {
                    if (newMoveCost < moveCost) {
                        move = [x, y];
                        moveCost = newMoveCost;
                        }
                }
            }
        }
    }

    if (move != null) {
        return [moveCost, move];
    }

    return [0, null];
}