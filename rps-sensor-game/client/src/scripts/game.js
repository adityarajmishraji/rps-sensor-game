class RPSGame {
    constructor() {
        this.sessionManager = new SessionManager();
        this.currentMode = 'computer';
        this.isPlaying = false;
        this.roundTimer = null;
        this.scores = { player1: 0, player2: 0 };
        this.gestures = ['rock', 'paper', 'scissors'];
        this.setupEventListeners();
        this.setupAnimations();
    }

    setupEventListeners() {
        // Mode selection
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', () => this.changeMode(btn.dataset.mode));
        });

        // Choice buttons
        document.querySelectorAll('.choice-btn').forEach(btn => {
            btn.addEventListener('click', () => this.makeChoice(btn.dataset.choice));
        });
    }

    setupAnimations() {
        this.animations = {
            shake: [
                { transform: 'translateY(0px)' },
                { transform: 'translateY(-20px)' },
                { transform: 'translateY(0px)' }
            ],
            result: [
                { transform: 'scale(1)', opacity: 0 },
                { transform: 'scale(1.2)', opacity: 1 },
                { transform: 'scale(1)', opacity: 1 }
            ]
        };
    }

    changeMode(mode) {
        this.currentMode = mode;
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });

        // Show/hide camera for gesture mode
        const cameraContainer = document.querySelector('.camera-container');
        cameraContainer.classList.toggle('hidden', mode !== 'gesture');

        // Reset scores
        this.resetGame();
    }

    async makeChoice(playerChoice) {
        if (this.isPlaying) return;
        this.isPlaying = true;

        // Animate countdown
        await this.playCountdown();

        // Get opponent's choice based on mode
        const opponentChoice = await this.getOpponentChoice();

        // Display choices
        this.displayChoices(playerChoice, opponentChoice);

        // Determine winner
        const result = this.determineWinner(playerChoice, opponentChoice);
        
        // Update scores and display
        this.updateScores(result);

        // Save to session storage
        this.sessionManager.addGameScore({
            playerScore: this.scores.player1,
            computerScore: this.scores.player2,
            gameMode: this.currentMode
        });

        // Reset for next round
        setTimeout(() => {
            this.isPlaying = false;
        }, 2000);
    }

    async playCountdown() {
        const timer = document.querySelector('.timer');
        timer.style.display = 'block';
        
        for (let i = 3; i > 0; i--) {
            timer.textContent = i;
            await new Promise(resolve => setTimeout(resolve, 500));
            timer.animate(this.animations.shake, {
                duration: 500,
                iterations: 1
            });
        }
        
        timer.style.display = 'none';
    }

    async getOpponentChoice() {
        switch (this.currentMode) {
            case 'computer':
                return this.gestures[Math.floor(Math.random() * 3)];
            case 'gesture':
                // Get choice from gesture recognition
                const response = await fetch('/detect', {
                    method: 'POST',
                    body: await this.captureImage()
                });
                const data = await response.json();
                return data.gesture;
            default:
                return null;
        }
    }

    displayChoices(player1Choice, player2Choice) {
        const displays = document.querySelectorAll('.choice-display');
        displays[0].textContent = this.getChoiceEmoji(player1Choice);
        displays[1].textContent = this.getChoiceEmoji(player2Choice);

        displays.forEach(display => {
            display.animate(this.animations.result, {
                duration: 500,
                iterations: 1
            });
        });
    }

    getChoiceEmoji(choice) {
        const emojis = {
            rock: '✊',
            paper: '✋',
            scissors: '✌'
        };
        return emojis[choice] || '❓';
    }

    determineWinner(choice1, choice2) {
        if (choice1 === choice2) return 'draw';
        const wins = {
            rock: 'scissors',
            paper: 'rock',
            scissors: 'paper'
        };
        return wins[choice1] === choice2 ? 'win' : 'loss';
    }

    updateScores(result) {
        const resultDisplay = document.querySelector('.result');
        
        switch (result) {
            case 'win':
                this.scores.player1++;
                resultDisplay.textContent = 'You Win! 🎉';
                this.sessionManager.updateStatistics('win');
                break;
            case 'loss':
                this.scores.player2++;
                resultDisplay.textContent = 'You Lose! 😢';
                this.sessionManager.updateStatistics('loss');
                break;
            case 'draw':
                resultDisplay.textContent = 'Draw! 🤝';
                this.sessionManager.updateStatistics('draw');
                break;
        }

        // Update score displays
        document.querySelectorAll('.score').forEach((display, index) => {
            display.textContent = this.scores[`player${index + 1}`];
        });

        resultDisplay.animate(this.animations.result, {
            duration: 500,
            iterations: 1
        });
    }

    resetGame() {
        this.scores = { player1: 0, player2: 0 };
        document.querySelectorAll('.score').forEach(display => {
            display.textContent = '0';
        });
        document.querySelector('.result').textContent = '';
        document.querySelectorAll('.choice-display').forEach(display => {
            display.textContent = '';
        });
    }

    async captureImage() {
        const video = document.getElementById('camera-feed');
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);
        
        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg'));
        const formData = new FormData();
        formData.append('image', blob);
        return formData;
    }
}

// Initialize game when document is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.game = new RPSGame();
}); 