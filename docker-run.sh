
#!/bin/bash

# Build and run the Docker container
echo "Building WhatsApp Voice Overlay App..."
docker build -t whatsapp-voice-app .

echo "Running the container..."
docker run -d \
  --name whatsapp-voice-app \
  -p 8080:8080 \
  whatsapp-voice-app

echo "App is running at http://localhost:8080"
echo "To stop: docker stop whatsapp-voice-app"
echo "To remove: docker rm whatsapp-voice-app"
