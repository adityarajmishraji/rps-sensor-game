class Leaderboard {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.players = [];
    }

    updateLeaderboard(players) {
        this.players = players;
        this.render();
    }

    render() {
        const rows = this.players.map((player, index) => `
            <tr class="${index < 3 ? 'top-' + (index + 1) : ''}">
                <td>${index + 1}</td>
                <td>${player.username}</td>
                <td>${player.winRate}%</td>
                <td>${player.wins}</td>
                <td>${player.totalGames}</td>
            </tr>
        `).join('');

        this.container.innerHTML = `
            <div class="leaderboard">
                <h3>Top Players</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Rank</th>
                            <th>Player</th>
                            <th>Win Rate</th>
                            <th>Wins</th>
                            <th>Games</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows}
                    </tbody>
                </table>
            </div>
        `;
    }
} 