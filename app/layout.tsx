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
      <body className={`relative min-h-screen font-sans antialiased bg-gradient-main`}>
        <Providers>
          <main className="relative flex flex-col min-h-screen">
            <Navbar />
            <div className="flex-grow flex-1 bg-gradient-main">
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
