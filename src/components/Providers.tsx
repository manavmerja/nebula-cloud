"use client";

import { SessionProvider } from "next-auth/react";
import SmoothScroll from "./SmoothScroll";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SmoothScroll>
        {children}
      </SmoothScroll>
    </SessionProvider>
  );
}