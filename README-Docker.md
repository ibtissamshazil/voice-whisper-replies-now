
# Docker Setup for WhatsApp Voice Overlay App

## Quick Start

### Option 1: Using Docker Compose (Recommended)
```bash
# For production
docker-compose up -d

# For development
docker-compose -f docker-compose.dev.yml up -d
```

### Option 2: Using Docker directly
```bash
# Make the script executable
chmod +x docker-run.sh

# Run the script
./docker-run.sh
```

### Option 3: Manual Docker commands
```bash
# Build the image
docker build -t whatsapp-voice-app .

# Run the container
docker run -d -p 8080:8080 --name whatsapp-voice-app whatsapp-voice-app
```

## Access the App
- Production: http://localhost:8080
- With Nginx proxy: http://localhost

## Management Commands

### Stop the application
```bash
docker-compose down
# OR
docker stop whatsapp-voice-app
```

### View logs
```bash
docker-compose logs -f
# OR
docker logs -f whatsapp-voice-app
```

### Rebuild after changes
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## Environment Variables
Create a `.env` file for environment-specific configurations:
```
NODE_ENV=production
PORT=8080
```

## Notes
- The app runs on port 8080 inside the container
- For mobile app development, use the Capacitor setup instead
- For production deployment, consider using the nginx proxy configuration
