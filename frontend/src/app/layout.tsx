import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar/Nabbar";
import { Footer } from "@/components/Footer/Footer";

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
    <html lang="en" className="h-full">
      <body className={`relative h-full font-sans antialiased`}>
        <main className="relative flex flex-col h-full">
          <Navbar />
          <div className="flex-grow flex-1 bg-background">{children}</div>
          <Footer />
        </main>
      </body>
    </html>
  );
}
