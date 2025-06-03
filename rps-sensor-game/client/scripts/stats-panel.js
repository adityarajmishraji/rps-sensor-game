class StatsPanel {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.stats = {
            wins: 0,
            losses: 0,
            draws: 0,
            totalGames: 0,
            winRate: 0
        };
    }

    updateStats(newStats) {
        this.stats = {
            ...newStats,
            winRate: newStats.totalGames > 0 
                ? ((newStats.wins / newStats.totalGames) * 100).toFixed(1) 
                : '0.0'
        };
        this.render();
    }

    render() {
        this.container.innerHTML = `
            <div class="stats-panel">
                <h3>Your Stats</h3>
                <div class="stats-grid">
                    <div class="stat-item">
                        <span class="stat-label">Wins</span>
                        <span class="stat-value">${this.stats.wins}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Losses</span>
                        <span class="stat-value">${this.stats.losses}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Draws</span>
                        <span class="stat-value">${this.stats.draws}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Win Rate</span>
                        <span class="stat-value">${this.stats.winRate}%</span>
                    </div>
                </div>
            </div>
        `;
    }
} 