# Rock Paper Scissors with Gesture Recognition

A modern, interactive Rock Paper Scissors game featuring real-time gesture recognition, multiplayer support, and an engaging user interface.

## Features

### Core Gameplay
- Single-player mode against computer AI
- Real-time gesture recognition using webcam
- Multiplayer mode with room-based matchmaking
- Spectator mode for watching live games
- Session-based game history and statistics

### Gesture Recognition
- Advanced hand landmark detection using MediaPipe
- High-accuracy gesture classification with confidence scoring
- Real-time hand tracking and position analysis
- Support for different hand orientations and positions

### Multiplayer Features
- Real-time multiplayer matches
- Room creation and joining functionality
- In-game chat system
- Live spectator mode
- Player statistics tracking
- Room management with spectator support

### User Interface
- Modern, responsive design
- Smooth animations and transitions
- Dark mode support
- Real-time game state updates
- Toast notifications for game events
- Mobile-friendly layout

## Technical Stack

### Frontend
- HTML5/CSS3 for structure and styling
- JavaScript (ES6+) for game logic
- Socket.IO client for real-time communication
- MediaPipe for hand tracking
- Modern CSS animations and transitions

### Backend
- Node.js with Express for the game server
- Flask for the gesture recognition service
- Socket.IO for real-time bidirectional communication
- MediaPipe Hands for gesture processing
- Winston for logging

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- Python 3.8+ with pip
- Webcam for gesture recognition
- Modern web browser (Chrome/Firefox recommended)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/rps-sensor-game.git
cd rps-sensor-game
```

2. Install Node.js dependencies:
```bash
npm install
```

3. Install Python dependencies:
```bash
cd gesture_service
pip install -r requirements.txt
cd ..
```

4. Start the servers:

For Windows PowerShell:
```powershell
powershell -ExecutionPolicy Bypass -File start.ps1
```

For Unix/Linux:
```bash
./start.sh
```

Or manually start each service:
```bash
# Terminal 1 - Start Node.js server
npm run dev

# Terminal 2 - Start gesture service
cd gesture_service
python app.py
```

5. Access the game:
Open your browser and navigate to `http://localhost:3000`

## Configuration

### Environment Variables
- `PORT`: Node.js server port (default: 3000)
- `GESTURE_SERVICE_PORT`: Flask server port (default: 5000)
- `NODE_ENV`: Environment mode (development/production)

### Gesture Recognition Settings
- `MIN_DETECTION_CONFIDENCE`: Minimum confidence for hand detection (default: 0.7)
- `MIN_TRACKING_CONFIDENCE`: Minimum confidence for hand tracking (default: 0.7)

## Development

### Project Structure
```
rps-sensor-game/
├── client/
│   ├── src/
│   │   ├── scripts/
│   │   │   ├── game.js
│   │   │   └── multiplayer.js
│   │   └── styles/
│   │       └── main.css
├── gesture_service/
│   ├── app.py
│   └── enhanced_gesture_detector.py
├── server/
│   └── server.js
└── start.ps1/start.sh
```

### Key Components
- `game.js`: Core game logic and UI management
- `multiplayer.js`: Multiplayer functionality and Socket.IO integration
- `app.py`: Gesture recognition service
- `server.js`: Game server and room management

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments
- MediaPipe for hand tracking technology
- Socket.IO for real-time communication
- The open-source community for various tools and libraries

## Troubleshooting

### Common Issues

1. Gesture Recognition Not Working
- Ensure webcam permissions are granted
- Check if gesture service is running on port 5000
- Verify Python dependencies are installed correctly

2. Multiplayer Connection Issues
- Confirm both server and client are running
- Check network firewall settings
- Verify Socket.IO connection in browser console

3. Performance Issues
- Ensure proper lighting for gesture recognition
- Close other resource-intensive applications
- Check browser console for errors

### Support

For issues and feature requests, please use the GitHub issue tracker or contact the development team.