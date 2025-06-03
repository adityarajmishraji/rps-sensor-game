# Rock Paper Scissors - Hand Gesture Game

A modern, interactive Rock Paper Scissors game with real-time hand gesture recognition and multiplayer functionality.

## 🚀 Features

- **Multiple Game Modes**
  - Single Player vs Computer
  - Local Multiplayer (2 players)
  - Online Multiplayer (2-6 players)
  - Hand Gesture Recognition Mode

- **Security Features**
  - JWT-based authentication
  - Rate limiting and DDoS protection
  - Secure WebSocket connections
  - Input validation and sanitization
  - CSRF protection
  - Secure session management

- **Real-time Features**
  - Live hand gesture recognition
  - Real-time multiplayer gameplay
  - Instant game state updates
  - Live leaderboard updates

## 🛠️ Tech Stack

- **Frontend**
  - HTML5/CSS3/JavaScript
  - Socket.IO Client
  - TensorFlow.js for gesture recognition
  - MediaPipe for hand tracking

- **Backend**
  - Node.js/Express
  - Python (Gesture Service)
  - Socket.IO
  - JWT for authentication

- **AI/ML**
  - TensorFlow/MediaPipe
  - Custom gesture recognition model
  - Real-time hand tracking

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/rps-sensor-game.git
   cd rps-sensor-game
   ```

2. **Install dependencies**
   ```bash
   # Install Node.js dependencies
   npm install

   # Install Python dependencies
   cd gesture_service
   pip install -r requirements.txt
   cd ..
   ```

3. **Environment Setup**
   ```bash
   # Copy example environment file
   cp .env.example .env
   # Edit .env with your configurations
   ```

4. **Development Certificates** (for HTTPS)
   ```bash
   # Generate development certificates
   openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
     -keyout dev-private.key -out dev-certificate.crt
   ```

## 🚀 Running the Application

1. **Start the Node.js server**
   ```bash
   npm run dev
   ```

2. **Start the Gesture Service**
   ```bash
   cd gesture_service
   python app.py
   ```

3. Open `https://localhost:3000` in your browser

## 🔒 Security Configuration

1. **SSL/TLS Setup**
   - Generate production certificates
   - Configure HTTPS
   - Set up HSTS

2. **Environment Variables**
   - Set secure secrets
   - Configure rate limits
   - Set up CORS policies

## 📝 API Documentation

- **Authentication Endpoints**
  - POST `/auth/signup`
  - POST `/auth/login`
  - POST `/auth/logout`

- **Game Endpoints**
  - GET `/api/rooms`
  - POST `/api/rooms/create`
  - POST `/api/game/move`

## 🌐 Deployment

### Vercel Deployment
1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

### Netlify Deployment
1. Add `netlify.toml`:
   ```toml
   [build]
     command = "npm run build"
     publish = "build"
   ```

2. Deploy via Netlify CLI or GitHub integration

### Render Deployment
1. Connect GitHub repository
2. Configure build settings:
   - Build Command: `npm run build`
   - Start Command: `npm start`

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔐 Security

Report security vulnerabilities to [security@yourdomain.com]

## 👥 Authors

- Your Name - Initial work - [YourGitHub](https://github.com/yourusername)

## 🙏 Acknowledgments

- MediaPipe team for hand tracking
- TensorFlow.js community
- Socket.IO team