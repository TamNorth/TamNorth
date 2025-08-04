import { useEffect, useRef, useState } from "react";
// import { HiExternalLink } from "react-icons/hi";
import {
  MdOutlineVisibility,
  MdOutlineVisibilityOff,
  MdOutlineMenu,
} from "react-icons/md";
import { FaGithub, FaLinkedin } from "react-icons/fa";

export default function Header() {
  const [visibility, setVisibility] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const aboutRef = useRef<null | HTMLButtonElement>(null);
  const linksRef = useRef<null | HTMLButtonElement>(null);
  const aboutDropdownRef = useRef<null | HTMLDivElement>(null);
  const contactsDropdownRef = useRef<null | HTMLUListElement>(null);

  useEffect(() => {
    document.body.addEventListener("click", (event: MouseEvent) => {
      if (
        aboutRef.current &&
        !event.composedPath().includes(aboutRef.current) &&
        aboutDropdownRef.current &&
        !event.composedPath().includes(aboutDropdownRef.current)
      ) {
        setShowAbout(false);
      }
      if (
        linksRef.current &&
        !event.composedPath().includes(linksRef.current) &&
        contactsDropdownRef.current &&
        !event.composedPath().includes(contactsDropdownRef.current)
      ) {
        setShowContact(false);
      }
    });
  }, []);

  const buttonSize = 25;
  const buttonPadding = "p-6";
  const headerOpacityStyle = `opacity-20 group-hover:opacity-100 transition duration-500`;
  const subMenuStyle =
    "font-montserrat text-white/90 mt-6 text-left rounded-2xl bg-black/20 backdrop-blur-sm p-5 inset-ring inset-ring-black/20 shadow-[0_-1px_0_rgba(0,0,0,0.5)_inset]";
  const buttonStyle = "hover:scale-110 transition cursor-pointer";
  const logo = (
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
            <button
              type="button"
              onClick={() => {
                setShowAbout(!showAbout);
              }}
              ref={aboutRef}
              className={`${buttonStyle} ${
                visibility || showAbout || headerOpacityStyle
              }`}
            >
              about
            </button>
            {showAbout && (
              <div
                className={`fixed left-1/2 -translate-x-1/2 w-[90vw] m-3 grid gap-10 grid-cols-[1fr_5fr] ${subMenuStyle}`}
                ref={aboutDropdownRef}
              >
                <nav className="col-start-1 col-span-1">
                  <ul className="divide-y-1 divide-black/10 *:p-5">
                    <li>Projects</li>
                    <li>Skills</li>
                    <li>Experience</li>
                    <li>Education</li>
                  </ul>
                </nav>
                <article className="col-start-2 border-l-2 border-black/20 *:pt-5 *:nth-1:pt-0 *:px-10">
                  <h2 className="text-center text-xl">Welcome to my site!</h2>
                  <p className="text-justify">
                    I'm Tam, a full-stack software engineer from Cambridge in
                    the UK. I'm moving on from a career in planetary science
                    research and looking for junior developer roles.
                  </p>
                  <p className="text-justify">
                    I'm experienced in JavaScript, Express, PostgreSQL, React,
                    Tailwind, and more, and I'm currently learning Three.js and
                    TypeScript.
                  </p>
                  <p className="text-justify">
                    This site is a work in progress - please check back later
                    for more!
                  </p>
                </article>
              </div>
            )}
          </li>
          <li>{logo}</li>
          <li>
            <button
              type="button"
              onClick={() => {
                setShowContact(!showContact);
              }}
              ref={linksRef}
              className={`${buttonStyle} ${
                visibility || showContact || headerOpacityStyle
              }`}
            >
              contact
            </button>
            {showContact && <></>}
          </li>
        </ul>
      </nav>
      <ul
        aria-label="External links"
        className={`*:inline *:ml-3 *:nth-1:ml-0`}
        ref={contactsDropdownRef}
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
