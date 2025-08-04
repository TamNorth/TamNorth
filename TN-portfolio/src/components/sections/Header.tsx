import { useState } from "react";
import {
  MdOutlineVisibility,
  MdOutlineVisibilityOff,
  MdOutlineMenu,
} from "react-icons/md";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import About from "../elements/About";
import HeaderSubmenu from "../elements/HeaderSubmenu";

export default function Header() {
  const [visibility, setVisibility] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const buttonSize = 25;
  const buttonPadding = "p-6";
  const headerOpacityStyle = `opacity-20 group-hover:opacity-100 transition duration-500`;
  const buttonStyle = "hover:scale-110 transition cursor-pointer";
  const HomeButton = () => {
    return (
      <a
        href="/"
        aria-label="Tam North homepage"
        className={`flex items-center text-2xl whitespace-pre hover:scale-110 transition ${buttonStyle} ${
          visibility || headerOpacityStyle
        }`}
      >
        <span>tam </span>
        <span className="text-4xl">N</span>
        <span>orth</span>
      </a>
    );
  };

  return (
    <header
      className={`group fixed inset-x-0 top-0 grid gap-20 grid-cols-[1fr_1fr_auto_1fr_1fr] justify-items-center items-center text-white *:transition font-cinzel pb-10 ${
        visibility &&
        `bg-radial-[at_50%_0%] from-black/30 from-45% to-transparent transition to-70%`
      }`}
    >
      <button
        type="button"
        aria-label={`toggle menu visibility ${showMenu ? "off" : "on"}`}
        onClick={() => {
          setShowMenu(!showMenu);
        }}
        className={buttonPadding}
      >
        <MdOutlineMenu
          size={buttonSize}
          className={`${buttonStyle} ${
            visibility || showMenu || headerOpacityStyle
          }`}
        />
      </button>
      <nav aria-label="Main menu" className={`col-start-3`}>
        <ul className="grid grid-cols-[1fr_auto_1fr] gap-20 text-center items-center">
          <li>
            <HeaderSubmenu
              title="about"
              visibility={visibility}
              buttonStyle={buttonStyle}
              headerOpacityStyle={headerOpacityStyle}
            >
              <About buttonStyle={buttonStyle} />
            </HeaderSubmenu>
          </li>
          <li>
            <HomeButton />
          </li>
          <li>
            <HeaderSubmenu
              title="contact"
              visibility={visibility}
              buttonStyle={buttonStyle}
              headerOpacityStyle={headerOpacityStyle}
            >
              <p>Section under construction</p>
            </HeaderSubmenu>
          </li>
        </ul>
      </nav>
      <ul
        aria-label="External links"
        className={`*:inline *:ml-3 *:nth-1:ml-0`}
      >
        <li>
          <a href="https://github.com/TamNorth" target="_blank">
            <FaGithub
              className={`inline mr-1 ${buttonStyle} ${
                visibility || headerOpacityStyle
              }`}
              size={buttonSize}
            />
          </a>
        </li>
        <li>
          <a href="https://linkedin.com/in/t-n-ba5a003b/" target="_blank">
            <FaLinkedin
              className={`inline mr-1 ${buttonStyle} ${
                visibility || headerOpacityStyle
              }`}
              size={buttonSize}
            />
          </a>
        </li>
      </ul>
      <button
        type="button"
        aria-label={`toggle header visibility aid ${visibility ? "off" : "on"}`}
        onClick={() => {
          setVisibility(!visibility);
        }}
        className={`${buttonStyle} ${buttonPadding} bg-radial from-black/30 from-30% to-transparent to-40% bg-size-[${
          Number(buttonSize) * 3
        }px_${Number(buttonSize) * 2}px] bg-center bg-no-repeat`}
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
