import Yieldi from "../svg/Yieldi";
import Button from "./Button";
import Link from "next/link";

interface NavbarProps {
  links: { label: string; href: string }[];
  buttons?: {
    label: string;
    rounded?: boolean;
    className?: string;
    onClick: () => void;
  }[];
}

const Navbar = ({ links, buttons }: NavbarProps) => (
  <nav className="w-100 mx-18 nav-radial mt-5 flex items-center justify-between rounded-2xl border-2 border-white px-10 py-8">
    <Yieldi width={108} />
    <ul className="flex items-center gap-20 font-medium uppercase">
      {links.map(({ label, href }, index) => (
        <li key={index} className="cursor-pointer">
          {href.startsWith("#") ? (
            <a href={href}>{label}</a>
          ) : (
            <Link href={href}>{label}</Link>
          )}
        </li>
      ))}
    </ul>
    {buttons &&
      buttons.map((button, index) => <Button key={index} {...button} />)}
  </nav>
);

export default Navbar;
