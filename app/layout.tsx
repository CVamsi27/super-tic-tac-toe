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
    <html lang="en" className="h-screen overflow-hidden" suppressHydrationWarning>
      <body className={`relative h-screen font-sans antialiased bg-gradient-main overflow-hidden`}>
        <Providers>
          <main className="relative flex flex-col h-screen overflow-hidden">
            <Navbar />
            <div className="flex-grow flex-1 bg-gradient-main overflow-y-auto overflow-x-hidden">
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
