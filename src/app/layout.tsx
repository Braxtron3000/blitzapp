import "~/styles/globals.css";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

import { TRPCReactProvider } from "~/trpc/react";

export const metadata: Metadata = {
  title: "BlitzApp",
  description: "A workout app made by developers for you",
  icons: [{ rel: "icon", url: "/milo-of-croton.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body>
        <AppRouterCacheProvider>
          <TRPCReactProvider>{children}</TRPCReactProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
