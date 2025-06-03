@echo off
echo Starting RPS Game Services...

:: Start Python Gesture Service
cd gesture_service
start cmd /k "python -m venv venv && venv\Scripts\activate && pip install -r requirements.txt && python gesture_detector.py"

:: Start Node.js Server
cd ..
start cmd /k "npm install && npm run dev"

echo Services started! Open http://localhost:3000 in your browser. 