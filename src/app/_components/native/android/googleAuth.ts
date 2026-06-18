import { registerPlugin } from "@capacitor/core";

export interface GooglePlugin {
  hello(): Promise<{
    email: string;
    token: string;
    name: string | null;
    image: string | null;
  }>;
}

const GoogleAuth = registerPlugin<GooglePlugin>("Authenticator");

export default GoogleAuth;
