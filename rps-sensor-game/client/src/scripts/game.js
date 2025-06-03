class RPSGame {
    constructor() {
        this.currentMode = CONFIG.modes.computer;
        this.scores = { player1: 0, player2: 0 };
        this.currentRound = 0;
        this.isGameActive = false;
        this.choices = { player1: null, player2: null };
        
        // Socket event listeners
        GAME_SOCKET.on('gameStart', this.handleGameStart.bind(this));
        GAME_SOCKET.on('opponentChoice', this.handleOpponentChoice.bind(this));
        GAME_SOCKET.on('roundResult', this.handleRoundResult.bind(this));
        
        // DOM elements
        this.setupDOMElements();
        this.setupEventListeners();
    }

    setupDOMElements() {
        this.player1Display = document.querySelector('.player-1 .choice-display');
        this.player2Display = document.querySelector('.player-2 .choice-display');
        this.player1Score = document.querySelector('.player-1 .score');
        this.player2Score = document.querySelector('.player-2 .score');
        this.resultDisplay = document.querySelector('.result');
        this.timerDisplay = document.querySelector('.timer');
        this.modeButtons = document.querySelectorAll('.mode-btn');
        this.choiceButtons = document.querySelectorAll('.choice-btn');
        this.cameraContainer = document.querySelector('.camera-container');
    }

    setupEventListeners() {
        this.modeButtons.forEach(btn => {
            btn.addEventListener('click', () => this.setGameMode(btn.dataset.mode));
        });

        this.choiceButtons.forEach(btn => {
            btn.addEventListener('click', () => this.makeChoice(btn.dataset.choice));
        });
    }

    setGameMode(mode) {
        this.currentMode = mode;
        this.resetGame();
        
        // Update UI
        this.modeButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });

        // Handle camera visibility
        this.cameraContainer.classList.toggle('hidden', mode !== CONFIG.modes.gesture);
        
        if (mode === CONFIG.modes.gesture) {
            window.gestureDetector.start();
        } else {
            window.gestureDetector.stop();
        }
    }

    makeChoice(choice) {
        if (!this.isGameActive) return;
        
        this.choices.player1 = choice;
        this.player1Display.textContent = this.getChoiceEmoji(choice);
        
        if (this.currentMode === CONFIG.modes.computer) {
            this.makeComputerChoice();
        } else {
            GAME_SOCKET.emit('playerChoice', { choice });
        }
    }

    makeComputerChoice() {
        const choices = ['rock', 'paper', 'scissors'];
        const computerChoice = choices[Math.floor(Math.random() * choices.length)];
        this.choices.player2 = computerChoice;
        this.player2Display.textContent = this.getChoiceEmoji(computerChoice);
        
        setTimeout(() => {
            this.determineWinner();
        }, 1000);
    }

    handleOpponentChoice(data) {
        this.choices.player2 = data.choice;
        this.player2Display.textContent = this.getChoiceEmoji(data.choice);
        this.determineWinner();
    }

    determineWinner() {
        const { player1, player2 } = this.choices;
        let result = '';

        if (player1 === player2) {
            result = 'Draw!';
        } else if (
            (player1 === 'rock' && player2 === 'scissors') ||
            (player1 === 'paper' && player2 === 'rock') ||
            (player1 === 'scissors' && player2 === 'paper')
        ) {
            result = 'Player 1 wins!';
            this.scores.player1++;
        } else {
            result = 'Player 2 wins!';
            this.scores.player2++;
        }

        this.updateScores();
        this.showResult(result);
        
        if (this.scores.player1 >= CONFIG.maxScore || this.scores.player2 >= CONFIG.maxScore) {
            this.endGame();
        } else {
            this.prepareNextRound();
        }
    }

    updateScores() {
        this.player1Score.textContent = this.scores.player1;
        this.player2Score.textContent = this.scores.player2;
    }

    showResult(result) {
        this.resultDisplay.textContent = result;
        
        // Play sound effect
        const sound = new Audio(
            result.includes('Draw') ? CONFIG.sounds.draw :
            result.includes('Player 1') ? CONFIG.sounds.win :
            CONFIG.sounds.lose
        );
        sound.play().catch(console.error);
    }

    prepareNextRound() {
        setTimeout(() => {
            this.player1Display.textContent = '';
            this.player2Display.textContent = '';
            this.resultDisplay.textContent = '';
            this.choices = { player1: null, player2: null };
            this.startRound();
        }, 2000);
    }

    startRound() {
        this.isGameActive = true;
        let countdown = 3;
        
        const timer = setInterval(() => {
            if (countdown > 0) {
                this.timerDisplay.textContent = countdown;
                countdown--;
            } else {
                clearInterval(timer);
                this.timerDisplay.textContent = 'Go!';
                setTimeout(() => {
                    this.timerDisplay.textContent = '';
                }, 500);
            }
        }, 1000);
    }

    resetGame() {
        this.scores = { player1: 0, player2: 0 };
        this.currentRound = 0;
        this.isGameActive = false;
        this.choices = { player1: null, player2: null };
        
        this.updateScores();
        this.player1Display.textContent = '';
        this.player2Display.textContent = '';
        this.resultDisplay.textContent = '';
        this.timerDisplay.textContent = '';
        
        this.startRound();
    }

    endGame() {
        this.isGameActive = false;
        const winner = this.scores.player1 > this.scores.player2 ? 'Player 1' : 'Player 2';
        this.resultDisplay.textContent = `Game Over! ${winner} wins the match!`;
        
        setTimeout(() => {
            if (confirm('Play again?')) {
                this.resetGame();
            }
        }, 2000);
    }

    getChoiceEmoji(choice) {
        const emojis = {
            rock: '✊',
            paper: '✋',
            scissors: '✌'
        };
        return emojis[choice] || '';
    }

    // Socket event handlers
    handleGameStart(data) {
        console.log('Game started:', data);
        this.resetGame();
    }

    handleRoundResult(data) {
        console.log('Round result:', data);
        this.showResult(data.result);
    }
}

// Initialize game when document is ready
document.addEventListener('DOMContentLoaded', () => {
    window.game = new RPSGame();
}); 