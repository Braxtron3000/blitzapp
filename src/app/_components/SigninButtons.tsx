"use client";
import { Capacitor } from "@capacitor/core";
import { useEffect } from "react";
import { Authenticator } from "authjs-capacitor-oauth-plugin";
import React from "react";
import Button from "@mui/material/Button";
import GoogleAuth from "./native/android/googleAuth";

export const SigninButtons = () => {
  const [hello, setHello] = React.useState<string>("");
  return (
    <Button
      variant="contained"
      onClick={async () => {
        // const something = await Authenticator.hello({ value: "fuck you" });
        // console.log("Authenticator response:", something);
        // setHello(something.value);

        const ba = await GoogleAuth.hello();
        console.log("GoogleAuth response:", ba);
      }}
    >
      Sign In {hello}
    </Button>
  );
};
