// Heart Sweeper - Minesweeper Style Game

class HeartSweeper {
    constructor() {
        this.rows = 9;
        this.cols = 9;
        this.mines = 10;
        this.hearts = 5; // Hearts to find
        this.board = [];
        this.revealed = [];
        this.flagged = [];
        this.gameOver = false;
        this.won = false;
        this.timer = 0;
        this.timerInterval = null;
        this.firstClick = true;
        
        this.cuteMessages = [
            "💕 Oops! You're too cute to lose!",
            "💖 Don't worry, love conquers all!",
            "💝 Even bombs can't stop our love!",
            "💗 Try again, my heart is with you!",
            "💓 You found a bomb, but you stole my heart!",
            "💞 Game over, but our love isn't!",
            "💕 Boom! But you're still adorable!",
            "💖 That's a bomb, but you're the bomb!"
        ];
        
        this.winMessages = [
            "🎉 You found all the hearts! I love you!",
            "💖 You won my heart and the game!",
            "💕 Perfect! Just like our love!",
            "🎊 Victory! You're my everything!"
        ];
        
        this.init();
    }
    
    init() {
        this.createBoard();
        this.render();
        this.setupEventListeners();
    }
    
    createBoard() {
        // Initialize empty board
        this.board = Array(this.rows).fill(null).map(() => Array(this.cols).fill(0));
        this.revealed = Array(this.rows).fill(null).map(() => Array(this.cols).fill(false));
        this.flagged = Array(this.rows).fill(null).map(() => Array(this.cols).fill(false));
        
        // Place mines and hearts randomly
        let placed = 0;
        let heartsPlaced = 0;
        
        while (placed < this.mines + this.hearts) {
            const row = Math.floor(Math.random() * this.rows);
            const col = Math.floor(Math.random() * this.cols);
            
            if (this.board[row][col] === 0) {
                if (heartsPlaced < this.hearts) {
                    this.board[row][col] = 'heart';
                    heartsPlaced++;
                } else {
                    this.board[row][col] = 'mine';
                }
                placed++;
            }
        }
        
        // Calculate numbers for each cell
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                if (this.board[r][c] === 0) {
                    this.board[r][c] = this.countAdjacentMines(r, c);
                }
            }
        }
    }
    
    countAdjacentMines(row, col) {
        let count = 0;
        for (let r = row - 1; r <= row + 1; r++) {
            for (let c = col - 1; c <= col + 1; c++) {
                if (r >= 0 && r < this.rows && c >= 0 && c < this.cols) {
                    if (this.board[r][c] === 'mine') {
                        count++;
                    }
                }
            }
        }
        return count;
    }
    
    render() {
        const boardEl = document.getElementById('gameBoard');
        boardEl.innerHTML = '';
        
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = r;
                cell.dataset.col = c;
                
                if (this.revealed[r][c]) {
                    cell.classList.add('revealed');
                    const value = this.board[r][c];
                    
                    if (value === 'mine') {
                        cell.classList.add('bomb');
                        cell.textContent = '💣';
                    } else if (value === 'heart') {
                        cell.classList.add('heart');
                        cell.textContent = '❤️';
                    } else if (value > 0) {
                        cell.classList.add(`number-${value}`);
                        cell.textContent = value;
                    }
                } else if (this.flagged[r][c]) {
                    cell.classList.add('flagged');
                    cell.textContent = '🚩';
                }
                
                boardEl.appendChild(cell);
            }
        }
        
        this.updateDisplay();
    }
    
    updateDisplay() {
        // Update mine counter
        const flags = this.flagged.flat().filter(f => f).length;
        document.getElementById('mineCounter').textContent = 
            String(this.mines + this.hearts - flags).padStart(3, '0');
        
        // Update timer
        document.getElementById('timer').textContent = 
            String(this.timer).padStart(3, '0');
        
        // Update smiley
        const smiley = document.getElementById('smileyBtn');
        if (this.gameOver) {
            if (this.won) {
                smiley.textContent = '😎';
                smiley.classList.add('won');
            } else {
                smiley.textContent = '😵';
                smiley.classList.add('lost');
            }
        } else {
            smiley.textContent = '😊';
            smiley.classList.remove('won', 'lost');
        }
    }
    
    reveal(row, col) {
        if (this.gameOver || this.revealed[row][col] || this.flagged[row][col]) return;
        
        // Start timer on first click
        if (this.firstClick) {
            this.firstClick = false;
            this.startTimer();
        }
        
        this.revealed[row][col] = true;
        const value = this.board[row][col];
        
        if (value === 'mine') {
            this.gameOver = false; // Don't end game on bomb
            this.showCuteMessage();
            // Reveal the bomb but keep playing
        } else if (value === 'heart') {
            this.checkWin();
        } else if (value === 0) {
            // Reveal adjacent cells
            for (let r = row - 1; r <= row + 1; r++) {
                for (let c = col - 1; c <= col + 1; c++) {
                    if (r >= 0 && r < this.rows && c >= 0 && c < this.cols) {
                        this.reveal(r, c);
                    }
                }
            }
        }
        
        this.render();
    }
    
    toggleFlag(row, col) {
        if (this.gameOver || this.revealed[row][col]) return;
        
        this.flagged[row][col] = !this.flagged[row][col];
        this.render();
    }
    
    showCuteMessage() {
        const msg = this.cuteMessages[Math.floor(Math.random() * this.cuteMessages.length)];
        const msgEl = document.getElementById('gameMessage');
        msgEl.textContent = msg;
        msgEl.className = 'game-message lost';
        
        setTimeout(() => {
            msgEl.textContent = '';
            msgEl.className = 'game-message';
        }, 3000);
    }
    
    checkWin() {
        // Check if all hearts are found
        let heartsFound = 0;
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                if (this.board[r][c] === 'heart' && this.revealed[r][c]) {
                    heartsFound++;
                }
            }
        }
        
        if (heartsFound >= this.hearts) {
            this.won = true;
            this.gameOver = true;
            this.stopTimer();
            
            const msg = this.winMessages[Math.floor(Math.random() * this.winMessages.length)];
            const msgEl = document.getElementById('gameMessage');
            msgEl.textContent = msg;
            msgEl.className = 'game-message won';
            
            this.render();
            
            // Auto-complete after delay
            setTimeout(() => {
                window.parent.postMessage({
                    type: 'APP_COMPLETE',
                    appId: 'sweeper',
                    nextApp: 'bucketlist'
                }, '*');
            }, 4000);
        }
    }
    
    startTimer() {
        this.timerInterval = setInterval(() => {
            this.timer++;
            if (this.timer > 999) this.timer = 999;
            this.updateDisplay();
        }, 1000);
    }
    
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }
    
    newGame() {
        this.stopTimer();
        this.gameOver = false;
        this.won = false;
        this.timer = 0;
        this.firstClick = true;
        this.createBoard();
        this.render();
        
        document.getElementById('gameMessage').textContent = '';
        document.getElementById('gameMessage').className = 'game-message';
    }
    
    setupEventListeners() {
        const boardEl = document.getElementById('gameBoard');
        
        boardEl.addEventListener('click', (e) => {
            if (e.target.classList.contains('cell')) {
                const row = parseInt(e.target.dataset.row);
                const col = parseInt(e.target.dataset.col);
                this.reveal(row, col);
            }
        });
        
        boardEl.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            if (e.target.classList.contains('cell')) {
                const row = parseInt(e.target.dataset.row);
                const col = parseInt(e.target.dataset.col);
                this.toggleFlag(row, col);
            }
        });
        
        // Back button
        document.getElementById('backButton').addEventListener('click', () => {
            window.parent.postMessage({ type: 'NAVIGATE', direction: 'close' }, '*');
        });
        
        // Finish button
        document.getElementById('finishButton').addEventListener('click', () => {
            window.parent.postMessage({
                type: 'APP_COMPLETE',
                appId: 'sweeper',
                nextApp: 'bucketlist'
            }, '*');
        });
    }
}

// Initialize game
const game = new HeartSweeper();

// Listen for config updates
window.addEventListener('message', (e) => {
    if (e.data?.type === 'CONFIG_UPDATE') {
        window.CONFIG = e.data.config;
    }
});
