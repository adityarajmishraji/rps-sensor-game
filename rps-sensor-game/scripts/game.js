import { GestureControl } from './gesture.js';

class RPSGame {
    constructor() {
        this.scores = { player1: 0, player2: 0, ties: 0 };
        this.gameMode = 'computer';
        this.isGestureMode = false;
        this.currentRoom = null;
        this.playerId = Math.random().toString(36).substr(2, 9);
        this.gameState = { player1Choice: null, player2Choice: null };

        this.choices = ['rock', 'paper', 'scissors'];
        this.choiceEmojis = { rock: '🪨', paper: '📄', scissors: '✂️' };

        this.gestureControl = new GestureControl(this);

        this.initializeEventListeners();
        this.gestureControl.initializeCamera();
    }

    initializeEventListeners() {
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchMode(e.target.dataset.mode));
        });

        document.querySelectorAll('.choice-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const choice = e.target.dataset.choice;
                const player = e.target.dataset.player || '1';
                this.makeChoice(choice, player);
            });
        });

        document.getElementById('startCamera').addEventListener('click', () => this.gestureControl.startCamera());
        document.getElementById('stopCamera').addEventListener('click', () => this.gestureControl.stopCamera());

        document.getElementById('joinRoom').addEventListener('click', () => this.joinRoom());
        document.getElementById('createRoom').addEventListener('click', () => this.createRoom());
    }

    switchMode(mode) {
        document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-mode="${mode}"]`).classList.add('active');

        this.gameMode = mode;
        this.resetGame();

        const cameraSection = document.getElementById('cameraSection');
        const multiplayerSection = document.getElementById('multiplayerSection');
        const player2Controls = document.getElementById('player2Controls');
        const opponentLabel = document.getElementById('opponent-label');
        const opponentTitle = document.getElementById('opponentTitle');

        if (mode === 'gesture') {
            cameraSection.classList.remove('hidden');
            multiplayerSection.style.display = 'none';
            player2Controls.classList.add('hidden');
            opponentLabel.textContent = 'Computer';
            opponentTitle.textContent = 'Computer';
            this.isGestureMode = true;
        } else if (mode === 'multiplayer') {
            cameraSection.classList.add('hidden');
            multiplayerSection.style.display = 'block';
            player2Controls.classList.remove('hidden');
            opponentLabel.textContent = 'Player 2';
            opponentTitle.textContent = 'Player 2';
            this.isGestureMode = false;
        } else {
            cameraSection.classList.add('hidden');
            multiplayerSection.style.display = 'none';
            player2Controls.classList.add('hidden');
            opponentLabel.textContent = 'Computer';
            opponentTitle.textContent = 'Computer';
            this.isGestureMode = false;
        }
    }

    // Keep the rest of the methods as-is: makeChoice, playComputerTurn, evaluateRound, updateScoreBoard, resetRound, resetGame, createRoom, joinRoom...
}

// Initialize the game
document.addEventListener('DOMContentLoaded', () => {
    new RPSGame();
});
