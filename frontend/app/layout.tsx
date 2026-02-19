import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "2048 — Play the Classic Puzzle Game",
  description: "A production-grade 2048 clone with power-ups, cloud saves, and a global leaderboard.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.className} bg-[#faf8ef] min-h-screen`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
