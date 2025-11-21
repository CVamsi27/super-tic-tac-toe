import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar/Nabbar";
import { Footer } from "@/components/Footer/Footer";
import Providers from "./providers";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Super tic-tac-toe",
  description: "Play super tic-tac-toe",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`relative h-screen font-sans antialiased bg-gradient-main overflow-hidden`}>
        <Providers>
          <main className="relative flex flex-col h-screen overflow-hidden">
            <Navbar />
            <div className="flex-grow overflow-y-auto overflow-x-hidden bg-gradient-main">
              {children}
            </div>
            <Toaster />
            <Footer />
          </main>
        </Providers>
      </body>
    </html>
  );
}
