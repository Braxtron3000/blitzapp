"use client";

import Button from "@mui/material/Button";
import { signIn } from "next-auth/react";
import { Capacitor } from "@capacitor/core";
import { Browser } from "@capacitor/browser";
import { useEffect } from "react";

const SigninButtons = () => {
  const platform = Capacitor.getPlatform();

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("Service Worker registered:", registration);
          })
          .catch((error) => {
            console.error("Service Worker registration failed:", error);
          });
      });
    }
  }, []);

  async function showNotification() {
    // await navigator.serviceWorker.register("sw.js");
    console.log("Requesting notification permission...");
    Notification.requestPermission()
      .then((result) => {
        console.log("Notification permission result:", result);
        if (result === "granted") {
          navigator.serviceWorker.ready
            .then((registration) => {
              registration
                .showNotification("Vibration Sample", {
                  body: "Buzz! Buzz!",
                  icon: "../images/touch/chrome-touch-icon-192x192.png",
                  // vibrate: [200, 100, 200, 100, 200, 100, 200],
                  tag: "vibration-sample",
                })
                .catch((error) => {
                  console.error("Error showing notification:", error);
                });
            })
            .catch((error) => {
              console.error("Service Worker registration error:", error);
            });
        }
      })
      .catch((error) => {
        console.error("Error requesting notification permission:", error);
      });
  }

  return (
    <Button
      variant="contained"
      onClick={async () => {
        // try {
        //   await Browser.open({
        //     url: "https://localhost:3000/api/auth/signin/google", //!DONT COMMIT THIS URL
        //   });
        // } catch (error) {
        //   console.error("Error opening browser:", error);
        // }

        // await signIn("google", {
        //   callbackUrl: "com.milomode.app://",
        //   // redirectTo: "com.milomode.app://",
        //   // redirect: true,

        // });
        console.log("Showing notification...");
        await showNotification();

        // try {
        //   console.log("Requesting notification permission...");
        //   const permission = await Notification.requestPermission();
        //   console.log("Notification permission status:", permission);
        // } catch (error) {
        //   console.error("Error requesting notification permission:", error);
        // }

        // if (!("Notification" in window)) {
        //   console.log("This browser does not support notifications.");
        //   return;
        // }

        // try {
        // } catch (error) {
        //   console.error("Error requesting notification permission:", error);
        // }
      }}
    >
      Sign In
    </Button>
  );
};

export default SigninButtons;
