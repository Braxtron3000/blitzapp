"use client";

import Button from "@mui/material/Button";
import { signIn } from "next-auth/react";
import { Capacitor } from "@capacitor/core";
import { Browser } from "@capacitor/browser";
import { useEffect } from "react";
import { Authenticator } from "authjs-capacitor-oauth-plugin";
import React from "react";

const SigninButtons = () => {
  const platform = Capacitor.getPlatform();
  const [hello, setHello] = React.useState<string>("");

  return (
    <Button
      variant="contained"
      onClick={async () => {
        const something = await Authenticator.hello({ value: "fuck you" });
        console.log("Authenticator response:", something);
        setHello(something.value);
      }}
    >
      Sign In {hello}
    </Button>
  );
};

export default SigninButtons;
