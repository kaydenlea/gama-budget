import type { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
  name: "Gama",
  slug: "gama-mobile",
  scheme: "gama",
  version: "0.1.0",
  orientation: "portrait",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  plugins: ["expo-router", "expo-secure-store", "sentry-expo"],
  experiments: {
    typedRoutes: true
  },
  splash: {
    resizeMode: "contain",
    backgroundColor: "#081512"
  },
  ios: {
    supportsTablet: false,
    bundleIdentifier: "com.gama.mobile"
  },
  android: {
    package: "com.gama.mobile"
  },
  web: {
    bundler: "metro"
  }
};

export default config;
