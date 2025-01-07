import { navbarLinks } from "@/utils";
import { UIComponents } from "@shared/components";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => (
  <div className="flex min-h-screen flex-col bg-noise-pattern bg-contain">
    <div className="z-50">
      <UIComponents.Navbar links={navbarLinks} />
    </div>
    <main className="flex-grow">{children}</main>
  </div>
);

export default Layout;
