
const board = document.getElementById('board');
const message = document.getElementById('message');
let cells = [];
let currentPlayer = 'x';
let gameOver = false;
let players = { x: 'Player 1', o: 'Player 2' };
let mode = 'human';
let boardSize = 3;
let winLength = 3;

function startGame() {
  const p1 = document.getElementById('player1').value || 'Player 1';
  const p2 = document.getElementById('player2').value || 'Player 2';
  mode = document.getElementById('mode').value;
  boardSize = parseInt(document.getElementById('size').value);
  winLength = boardSize === 3 ? 3 : boardSize === 5 ? 4 : 5;

  players = { x: p1, o: mode === 'computer' ? 'Computer' : p2 };
  currentPlayer = 'x';
  gameOver = false;
  message.textContent = '';
  board.innerHTML = '';
  board.style.gridTemplateColumns = `repeat(${boardSize}, 1fr)`;
  cells = [];

  for (let i = 0; i < boardSize * boardSize; i++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    cell.style.width = cell.style.height = `${Math.floor(500 / boardSize)}px`;
    cell.style.fontSize = `${Math.floor(300 / boardSize)}%`;
    cell.addEventListener('click', () => handleMove(cell, i));
    board.appendChild(cell);
    cells.push(cell);
  }
}

function handleMove(cell, index) {
  if (cell.textContent !== '' || gameOver) return;
  makeMove(cell, index, currentPlayer);
  const result = checkWinner();
  if (result) return endGame(result.winner, result.line);
  currentPlayer = currentPlayer === 'x' ? 'o' : 'x';
  if (mode === 'computer' && currentPlayer === 'o' && !gameOver) {
    setTimeout(() => {
      computerMove();
    }, 300);
  }
}

function makeMove(cell, index, player) {
  cell.textContent = player.toUpperCase();
  cell.classList.add(player);
}

function computerMove() {
  const boardState = cells.map(c => c.textContent.toLowerCase());
  let move;
  if (boardSize === 3) {
    move = minimax(boardState, 'o').index;
  } else {
    const emptyIndices = boardState.map((val, i) => val === '' ? i : null).filter(i => i !== null);
    move = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
  }
  if (move !== undefined) handleMove(cells[move], move);
}

function minimax(boardState, player) {
  const opponent = player === 'x' ? 'o' : 'x';
  const emptyIndices = boardState.map((val, i) => val === '' ? i : null).filter(i => i !== null);
  const winner = checkWinnerSim(boardState);

  if (winner === 'x') return { score: -10 };
  if (winner === 'o') return { score: 10 };
  if (emptyIndices.length === 0) return { score: 0 };

  let moves = [];
  for (let i of emptyIndices) {
    let move = {};
    move.index = i;
    boardState[i] = player;
    move.score = minimax(boardState, opponent).score;
    boardState[i] = '';
    moves.push(move);
  }

  let bestMove = null;
  if (player === 'o') {
    let bestScore = -Infinity;
    for (let move of moves) {
      if (move.score > bestScore) {
        bestScore = move.score;
        bestMove = move;
      }
    }
  } else {
    let bestScore = Infinity;
    for (let move of moves) {
      if (move.score < bestScore) {
        bestScore = move.score;
        bestMove = move;
      }
    }
  }
  return bestMove;
}

function checkWinnerSim(b) {
  return checkWinnerGeneric(b, boardSize, winLength)?.winner;
}

function checkWinner() {
  const b = cells.map(c => c.textContent);
  const result = checkWinnerGeneric(b, boardSize, winLength);
  if (result?.winner) return result;
  if (b.every(c => c !== '')) {
    message.textContent = "It's a draw!";
    gameOver = true;
  }
  return null;
}

function checkWinnerGeneric(b, size, winLen) {
  const lines = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (c + winLen <= size) lines.push([...Array(winLen)].map((_, i) => r * size + c + i));
      if (r + winLen <= size) lines.push([...Array(winLen)].map((_, i) => (r + i) * size + c));
      if (r + winLen <= size && c + winLen <= size) lines.push([...Array(winLen)].map((_, i) => (r + i) * size + c + i));
      if (r + winLen <= size && c - winLen + 1 >= 0) lines.push([...Array(winLen)].map((_, i) => (r + i) * size + c - i));
    }
  }
  for (let line of lines) {
    const symbols = line.map(i => b[i]);
    if (symbols.every(s => s && s === symbols[0])) {
      return { winner: symbols[0].toLowerCase(), line };
    }
  }
  return null;
}

function endGame(winner, line) {
  gameOver = true;
  message.textContent = `Congratulations! ${players[winner]} wins!`;
  line.forEach(i => cells[i].classList.add('win'));
}

function resetGame() {
  startGame();
}

startGame();
