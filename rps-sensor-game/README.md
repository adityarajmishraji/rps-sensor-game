# Rock Paper Scissors - Hand Gesture Game

A modern, interactive Rock Paper Scissors game with hand gesture recognition and multiplayer functionality.

## 🎮 Features

- **Multiple Game Modes:**
  - Classic vs Computer
  - Local Multiplayer (2 players on same device)
  - Hand Gesture Recognition (with camera)

- **Interactive Design:**
  - Responsive design for all devices
  - Smooth animations and transitions
  - Real-time score tracking
  - Visual feedback for winners

- **Advanced Functionality:**
  - Camera-based gesture detection
  - Multiplayer room system
  - Mobile-friendly interface

## 🚀 Quick Start

1. Clone or download this repository
2. Open `index.html` in your web browser
3. Start playing immediately!

## 📁 Project Structure

```
rps-sensor-game/
├── index.html          # Main game file
├── README.md          # This file
├── .gitignore         # Git ignore rules
├── style/
│   └── main.css       # Separate CSS (optional)
├── scripts/
│   ├── game.js        # Game logic (optional)
│   └── gesture.js     # Gesture recognition (optional)
└── assets/
    ├── icons/         # Game icons
    └── sounds/        # Sound effects
```

## 🛠️ Development Phases

### Phase 1: Basic Game (Week 1)
- [x] HTML structure
- [x] CSS styling and responsive design
- [x] Basic game logic (vs Computer)
- [x] Score tracking
- [x] Winner determination

### Phase 2: Enhanced Features (Week 2)
- [x] Local multiplayer mode
- [x] Improved UI/UX
- [x] Animations and transitions
- [ ] Sound effects
- [ ] Game statistics

### Phase 3: Advanced Features (Week 3-4)
- [x] Camera integration
- [ ] Real gesture recognition (TensorFlow.js/MediaPipe)
- [ ] Online multiplayer with WebSockets
- [ ] Tournament mode
- [ ] Achievement system

## 🎯 Gesture Recognition Implementation

The current version includes a simplified gesture detection system. For production:

### Option 1: MediaPipe (Recommended)
```javascript
// Install: npm install @mediapipe/hands
import {Hands} from '@mediapipe/hands';
import {Camera} from '@mediapipe/camera_utils';
```

### Option 2: TensorFlow.js
```javascript
// Install: npm install @tensorflow/tfjs
import * as tf from '@tensorflow/tfjs';
```

### Option 3: Custom ML Model
Train your own model using:
- Google's Teachable Machine
- Custom TensorFlow model
- OpenCV.js for computer vision

## 🌐 Deployment

### Netlify (Recommended)
1. Push code to GitHub
2. Connect GitHub to Netlify
3. Deploy automatically on push

### Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in project directory
3. Follow deployment prompts

### GitHub Pages
1. Push to GitHub repository
2. Enable GitHub Pages in repository settings
3. Select main branch as source

## 📱 Browser Compatibility

- **Chrome**: Full support
- **Firefox**: Full support  
- **Safari**: Full support (iOS 11+)
- **Edge**: Full support

**Camera Requirements:**
- HTTPS connection (for production)
- Camera permission granted
- Modern browser with MediaDevices API

## 🔧 Advanced Configuration

### Adding Real Gesture Recognition

1. **Install dependencies:**
```bash
npm install @mediapipe/hands @mediapipe/camera_utils
```

2. **Replace gesture detection code:**
```javascript
const hands = new Hands({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
});

hands.setOptions({
  maxNumHands: 1,
  modelComplexity: 1,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});
```

### Adding Real-time Multiplayer

1. **Backend (Node.js + Socket.io):**
```javascript
const io = require('socket.io')(server);
// Handle room creation, joining, and game state sync
```

2. **Frontend integration:**
```javascript
const socket = io();
// Connect to multiplayer server
```

## 🎨 Customization

### Themes
Modify CSS variables in `:root` to change colors:
```css
:root {
  --primary-color: #667eea;
  --secondary-color: #764ba2;
  --accent-color: #4CAF50;
}
```

### Sounds
Add sound effects by placing audio files in `/assets/sounds/`:
```javascript
const winSound = new Audio('./assets/sounds/win.mp3');
const loseSound = new Audio('./assets/sounds/lose.mp3');
```

## 📊 Performance Optimization

- Lazy load camera only when needed
- Optimize gesture detection frequency
- Use Web Workers for heavy computations
- Implement efficient state management

## 🐛 Known Issues

1. **Gesture Detection**: Currently simulated - needs real ML implementation
2. **Multiplayer**: Local only - requires WebSocket server for online play
3. **Mobile Safari**: Some CSS animations may be reduced

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🆘 Support

If you encounter any issues:
1. Check browser console for errors
2. Ensure camera permissions are granted
3. Try different browsers
4. Open an issue on GitHub

## 🎯 Future Enhancements

- [ ] AI difficulty levels
- [ ] Tournament brackets
- [ ] Voice commands
- [ ] AR/VR integration
- [ ] Statistics dashboard
- [ ] Social sharing
- [ ] Custom gestures training

---

**Happy Gaming! 🎮**