import type { Metadata } from "next";
import WalletButton from "@/app/walletButton";
import "./globals.css";

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
        <nav className="flex items-stretch border-b">
          <div className="py-3 px-4 border-r">
            <img src="/logo.svg" style={{ height: 28 }} />
          </div>
          <div className="flex-1 flex">
            <a
              className="uppercase tracking-widest p-4 border-r text-sm leading-6 border-b border-b-2 border-b-foreground font-medium"
              href="/"
            >
              Dashboard
            </a>
          </div>
          <div className="border-l flex">
            <WalletButton />
          </div>
        </nav>
        <div className="max-w-5xl mx-auto p-4">{children}</div>
      </body>
    </html>
  );
}
