class GestureRecognition {
    constructor(videoElement, canvasElement, onGestureDetected) {
        this.video = videoElement;
        this.canvas = canvasElement;
        this.context = canvasElement.getContext('2d');
        this.onGestureDetected = onGestureDetected;
        this.isRunning = false;
        this.lastGesture = null;
        this.gestureConfidence = 0;
        this.CONFIDENCE_THRESHOLD = 0.7; // 70% confidence required
        this.isTrainingMode = false;
        this.trainingGesture = null;
        this.trainingCallback = null;
    }

    async start() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    width: 640,
                    height: 480,
                    frameRate: { ideal: 30 }
                } 
            });
            this.video.srcObject = stream;
            await this.video.play();
            
            // Set canvas size to match video
            this.canvas.width = this.video.videoWidth;
            this.canvas.height = this.video.videoHeight;
            
            this.isRunning = true;
            this.detectGestures();
        } catch (error) {
            console.error('Error accessing webcam:', error);
            throw error;
        }
    }

    stop() {
        this.isRunning = false;
        if (this.video.srcObject) {
            this.video.srcObject.getTracks().forEach(track => track.stop());
        }
    }

    startTraining(gesture, callback) {
        this.isTrainingMode = true;
        this.trainingGesture = gesture;
        this.trainingCallback = callback;
        console.log(`Started training mode for gesture: ${gesture}`);
    }

    stopTraining() {
        this.isTrainingMode = false;
        this.trainingGesture = null;
        this.trainingCallback = null;
    }

    async detectGestures() {
        if (!this.isRunning) return;

        // Draw video frame to canvas
        this.context.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
        
        // Get canvas data as base64
        const imageData = this.canvas.toDataURL('image/jpeg', 0.5);

        try {
            // Send to gesture detection service
            const response = await fetch('http://localhost:5000/detect', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ image: imageData })
            });

            const result = await response.json();
            
            if (result.success) {
                // Update canvas with annotated image
                const img = new Image();
                img.onload = () => {
                    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
                    this.context.drawImage(img, 0, 0);
                };
                img.src = result.annotated_image;

                // Handle gesture detection
                if (result.hand_detected) {
                    if (this.isTrainingMode && this.trainingGesture) {
                        // Send training data
                        await fetch('http://localhost:5000/train', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                image: imageData,
                                gesture: this.trainingGesture
                            })
                        });
                        
                        if (this.trainingCallback) {
                            this.trainingCallback();
                        }
                    } else if (result.confidence >= this.CONFIDENCE_THRESHOLD) {
                        // Only trigger if confidence is high enough
                        if (result.gesture === this.lastGesture) {
                            this.gestureConfidence++;
                            if (this.gestureConfidence >= 3) {  // Need 3 consistent readings
                                this.onGestureDetected(result.gesture);
                                this.gestureConfidence = 0;
                            }
                        } else {
                            this.lastGesture = result.gesture;
                            this.gestureConfidence = 1;
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error detecting gesture:', error);
        }

        // Continue detection loop
        requestAnimationFrame(() => this.detectGestures());
    }

    // Add visual feedback
    showFeedback(message, isSuccess = true) {
        const overlay = document.createElement('div');
        overlay.style.position = 'absolute';
        overlay.style.top = '10px';
        overlay.style.left = '50%';
        overlay.style.transform = 'translateX(-50%)';
        overlay.style.padding = '10px 20px';
        overlay.style.borderRadius = '5px';
        overlay.style.backgroundColor = isSuccess ? 'rgba(0, 255, 0, 0.7)' : 'rgba(255, 0, 0, 0.7)';
        overlay.style.color = 'white';
        overlay.style.fontWeight = 'bold';
        overlay.textContent = message;
        
        this.canvas.parentElement.appendChild(overlay);
        setTimeout(() => overlay.remove(), 2000);
    }
} 