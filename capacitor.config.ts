import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.MiloMode.app",
  appName: "MiloMode",
  webDir: ".next",
  server: {
    url: process.env.PRIVATEIP,
  },
};

export default config;
