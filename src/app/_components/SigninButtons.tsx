"use client";
import { Capacitor } from "@capacitor/core";
import { useEffect, useRef } from "react";
import React from "react";
import Button from "@mui/material/Button";
import GoogleAuth from "./native/android/googleAuth";

export const SigninButtons = () => {
  const firstRender = useRef(true);

  if (firstRender.current) {
    const boo = GoogleAuth.hello()
      .then((ba) => {
        console.log("GoogleAuth response:", ba);
      })
      .catch((err) => {
        console.error("GoogleAuth error:", err);
      });

    console.log("GoogleAuth promise:", boo);
  }

  firstRender.current = false;

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
      Sign In {hello} {Capacitor.getPlatform()}{" "}
      {Capacitor.isNativePlatform() ? "native" : "web"}
    </Button>
  );
};
