import type { Metadata } from "next";
import "./globals.css";

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
          <div className="flex-grow flex-1 bg-background">{children}</div>
        </main>
      </body>
    </html>
  );
}
