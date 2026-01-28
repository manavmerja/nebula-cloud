import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import SmoothScroll from "@/components/SmoothScroll";
import { ToastProvider } from '@/context/ToastContext';
import "@monaco-editor/react"; // Ensure the react wrapper is installed
import "monaco-editor/min/vs/editor/editor.main.css"; // Import styles globally

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nebula Cloud | Next-Gen Infrastructure Tools",
  description: "Generate, visualize, and deploy cloud infrastructure with AI-powered Terraform generation and cost estimation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
    href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600&display=swap"
    rel="stylesheet"
    crossOrigin="anonymous"
  />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-screen overflow-hidden`}
      >

        <Providers>
          <SmoothScroll>
            <ToastProvider>
            {children}
            </ToastProvider>
            </SmoothScroll>
        </Providers>
      </body>
    </html>
  );
}


