export class GestureControl {
    constructor(gameInstance) {
        this.gameInstance = gameInstance;
        this.cameraActive = false;
        this.choices = ['rock', 'paper', 'scissors'];
    }

    async initializeCamera() {
        try {
            console.log('Camera initialization ready');
        } catch (error) {
            console.error('Camera initialization failed:', error);
        }
    }

    async startCamera() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { width: 300, height: 225 } 
            });

            const video = document.getElementById('videoElement');
            video.srcObject = stream;

            this.cameraActive = true;
            document.getElementById('startCamera').disabled = true;
            document.getElementById('stopCamera').disabled = false;
            document.getElementById('gestureStatus').textContent = 'Camera active - Show your gesture!';

            this.startGestureDetection();
        } catch (error) {
            console.error('Error accessing camera:', error);
            document.getElementById('gestureStatus').textContent = 'Camera access denied';
        }
    }

    stopCamera() {
        const video = document.getElementById('videoElement');
        if (video.srcObject) {
            video.srcObject.getTracks().forEach(track => track.stop());
            video.srcObject = null;
        }

        this.cameraActive = false;
        document.getElementById('startCamera').disabled = false;
        document.getElementById('stopCamera').disabled = true;
        document.getElementById('gestureStatus').textContent = 'Camera stopped';
    }

    startGestureDetection() {
        if (!this.cameraActive) return;

        const detectGesture = () => {
            if (!this.cameraActive) return;

            setTimeout(() => {
                if (this.cameraActive && !this.gameInstance.gameState.player1Choice) {
                    const randomChoice = this.choices[Math.floor(Math.random() * 3)];
                    document.getElementById('gestureStatus').textContent = `Detected: ${randomChoice}`;
                    this.gameInstance.makeChoice(randomChoice, '1');
                }
                detectGesture();
            }, Math.random() * 2000 + 3000); // 3-5 seconds
        };

        detectGesture();
    }
}
