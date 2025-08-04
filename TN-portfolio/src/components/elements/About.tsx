import { useState } from "react";

export default function About({ buttonStyle }: { buttonStyle: string }) {
  const [aboutDisplay, setAboutDisplay] = useState<null | string>(null);
  const AboutButton = ({
    topic,
    className,
  }: {
    topic: string;
    className?: string;
  }) => {
    return (
      <button
        className={`${className} ${buttonStyle} w-full text-start`}
        onClick={() => {
          setAboutDisplay(aboutDisplay === topic ? null : topic);
        }}
      >
        <div
          className={`transition ${aboutDisplay === topic && "translate-x-10"}`}
        >
          {topic}
        </div>
      </button>
    );
  };

  return (
    <>
      <nav className="col-start-1 col-span-1">
        <ul className="divide-y-1 divide-black/10 *:*:p-5">
          <li>
            <AboutButton topic={"Projects"} />
          </li>
          <li>
            <AboutButton topic={"Skills"} />
          </li>
          <li>
            <AboutButton topic={"Experience"} />
          </li>
          <li>
            <AboutButton topic={"Education"} />
          </li>
        </ul>
      </nav>
      <article className="col-start-2 border-l-2 border-black/20 *:pt-5 *:nth-1:pt-0 *:px-10">
        <h2 className="text-center text-xl">Welcome to my site!</h2>
        <p className="text-justify">
          I'm Tam, a full-stack software engineer from Cambridge in the UK. I'm
          moving on from a career in planetary science research and looking for
          junior developer roles.
        </p>
        <p className="text-justify">
          I'm experienced in JavaScript, Express, PostgreSQL, React, Tailwind,
          and more, and I'm currently learning Three.js and TypeScript.
        </p>
        <p className="text-justify">
          This site is a work in progress - please check back later for more!
        </p>
      </article>
    </>
  );
}
