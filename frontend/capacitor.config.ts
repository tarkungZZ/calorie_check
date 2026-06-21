import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.caloriecheck.app",
  appName: "Calorie Check",
  webDir: "out",
  server: {
    androidScheme: "https",
    iosScheme: "https",
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 2000,
      backgroundColor: "#f97316",
      showSpinner: true,
      spinnerColor: "#ffffff",
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#f97316",
    },
    Camera: {
      promptLabelHeader: "เลือกรูปภาพ",
      promptLabelPhoto: "จากอัลบั้ม",
      promptLabelPicture: "ถ่ายรูป",
    },
  },
};

export default config;
