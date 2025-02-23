"use client";
import React from "react";
import Button from "../Button";
import LinkWithHoverEffect from "../LinkWithHoverEffect";
import { Close } from "../../svg";

interface SlidingMenuProps {
  links: { label: string; href: string }[];
  buttons?: {
    label?: string;
    component?: JSX.Element;
    className?: string;
    onClick?: () => void;
  }[];
  menuOpen: boolean;
  toggleMenu: () => void;
}

const SlidingMenu = ({
  links,
  buttons,
  menuOpen,
  toggleMenu,
}: SlidingMenuProps) => (
  <>
    {menuOpen && (
      <div
        className="fixed inset-0 z-[250] bg-white bg-opacity-50 backdrop-blur-md transition-opacity duration-300 ease-in-out"
        onClick={toggleMenu}
      />
    )}

    <div
      className={`fixed right-0 top-0 z-[300] flex h-screen w-[70vw] flex-col gap-14 ${menuOpen ? "translate-x-0" : "translate-x-full"
        } tablet:hidden bg-white/50 backdrop-blur-md transition-transform duration-300 ease-in-out`}
    >
      <div className="flex cursor-pointer justify-end p-10">
        <Close onClick={toggleMenu} aria-label="Close Menu" />
      </div>

      <LinkWithHoverEffect links={links} toggleMenu={toggleMenu} column />

      {buttons && (
        <div className="flex flex-col items-center gap-5">
          {buttons.map((button, index) =>
            !button.component && <Button key={index} {...button} >{button.label}</Button>
          )}
        </div>
      )}
    </div>
  </>
);

export default SlidingMenu;
