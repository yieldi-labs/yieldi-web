"use client";
import React, { useState, useEffect } from "react";
import Button from "../Button";
import SlidingMenu from "./SlidingMenu";
import { Yieldi, Burger } from "../../svg";
import LinkWithHoverEffect from "../LinkWithHoverEffect";
import { createScrollHandler } from "../../../utils/scrollHandler";
import Link from "next/link";

interface NavbarProps {
  links: { label: string; href: string }[];
  buttons?: {
    label?: string;
    component?: JSX.Element;
    className?: string;
    onClick?: () => void;
  }[];
}

const Navbar = ({ links, buttons }: NavbarProps) => {
  const [isSticky, setIsSticky] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  useEffect(() => {
    const handleScroll = createScrollHandler(setIsSticky);
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      <nav
        className={`bg-nav-radial w-100 tablet:mx-18 text-neutral-black tablet:px-10 tablet:py-8 mx-8 mt-5 flex max-h-[96px] items-center justify-between rounded-2xl border-4 border-white px-4 py-4 transition-all duration-300 ${
          isSticky
            ? "sticky left-0 right-0 top-[20px] z-30 shadow-md backdrop-blur-xl"
            : ""
        }`}
        style={{
          transition: "transform 0.3s ease-in-out",
          transform: isSticky ? "translateY(0)" : "translateY(-10px)",
        }}
      >
        <Link href="/">
          <Yieldi className="tablet:w-[108px] w-[96px]" />
        </Link>

        <div className="tablet:hidden block flex items-center">
          <button onClick={toggleMenu} aria-label="Toggle Menu">
            <Burger />
          </button>
        </div>

        <div className="tablet:flex hidden">
          <LinkWithHoverEffect links={links} />
        </div>
        {buttons && (
          <div className="tablet:flex hidden items-center gap-5">
            {buttons.map((button, index) =>
              button.component ? (
                React.cloneElement(button.component, {
                  ...button,
                  key: index,
                })
              ) : (
                <Button key={index} {...button} />
              ),
            )}
          </div>
        )}
      </nav>
      <SlidingMenu
        links={links}
        buttons={buttons}
        menuOpen={menuOpen}
        toggleMenu={toggleMenu}
      />
    </>
  );
};

export default Navbar;
