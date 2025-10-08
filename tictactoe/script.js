// Variables
let board = Array(9).fill(null);
let currentPlayer = 'X';
let gameActive = false;
let gameMode = null; // 'pvp' หรือ 'ai'
let aiLevel = 'easy';
let history = [];

// Elements
const boardEl = document.getElementById('board');
const statusEl = document.getElementById('status');
const undoBtn = document.getElementById('undoBtn');
const resetBtn = document.getElementById('resetBtn');
const menuBtn = document.getElementById('menuBtn');
const winLine = document.getElementById('win-line');

// Start Game
function startGame() {
    board = Array(9).fill(null);
    currentPlayer = 'X';
    gameActive = true;
    history = [];
    winLine.style.width = '0'; // ซ่อนเส้นชนะ

    boardEl.style.display = 'grid';
    document.querySelector('.scoreboard').style.display = 'flex';
    document.querySelector('.controls').style.display = 'flex';
    statusEl.style.display = 'block';
    statusEl.textContent = `Turn: ${currentPlayer}`;

    // สร้างกระดาน
    boardEl.innerHTML = '';
    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.dataset.index = i;
        cell.addEventListener('click', handleCellClick);
        boardEl.appendChild(cell);
    }

    // ซ่อนเลือกโหมด
    document.querySelector('.mode-select').style.display = 'none';
    if(gameMode==='ai') document.querySelector('.difficulty-select').style.display = 'flex';
}

// Handle Cell Click
function handleCellClick(e) {
    const index = e.target.dataset.index;
    if (!gameActive || board[index]) return;

    board[index] = currentPlayer;
    e.target.textContent = currentPlayer;
    history.push(index);

    if (checkWin()) {
        statusEl.textContent = `${currentPlayer} ชนะ! 🎉`;
        updateScore(currentPlayer);
        gameActive = false;
        return;
    }

    if (board.every(cell => cell)) {
        statusEl.textContent = `เสมอ! 🤝`;
        gameActive = false;
        return;
    }

    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    statusEl.textContent = `Turn: ${currentPlayer}`;

    if (gameMode==='ai' && currentPlayer==='O' && gameActive) {
        setTimeout(aiMove, 400);
    }
}

// Check Win
function checkWin() {
    const winCombos = [
        [0,1,2],[3,4,5],[6,7,8],
        [0,3,6],[1,4,7],[2,5,8],
        [0,4,8],[2,4,6]
    ];
    for (const combo of winCombos) {
        if (combo.every(idx => board[idx]===currentPlayer)) {
            drawWinLine(combo);
            return true;
        }
    }
    return false;
}

// Draw Win Line
function drawWinLine(combo) {
    const cell0 = boardEl.children[combo[0]];
    const cell2 = boardEl.children[combo[2]];

    const rect0 = cell0.getBoundingClientRect();
    const rect2 = cell2.getBoundingClientRect();
    const boardRect = boardEl.getBoundingClientRect();

    const x0 = rect0.left - boardRect.left + rect0.width / 2;
    const y0 = rect0.top - boardRect.top + rect0.height / 2;
    const x2 = rect2.left - boardRect.left + rect2.width / 2;
    const y2 = rect2.top - boardRect.top + rect2.height / 2;

    const dx = x2 - x0;
    const dy = y2 - y0;
    const length = Math.sqrt(dx*dx + dy*dy);
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;

    // ปรับสไตล์เส้นให้ปรากฏ
    winLine.style.display = 'block';
    winLine.style.width = `${length}px`;
    winLine.style.height = '5px'; // ความสูงเส้น
    winLine.style.top = `${y0}px`;
    winLine.style.left = `${x0}px`;
    winLine.style.background = '#ff4444';
    winLine.style.transform = `rotate(${angle}deg) scaleX(1)`;
}



// Update Score
function updateScore(player) {
    if(player==='X') document.getElementById('scoreX').textContent=parseInt(document.getElementById('scoreX').textContent)+1;
    else document.getElementById('scoreO').textContent=parseInt(document.getElementById('scoreO').textContent)+1;
}

// Undo
undoBtn.addEventListener('click', ()=>{
    if(!history.length || !gameActive) return;
    const lastIndex = history.pop();
    board[lastIndex] = null;
    boardEl.children[lastIndex].textContent = '';
    currentPlayer = currentPlayer==='X' ? 'O' : 'X';
    statusEl.textContent = `Turn: ${currentPlayer}`;

    // ซ่อนเส้นชนะ
    winLine.style.width = '0';
    winLine.style.display = 'none';
});

// Reset
resetBtn.addEventListener('click', () => {
    startGame();
    winLine.style.display = 'none';
});

// Menu (กลับไปเลือกโหมด)
menuBtn.addEventListener('click', () => {
    document.querySelector('.mode-select').style.display = 'flex';
    document.querySelector('.difficulty-select').style.display = 'none';
    boardEl.style.display = 'none';
    document.querySelector('.controls').style.display = 'none';
    statusEl.style.display = 'none';
    gameActive = false;

    // ซ่อนเส้นชนะ
    winLine.style.width = '0';
    winLine.style.display = 'none';
});

// เลือกโหมด
document.getElementById('pvpBtn').addEventListener('click', ()=>{
    gameMode='pvp';
    startGame();
});
document.getElementById('aiBtn').addEventListener('click', ()=>{
    gameMode='ai';
    document.querySelector('.difficulty-select').style.display='flex';
});

// เลือกระดับความยาก
document.querySelectorAll('.difficulty').forEach(btn=>{
    btn.addEventListener('click', ()=>{
        aiLevel=btn.dataset.level;
        startGame();
    });
});

// AI Move
function aiMove(){
    const emptyIndexes=board.map((v,i)=>v===null?i:null).filter(v=>v!==null);
    let move;
    if(aiLevel==='easy') move=emptyIndexes[Math.floor(Math.random()*emptyIndexes.length)];
    else if(aiLevel==='medium') move=findWinningMove('O')||emptyIndexes[Math.floor(Math.random()*emptyIndexes.length)];
    else move=findWinningMove('O')||findWinningMove('X')||emptyIndexes[Math.floor(Math.random()*emptyIndexes.length)];
    boardEl.children[move].click();
}

// Find winning/block move
function findWinningMove(player){
    const winCombos=[
        [0,1,2],[3,4,5],[6,7,8],
        [0,3,6],[1,4,7],[2,5,8],
        [0,4,8],[2,4,6]
    ];
    for(const combo of winCombos){
        const marks=combo.map(idx=>board[idx]);
        if(marks.filter(v=>v===player).length===2 && marks.includes(null)){
            return combo[marks.indexOf(null)];
        }
    }
    return null;
}
