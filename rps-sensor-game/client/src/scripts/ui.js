class GameUI {
    constructor() {
        this.setupAnimations();
        this.setupSoundEffects();
    }

    setupAnimations() {
        // Add animation classes to elements that need them
        document.querySelectorAll('.choice-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                btn.classList.add('clicked');
                setTimeout(() => btn.classList.remove('clicked'), 200);
            });
        });

        // Add hover effects
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                if (!btn.classList.contains('active')) {
                    btn.style.transform = 'scale(1.1)';
                }
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'scale(1)';
            });
        });
    }

    setupSoundEffects() {
        // Preload sound effects
        const sounds = {};
        Object.entries(CONFIG.sounds).forEach(([key, path]) => {
            sounds[key] = new Audio(path);
            sounds[key].load();
        });

        // Add click sound to buttons
        document.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', () => {
                const clickSound = new Audio('assets/sounds/click.mp3');
                clickSound.volume = 0.5;
                clickSound.play().catch(console.error);
            });
        });
    }

    static showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        // Trigger animation
        requestAnimationFrame(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateY(0)';
        });

        // Remove after animation
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(-100%)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    static addConfetti() {
        const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'];
        const numConfetti = 100;

        for (let i = 0; i < numConfetti; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
            confetti.style.opacity = Math.random();
            document.body.appendChild(confetti);

            // Remove after animation
            setTimeout(() => confetti.remove(), 5000);
        }
    }

    static showLoadingSpinner(show = true) {
        let spinner = document.querySelector('.loading-spinner');
        
        if (show && !spinner) {
            spinner = document.createElement('div');
            spinner.className = 'loading-spinner';
            spinner.innerHTML = `
                <div class="spinner"></div>
                <div class="loading-text">Loading...</div>
            `;
            document.body.appendChild(spinner);
        } else if (!show && spinner) {
            spinner.remove();
        }
    }

    static updateTheme(theme = 'default') {
        const root = document.documentElement;
        const themes = {
            default: {
                primary: '#667eea',
                secondary: '#764ba2',
                accent: '#4CAF50'
            },
            dark: {
                primary: '#2d3748',
                secondary: '#4a5568',
                accent: '#48bb78'
            },
            light: {
                primary: '#edf2f7',
                secondary: '#cbd5e0',
                accent: '#38b2ac'
            }
        };

        const colors = themes[theme] || themes.default;
        
        root.style.setProperty('--primary-color', colors.primary);
        root.style.setProperty('--secondary-color', colors.secondary);
        root.style.setProperty('--accent-color', colors.accent);
    }

    static addParticleEffect(x, y) {
        const particles = 10;
        const colors = ['#ff0000', '#00ff00', '#0000ff'];

        for (let i = 0; i < particles; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            particle.style.left = x + 'px';
            particle.style.top = y + 'px';

            const angle = (Math.PI * 2 * i) / particles;
            const velocity = 5;
            const vx = Math.cos(angle) * velocity;
            const vy = Math.sin(angle) * velocity;

            document.body.appendChild(particle);

            let posX = x;
            let posY = y;
            let opacity = 1;
            let scale = 1;

            function animate() {
                if (opacity <= 0) {
                    particle.remove();
                    return;
                }

                posX += vx;
                posY += vy;
                opacity -= 0.02;
                scale -= 0.02;

                particle.style.left = posX + 'px';
                particle.style.top = posY + 'px';
                particle.style.opacity = opacity;
                particle.style.transform = `scale(${scale})`;

                requestAnimationFrame(animate);
            }

            requestAnimationFrame(animate);
        }
    }
}

// Initialize UI when document is ready
document.addEventListener('DOMContentLoaded', () => {
    window.gameUI = new GameUI();

    // Add necessary styles
    const style = document.createElement('style');
    style.textContent = `
        .toast {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 10px 20px;
            border-radius: 5px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            opacity: 0;
            transform: translateY(-100%);
            transition: all 0.3s ease;
            z-index: 1000;
        }

        .loading-spinner {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        }

        .spinner {
            width: 50px;
            height: 50px;
            border: 5px solid #f3f3f3;
            border-top: 5px solid var(--accent-color);
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }

        .loading-text {
            color: white;
            margin-top: 10px;
        }

        .particle {
            position: fixed;
            width: 10px;
            height: 10px;
            border-radius: 50%;
            pointer-events: none;
        }

        .confetti {
            position: fixed;
            width: 10px;
            height: 10px;
            animation: fall linear forwards;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        @keyframes fall {
            0% { transform: translateY(-100vh) rotate(0deg); }
            100% { transform: translateY(100vh) rotate(720deg); }
        }

        .clicked {
            animation: click 0.2s ease;
        }

        @keyframes click {
            0% { transform: scale(1); }
            50% { transform: scale(0.9); }
            100% { transform: scale(1); }
        }
    `;
    document.head.appendChild(style);
}); 