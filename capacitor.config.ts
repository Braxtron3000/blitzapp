import type { CapacitorConfig } from "@capacitor/cli";
// import { env } from "~/env";

const config: CapacitorConfig = {
  appId: "com.MiloMode.app",
  appName: "MiloMode",
  // webDir: ".next",
  // webDir: "public",
  server: {
    url: "http://localhost:3000", //process.env.NEXTAUTH_URL, //build wont change unless the actual ass    igned var changes not just the assigned var's value.
    cleartext: true, //!fix this before pushing to prod
  },
  cordova: {
    preferences: {
      URL_SCHEME: "MiloMode",
      ANDROID_SCHEME: "MiloMode",
      DEEPLINK_SCHEME: "MiloMode",
      DEEPLINK_HOST: "",
    },
  },
};

export default config;
