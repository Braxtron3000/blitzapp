"use client";

import Button from "@mui/material/Button";
import { signIn } from "next-auth/react";
import { Capacitor } from "@capacitor/core";
import { Browser } from "@capacitor/browser";
import { useEffect, useState } from "react";
import { Authenticator } from "authjs-capacitor-oauth-plugin";
import React from "react";
import { api } from "~/trpc/react";
import { type api as apiServer } from "~/trpc/server";
import { authConfig } from "~/server/auth/config";
import { Session } from "inspector/promises";
import { useRouter } from "next/navigation";
import { LocalNotifications } from "@capacitor/local-notifications";

// prisma import removed because it's not used in this component

const SigninButtons = () => {
  const platform = Capacitor.getPlatform();
  const [hello, setHello] = React.useState<string>("");

  const [newSession, setNewSession] = useState<{
    id: string;
    expires: Date;
    sessionToken: string;
    userId: string;
  } | null>(null);

  const router = useRouter();

  const updateLoginDB = api.auth.loginAndroid.useMutation({
    onSuccess: async (data) => {
      console.log("Login DB updated successfully");
      router.refresh();
    },
    onError: (error) => {
      console.error("Error updating Login DB:", error);
    },
  });

  const getExpirationDate = () => {
    const today = new Date();
    const futureDate = new Date(today);

    futureDate.setMonth(futureDate.getMonth() + 3);
    return futureDate;
  };

  return (
    <Button
      variant="contained"
      onClick={async () => {
        await Browser.open({
          url: "https://localhost:3000/api/auth/signin/google",
        });
        // const readSettingsResult = await Authenticator.readSettings();
        // console.log("Authenticator settings:", readSettingsResult);
        // if (!env.GOOGLE_CLIENT_ID) {
        //   console.error("No GOOGLE_CLIENT_ID env var set");
        //   return;
        // }
        // const something = await Authenticator.hello({
        //   value: "joe mama",
        // });
        // console.log("Authenticator response:", something);
        // if (!something.name || !something.providerAccountId) {
        //   console.error("no name or provideraccountid came back");
        //   return;
        // } else {
        //   updateLoginDB.mutate({
        //     email: something.email,
        //     expires: getExpirationDate(),
        //     image: something.image ?? null,
        //     name: something.name,
        //     provider: "google",
        //     providerAccountId: something.providerAccountId,
        //     token: something.token,
        //     type: something.type,
        //   });
        // }
        // try {
        //   console.log("checking permissions");
        //   const permissionStatus = await LocalNotifications.checkPermissions();
        //   console.log("checked permissions ", permissionStatus.display);
        //   if (permissionStatus.display !== "granted") {
        //     console.log("requesting permissions");
        //     await LocalNotifications.requestPermissions();
        //     console.log("requested permissions");
        //   }
        // } catch (e) {
        //   console.error("error with local notification: ", e);
        // }
        // const readSettingsResult2 = await Authenticator.readSettings();
        // console.log("Authenticator settings:", readSettingsResult2);
      }}
    >
      Sign In {hello}
    </Button>
  );
};

export default SigninButtons;
