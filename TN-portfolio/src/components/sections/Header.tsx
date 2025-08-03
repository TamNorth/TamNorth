import { useState } from "react";
import {
  MdOutlineVisibility,
  MdOutlineVisibilityOff,
  MdOutlineMenu,
} from "react-icons/md";

export default function Header() {
  const [visibility, setVisibility] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const buttonSize = 25;
  const buttonPadding = "p-6";
  const headerOpacity = "20";
  const logo = (
    <a
      href="/"
      aria-label="Tam North homepage"
      className={`flex items-center text-2xl whitespace-pre`}
    >
      <span>tam </span>
      <span className="text-4xl">N</span>
      <span>orth</span>
    </a>
  );

  return (
    <header className="group fixed inset-x-0 top-0 flex justify-between items-center text-white *:transition font-cinzel bg-radial-[at_50%_0%] from-black/20 from-30% to-transparent transition to-70%">
      <button
        type="button"
        aria-label={`toggle menu visibility ${showMenu ? "off" : "on"}`}
        onClick={() => {
          setShowMenu(!showMenu);
        }}
        className={`hover:scale-110 ${buttonPadding} ${
          visibility ||
          showMenu ||
          `opacity-${headerOpacity} group-hover:opacity-100`
        }`}
      >
        <MdOutlineMenu size={buttonSize} />
      </button>
      <nav
        aria-label="Main menu"
        className={`absolute left-1/2 -translate-x-1/2 ${
          visibility || `opacity-${headerOpacity} group-hover:opacity-100`
        }`}
      >
        <ul className="grid grid-cols-[1fr_auto_1fr] gap-20 text-center items-center *:hover:scale-110 *:transition">
          <li className="">Options</li>
          <li>{logo}</li>
          <li>Contact</li>
        </ul>
      </nav>
      <button
        type="button"
        aria-label={`toggle header visibility ${visibility ? "off" : "on"}`}
        onClick={() => {
          setVisibility(!visibility);
        }}
        className={`hover:scale-110 ${buttonPadding}`}
      >
        {visibility ? (
          <MdOutlineVisibilityOff size={buttonSize} />
        ) : (
          <MdOutlineVisibility size={buttonSize} />
        )}
      </button>
    </header>
  );
}
