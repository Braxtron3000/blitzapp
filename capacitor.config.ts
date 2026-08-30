import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.milomode.app",
  appName: "milomode",
  webDir: "out",
  server: {
    url: "http://localhost:3000",
    cleartext: true,
  },

  plugins: {
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#488AFF",
      sound: "beep.wav",
    },
  },
};

// server: {
//set server undefined to get Platform.os==='android' working statically.
// url: "https://localhost:3000", //env.NEXTAUTH_URL, //build wont change unless the actual ass    igned var changes not just the assigned var's value.
// url: "https://blitzapp-zeta.vercel.app/",
// },

export default config;
