import { Yieldi } from "../svg";

const Navbar = () => {
  return (
    <nav className="w-100 h-28">
      <div className="bg-gradient-radial w-100 flex items-center border-2 border-white from-white/20 to-white/80">
        <Yieldi className="scale-[0.69] transform" />
        <ul className="flex items-center gap-2">
          <li>About</li>
          <li>Solutin</li>
          <li>Components</li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
