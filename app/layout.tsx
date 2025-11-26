import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar/Nabbar";
import { Footer } from "@/components/Footer/Footer";
import Providers from "./providers";
import { Toaster } from "@/components/ui/sonner";
import { ClientLayout } from "@/components/ClientLayout";

export const metadata: Metadata = {
  title: "Super Tic-Tac-Toe | Strategic Board Game",
  description: "Play Super Tic-Tac-Toe online - a strategic twist on the classic game. Challenge AI, friends, or random opponents!",
  keywords: ["tic-tac-toe", "super tic-tac-toe", "ultimate tic-tac-toe", "board game", "strategy game", "multiplayer"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`relative min-h-screen font-sans antialiased bg-gradient-main`}>
        <Providers>
          <main className="relative flex flex-col min-h-screen">
            <Navbar />
            <div className="flex-grow bg-gradient-main">
              {children}
            </div>
            <Toaster />
            <Footer />
            <ClientLayout />
          </main>
        </Providers>
      </body>
    </html>
  );
}
