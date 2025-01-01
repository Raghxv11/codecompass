import "@/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import { Toaster } from "sonner";
import { TRPCReactProvider } from "@/trpc/react";
import { ClerkProvider } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "CodeCompass",
  description: "Chat with your Github Repository",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${GeistSans.variable}`}>
        <body>
        <TRPCReactProvider>{children}</TRPCReactProvider>
        <Toaster richColors />
        </body>
      </html>
    </ClerkProvider>
  );
}
