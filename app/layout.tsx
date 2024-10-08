import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./navbar";

export const metadata: Metadata = {
  title: "Yieldi",
  description: "Earn yield on native assets",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="shortcut icon" href="/favicon.png" />
      </head>
      <body>
        <Navbar />
        <div className="max-w-5xl mx-auto p-4">{children}</div>
      </body>
    </html>
  );
}
