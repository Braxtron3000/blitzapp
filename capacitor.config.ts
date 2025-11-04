import type { CapacitorConfig } from "@capacitor/cli";
import { env } from "~/env";

const config: CapacitorConfig = {
  appId: "com.milomode.app",
  appName: "milomode",
  webDir: ".next",
  server: {
    url: "https://localhost:3000", //env.NEXTAUTH_URL, //build wont change unless the actual ass    igned var changes not just the assigned var's value.
  },
};

export default config;
