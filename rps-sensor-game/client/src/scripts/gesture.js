class GestureDetector {
    constructor() {
        this.videoElement = document.getElementById('camera-feed');
        this.canvasElement = document.getElementById('gesture-canvas');
        this.canvasCtx = this.canvasElement.getContext('2d');
        this.hands = null;
        this.camera = null;
        this.isRunning = false;
        this.lastGesture = null;
        this.gestureConfidence = CONFIG.gestureConfidence;
        
        this.setupMediaPipe();
    }

    async setupMediaPipe() {
        this.hands = new Hands({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
        });

        this.hands.setOptions({
            maxNumHands: CONFIG.gesture.maxNumHands,
            modelComplexity: CONFIG.gesture.modelComplexity,
            minDetectionConfidence: CONFIG.gesture.minDetectionConfidence,
            minTrackingConfidence: CONFIG.gesture.minTrackingConfidence
        });

        this.hands.onResults(this.onResults.bind(this));
    }

    async start() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: 640,
                    height: 480,
                    facingMode: 'user'
                }
            });

            this.videoElement.srcObject = stream;
            this.videoElement.play();

            this.camera = new Camera(this.videoElement, {
                onFrame: async () => {
                    if (this.isRunning) {
                        await this.hands.send({ image: this.videoElement });
                    }
                },
                width: 640,
                height: 480
            });

            this.camera.start();
            this.isRunning = true;
        } catch (error) {
            console.error('Error starting camera:', error);
            alert('Unable to access camera. Please check permissions and try again.');
        }
    }

    stop() {
        if (this.camera) {
            this.camera.stop();
        }
        if (this.videoElement.srcObject) {
            this.videoElement.srcObject.getTracks().forEach(track => track.stop());
        }
        this.isRunning = false;
        this.lastGesture = null;
    }

    onResults(results) {
        // Clear canvas
        this.canvasCtx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
        this.canvasCtx.drawImage(results.image, 0, 0, this.canvasElement.width, this.canvasElement.height);

        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            const landmarks = results.multiHandLandmarks[0];
            this.drawHand(landmarks);
            const gesture = this.recognizeGesture(landmarks);
            
            if (gesture && gesture !== this.lastGesture) {
                this.lastGesture = gesture;
                // Play gesture sound
                const sound = new Audio('assets/sounds/gesture.wav');
                sound.volume = 0.3;
                sound.play().catch(console.error);
                if (window.game) {
                    window.game.makeChoice(gesture);
                }
            }
        }
    }

    drawHand(landmarks) {
        // Draw hand landmarks
        this.canvasCtx.fillStyle = '#00FF00';
        for (const landmark of landmarks) {
            const x = landmark.x * this.canvasElement.width;
            const y = landmark.y * this.canvasElement.height;
            
            this.canvasCtx.beginPath();
            this.canvasCtx.arc(x, y, 5, 0, 2 * Math.PI);
            this.canvasCtx.fill();
        }

        // Draw connections
        this.canvasCtx.strokeStyle = '#00FF00';
        this.canvasCtx.lineWidth = 2;
        this.drawConnections(landmarks);
    }

    drawConnections(landmarks) {
        // Define hand connections
        const connections = [
            [0, 1], [1, 2], [2, 3], [3, 4], // thumb
            [0, 5], [5, 6], [6, 7], [7, 8], // index
            [0, 9], [9, 10], [10, 11], [11, 12], // middle
            [0, 13], [13, 14], [14, 15], [15, 16], // ring
            [0, 17], [17, 18], [18, 19], [19, 20] // pinky
        ];

        for (const [i, j] of connections) {
            const start = landmarks[i];
            const end = landmarks[j];
            
            this.canvasCtx.beginPath();
            this.canvasCtx.moveTo(
                start.x * this.canvasElement.width,
                start.y * this.canvasElement.height
            );
            this.canvasCtx.lineTo(
                end.x * this.canvasElement.width,
                end.y * this.canvasElement.height
            );
            this.canvasCtx.stroke();
        }
    }

    recognizeGesture(landmarks) {
        // Calculate finger states (extended or not)
        const fingerStates = this.getFingerStates(landmarks);
        
        // Recognize gestures based on finger states
        if (fingerStates.every(state => !state)) {
            return 'rock'; // All fingers closed
        } else if (fingerStates.every(state => state)) {
            return 'paper'; // All fingers extended
        } else if (!fingerStates[0] && !fingerStates[1] && !fingerStates[2] && 
                   fingerStates[3] && fingerStates[4]) {
            return 'scissors'; // Only index and middle fingers extended
        }
        
        return null;
    }

    getFingerStates(landmarks) {
        // Define finger tip and base indices
        const fingerIndices = [
            [4, 2],   // thumb
            [8, 5],   // index
            [12, 9],  // middle
            [16, 13], // ring
            [20, 17]  // pinky
        ];

        return fingerIndices.map(([tipIdx, baseIdx]) => {
            const tip = landmarks[tipIdx];
            const base = landmarks[baseIdx];
            
            // Consider a finger extended if its tip is higher than its base
            return tip.y < base.y;
        });
    }
}

// Initialize gesture detector when document is ready
document.addEventListener('DOMContentLoaded', () => {
    window.gestureDetector = new GestureDetector();
}); 