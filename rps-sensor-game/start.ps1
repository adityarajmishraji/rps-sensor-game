# Install dependencies if needed
Write-Host "Installing Node.js dependencies..."
npm install

# Install Python dependencies
Write-Host "Installing Python dependencies..."
Set-Location gesture_service
pip install -r requirements.txt
Set-Location ..

# Start the gesture service in a new window
Write-Host "Starting gesture recognition service..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd gesture_service; python app.py"

# Start the Node.js server
Write-Host "Starting Node.js server..."
npm run dev 