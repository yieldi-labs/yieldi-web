"use client";

import Link from "next/link";
import React from "react";
import { useState, useEffect, cloneElement } from "react";
import { twMerge } from "tailwind-merge";
import Button from "../Button";
import SlidingMenu from "./SlidingMenu";
import { Yieldi, Burger } from "../../svg";
import LinkWithHoverEffect from "../LinkWithHoverEffect";
import { createScrollHandler } from "../../../utils/scrollHandler";

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

  const containerClass = twMerge(
    `fixed top-[20px] mt-5 flex max-h-[96px] w-full transition-all duration-300`,
    isSticky ? "translate-y-0" : "translate-y-[-10px]",
  );

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
        className={containerClass}
        style={{
          transition: "transform 0.3s ease-in-out",
        }}
      >
        <div className="bg-transparent-radial text-neutral tablet:px-10 tablet:py-8 tablet:mx-18 md:mx-8 mx-4 flex w-full items-center justify-between rounded-2xl border-4 border-white px-4 py-4 backdrop-blur-[30px] shadow-md">
          <Link href="/">
            <Yieldi className="tablet:w-[108px] w-[96px]" />
          </Link>



          <div className="tablet:flex hidden w-full items-center justify-center">
            <LinkWithHoverEffect links={links} />
          </div>

          <div className="flex items-center gap-x-2">
            {buttons && (
              <div className="flex flex-col items-center gap-5 md:hidden">
                {buttons.map((button, index) =>
                  button.component && (
                    React.cloneElement(button.component, { ...button, key: index })
                  )
                )}
              </div>
            )}
            <div className="tablet:hidden block flex items-center">
              <button onClick={toggleMenu} aria-label="Toggle Menu">
                <Burger />
              </button>
            </div>
          </div>

          {buttons && (
            <div className="tablet:flex hidden items-center gap-5">
              {buttons.map((button, index) =>
                button.component ? (
                  cloneElement(button.component, {
                    ...button,
                    key: index,
                  })
                ) : (
                  <Button key={index} {...button} />
                ),
              )}
            </div>
          )}
        </div>
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
