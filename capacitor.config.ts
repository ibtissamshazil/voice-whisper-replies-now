
import { CapacitorConfig } from '@capacitor/core';

const config: CapacitorConfig = {
  appId: 'app.lovable.42c928b7e7f7490794e29201682f8b7d',
  appName: 'voice-whisper-replies-now',
  webDir: 'dist',
  server: {
    url: 'https://42c928b7-e7f7-4907-94e2-9201682f8b7d.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#3b82f6'
    }
  }
};

export default config;
