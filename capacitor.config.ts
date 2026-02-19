import type { CapacitorConfig } from "@capacitor/cli";
import { env } from "~/env";

const config: CapacitorConfig = {
  appId: "com.milomode.app",
  appName: "milomode",
  webDir: ".next",
  server: {
    url: "https://localhost:3000", //env.NEXTAUTH_URL, //build wont change unless the actual ass    igned var changes not just the assigned var's value.
  },
  plugins: {
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#488AFF",
      sound: "beep.wav",
    },
  },
};

export default config;
