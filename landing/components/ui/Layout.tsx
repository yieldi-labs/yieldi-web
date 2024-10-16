import React from "react";
import Footer from "./Footer";
import { Navbar } from "@shared/components";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => (
  <div className="flex min-h-screen flex-col bg-noise-pattern bg-contain">
    <Navbar
      links={[
        { label: "About", href: "#about" },
        { label: "Solution", href: "#solution" },
        { label: "Components", href: "#components" },
      ]}
    />
    <main className="flex-grow">{children}</main>
    <Footer />
  </div>
);

export default Layout;
