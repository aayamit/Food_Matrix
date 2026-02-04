import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.foodmatrix.app',
  appName: 'Food Matrix',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    Geolocation: {
      permissionType: "location"
    }
  }
};

export default config;