"use client";

import React from "react";
import ThemeProvider from "@/theme/theme-provider";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "@/components/ui/sonner";

export default function Providers({
  children,
  session,
}: {
  children: React.ReactNode;
  session?: any;
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <SessionProvider session={session}>{children}</SessionProvider>
      <Toaster position="top-center" />
    </ThemeProvider>
  );
}
