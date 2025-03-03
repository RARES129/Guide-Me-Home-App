import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.example.guidemehome",
  appName: "guide-me-home",
  webDir: "build",
  android: {
    allowMixedContent: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
    },
    "PushNotifications": {
      presentationOptions: ["badge", "sound", "alert"],
    },
  },
};

export default config;
