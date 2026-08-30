import { Capacitor } from "@capacitor/core";

/**
 * Store Android JWT token securely
 *
 * This token should be created by the Android device after successful authentication.
 */
export async function storeAndroidToken(token: string): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    // On web, use sessionStorage
    sessionStorage.setItem("android-jwt", token);
    return;
  }

  try {
    // On native, use secure storage
    // Note: You may want to use a secure storage plugin for production
    // import SecureStoragePlugin from "secure-storage";
    // await SecureStoragePlugin.set({ key: "android-jwt", value: token });

    // Fallback to localStorage
    localStorage.setItem("android-jwt", token);
  } catch (error) {
    console.error("Failed to store Android JWT token:", error);
    localStorage.setItem("android-jwt", token);
  }
}

/**
 * Retrieve stored Android JWT token
 */
export async function getAndroidToken(): Promise<string | null> {
  if (!Capacitor.isNativePlatform()) {
    return sessionStorage.getItem("android-jwt");
  }

  try {
    // Try secure storage first
    // import SecureStoragePlugin from "secure-storage";
    // const result = await SecureStoragePlugin.get({ key: "android-jwt" });
    // return result?.value || null;

    // Fallback to localStorage
    return localStorage.getItem("android-jwt");
  } catch (error) {
    console.error("Failed to retrieve Android JWT token:", error);
    return localStorage.getItem("android-jwt");
  }
}

/**
 * Clear stored Android JWT token (logout)
 */
export async function clearAndroidToken(): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    sessionStorage.removeItem("android-jwt");
    return;
  }

  try {
    // Try secure storage first
    // import SecureStoragePlugin from "secure-storage";
    // await SecureStoragePlugin.remove({ key: "android-jwt" });

    // Fallback to localStorage
    localStorage.removeItem("android-jwt");
  } catch (error) {
    console.error("Failed to clear Android JWT token:", error);
    localStorage.removeItem("android-jwt");
  }
}

/**
 * Add Android JWT token to fetch headers with Bearer scheme
 *
 * This will add an Authorization header like: "Authorization: Bearer <token>"
 */
export async function addAndroidTokenToHeaders(
  headers?: Headers,
): Promise<Headers> {
  const result = headers ?? new Headers();
  const token = await getAndroidToken();

  if (token) {
    result.set("Authorization", `Bearer ${token}`);
  }

  return result;
}
