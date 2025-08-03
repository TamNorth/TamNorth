import { useEffect, useState } from "react";
import {
  MdOutlineVisibility,
  MdOutlineVisibilityOff,
  MdOutlineMenu,
} from "react-icons/md";

export default function Header() {
  const [visibility, setVisibility] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showLinks, setShowLinks] = useState(false);
  const buttonSize = 25;
  const buttonPadding = "p-6";
  const headerOpacity = "20";
  const subMenuStyle =
    "absolute mt-3 *:pt-2 *:nth-1:pt-0 text-left rounded-2xl bg-black/20 backdrop-blur-sm p-5";
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
    <header
      className={`group fixed inset-x-0 top-0 flex justify-between items-center text-white *:transition font-cinzel pb-10 ${
        visibility &&
        `bg-radial-[at_50%_0%] from-black/30 from-45% to-transparent transition to-70%`
      }`}
    >
      <button
        type="button"
        aria-label={`toggle menu visibility aid ${showMenu ? "off" : "on"}`}
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
          visibility ||
          showAbout ||
          showLinks ||
          `opacity-${headerOpacity} group-hover:opacity-100`
        }`}
      >
        <ul className="grid grid-cols-[1fr_auto_1fr] gap-20 text-center items-center *:hover:scale-110 *:transition">
          <li>
            <button
              type="button"
              onClick={() => {
                setShowAbout(!showAbout);
              }}
            >
              about
            </button>
            {showAbout && (
              <article className={subMenuStyle}>
                <h2>Welcome to my site!</h2>
                <p>
                  Lorem ipsum dolor sit amet consectetur adipisicing elit. Sunt,
                  cupiditate. Perspiciatis commodi nulla nobis quos, recusandae
                  sed veritatis beatae voluptates. Voluptatem laborum cum
                  sapiente itaque beatae consequuntur reprehenderit! Suscipit,
                  laborum!
                </p>
              </article>
            )}
          </li>
          <li>{logo}</li>
          <li>
            <button
              type="button"
              onClick={() => {
                setShowLinks(!showLinks);
              }}
            >
              links
              {showLinks && (
                <ul className={subMenuStyle}>
                  <li>
                    <a href="https://github.com/TamNorth">github</a>
                  </li>
                  <li>
                    <a href="https://linkedin.com/in/t-n-ba5a003b/">linkedin</a>
                  </li>
                </ul>
              )}
            </button>
          </li>
        </ul>
      </nav>
      <button
        type="button"
        aria-label={`toggle header visibility aid ${visibility ? "off" : "on"}`}
        onClick={() => {
          setVisibility(!visibility);
        }}
        className={`hover:scale-110 ${buttonPadding} bg-radial from-black/30 from-30% to-transparent to-50%`}
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
