// Main game initialization
document.addEventListener('DOMContentLoaded', () => {
    // Initialize game components
    const game = new Game();
    const multiplayer = new MultiplayerManager();

    // Mode selection
    const singlePlayerBtn = document.getElementById('singlePlayerBtn');
    const multiPlayerBtn = document.getElementById('multiPlayerBtn');
    const multiplayerContainer = document.getElementById('multiplayerContainer');
    const gameContainer = document.getElementById('gameContainer');

    singlePlayerBtn.addEventListener('click', () => {
        singlePlayerBtn.classList.add('active');
        multiPlayerBtn.classList.remove('active');
        multiplayerContainer.classList.add('hidden');
        gameContainer.classList.remove('hidden');
        game.setMode('single');
    });

    multiPlayerBtn.addEventListener('click', () => {
        multiPlayerBtn.classList.add('active');
        singlePlayerBtn.classList.remove('active');
        multiplayerContainer.classList.remove('hidden');
        gameContainer.classList.add('hidden');
        game.setMode('multi');
    });

    // Initialize with single player mode
    game.setMode('single');
}); 