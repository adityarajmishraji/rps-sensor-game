import { v4 as uuidv4 } from 'uuid';

interface GameScore {
    timestamp: number;
    playerScore: number;
    computerScore: number;
    gameMode: string;
}

interface GameSession {
    sessionId: string;
    scores: GameScore[];
    preferences: {
        theme: 'light' | 'dark';
        soundEnabled: boolean;
        vibrationEnabled: boolean;
    };
    statistics: {
        gamesPlayed: number;
        wins: number;
        losses: number;
        draws: number;
    };
}

export class SessionManager {
    private static readonly SESSION_KEY = 'rps_game_session';
    private session: GameSession;

    constructor() {
        this.session = this.loadSession();
    }

    private loadSession(): GameSession {
        const stored = localStorage.getItem(SessionManager.SESSION_KEY);
        if (stored) {
            return JSON.parse(stored);
        }

        // Create new session for first-time users
        const newSession: GameSession = {
            sessionId: uuidv4(),
            scores: [],
            preferences: {
                theme: 'light',
                soundEnabled: true,
                vibrationEnabled: true
            },
            statistics: {
                gamesPlayed: 0,
                wins: 0,
                losses: 0,
                draws: 0
            }
        };
        this.saveSession(newSession);
        return newSession;
    }

    private saveSession(session: GameSession): void {
        localStorage.setItem(SessionManager.SESSION_KEY, JSON.stringify(session));
        this.session = session;
    }

    public addGameScore(score: Omit<GameScore, 'timestamp'>): void {
        const newScore: GameScore = {
            ...score,
            timestamp: Date.now()
        };
        this.session.scores = [newScore, ...this.session.scores].slice(0, 50); // Keep last 50 games
        this.saveSession(this.session);
    }

    public updateStatistics(result: 'win' | 'loss' | 'draw'): void {
        this.session.statistics.gamesPlayed++;
        switch (result) {
            case 'win':
                this.session.statistics.wins++;
                break;
            case 'loss':
                this.session.statistics.losses++;
                break;
            case 'draw':
                this.session.statistics.draws++;
                break;
        }
        this.saveSession(this.session);
    }

    public updatePreferences(preferences: Partial<GameSession['preferences']>): void {
        this.session.preferences = {
            ...this.session.preferences,
            ...preferences
        };
        this.saveSession(this.session);
    }

    public getSession(): GameSession {
        return { ...this.session };
    }

    public clearSession(): void {
        localStorage.removeItem(SessionManager.SESSION_KEY);
        this.session = this.loadSession();
    }
} 