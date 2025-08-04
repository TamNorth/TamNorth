import { useState } from "react";
import { HiExternalLink } from "react-icons/hi";

export default function About({ buttonStyle }: { buttonStyle: string }) {
  const [aboutDisplay, setAboutDisplay] = useState<string>("intro");

  const AboutButton = ({
    topic,
    className,
  }: {
    topic: string;
    className?: string;
  }) => {
    const topicArray = topic.split("");

    return (
      <button
        className={`${className} ${buttonStyle} w-full text-start`}
        onClick={() => {
          setAboutDisplay(aboutDisplay === topic ? "intro" : topic);
        }}
      >
        <div
          className={`transition ${aboutDisplay === topic && "translate-x-10"}`}
        >
          {topicArray.shift()?.toUpperCase() + topicArray.join("")}
        </div>
      </button>
    );
  };

  const aboutSections: any = {
    intro: (
      <>
        <h2 className="text-center text-xl">Welcome to my site!</h2>
        <p className="text-justify">
          I'm Tam, a full-stack software engineer from Cambridge in the UK. I'm
          moving on from a career in planetary science research and looking for
          junior developer roles.
        </p>
        <p className="text-justify">
          I'm experienced in JavaScript, Express, PostgreSQL, React, Tailwind,
          and more, and I'm currently learning Three.js and TypeScript. Check
          the links on the sidebar for more details.
        </p>
        <p className="text-justify">
          This site is a work in progress - please check back later for more!
        </p>
      </>
    ),
    projects: (
      <>
        <h2>Tam-North.com</h2>
        <p>
          That's right - the website you're on right now! I started this site to
          practice on a new tech stack, as I'm working through Bruno Simon's{" "}
          <a href="https://threejs-journey.com/" target="_blank">
            brilliant course
            <HiExternalLink className={"inline"} />
          </a>{" "}
          on Three.js. Where it goes from here - who knows? (Well, I do have
          some ideas...)
        </p>
        <p>
          <a href="https://github.com/TamNorth/TamNorth" target="_blank">
            Github
            <HiExternalLink className={"inline"} />
          </a>{" "}
          - built with Three.js, React.js, TypeScript and TailwindCSS
        </p>
        <a href="https://tusemain.netlify.app/" target="_blank">
          <h2>
            Tuse: the collaborative art app
            <HiExternalLink className={"inline"} />
          </h2>
        </a>
        <p>
          Over the course of two weeks earlier this year, some of my fellow
          students at{" "}
          <a href="https://www.northcoders.com/blog/tuse/" target="_blank">
            Northcoders
            <HiExternalLink className={"inline"} />
          </a>{" "}
          and I decided to build a web app - a shared online canvas where you
          can learn to draw with your friends. Tuse will automatically generate
          a private room for you, which you can enjoy alone or share using a
          unique code. You can also start your canvas with an inspirational
          artwork, provided daily from the Art Institute of Chicago. There's
          still some rough spots, but I'm super proud of what we accomplished in
          such a short time.{" "}
          <a
            href="https://youtu.be/LDEnuf4R4kg"
            target="_blank"
            className="font-bold decoration-2"
          >
            Click here for a short introductory video!
            <HiExternalLink className={"inline"} />
          </a>
        </p>
        <p>
          <a href="https://github.com/uimran19/Tuse" target="_blank">
            Github
            <HiExternalLink className={"inline"} />
          </a>{" "}
          - built with React.js, Socket.io, Konva, Express, PostgreSQL and Jest
        </p>
        <a href="https://tea-news.netlify.app/" target="_blank">
          <h2>
            Tea News
            <HiExternalLink className={"inline"} />
          </h2>
        </a>
        <p>
          Tea News was my first project, a full-stack news server where you can
          view, sort and filter a feed of articles. On an article page, you can
          vote, leave a comment, and delete your comment, if you change your
          mind!
        </p>
        <p>
          Github:{" "}
          <a href="https://github.com/TamNorth/tea-news" target="_blank">
            frontend
            <HiExternalLink className={"inline"} />
          </a>
          ,{" "}
          <a href="https://github.com/TamNorth/NC-news" target="_blank">
            backend
            <HiExternalLink className={"inline"} />
          </a>{" "}
          - built with React.js, Express, PostgreSQL, Jest, Supertest, Supabase,
          Render and Netlify
        </p>
      </>
    ),
    skills: <h2>Section under construction</h2>,
    experience: <h2>Section under construction</h2>,
  };

  return (
    <>
      <nav className="col-start-1 col-span-1">
        <ul className="divide-y-1 divide-black/10 *:*:p-5">
          <li>
            <AboutButton topic={"projects"} />
          </li>
          <li>
            <AboutButton topic={"skills"} />
          </li>
          <li>
            <AboutButton topic={"experience"} />
          </li>
        </ul>
      </nav>
      <article className="col-start-2 border-l-2 border-black/20 *:pt-5 *:*:pt-5 *:nth-1:pt-0 px-10 overflow-y-auto [&_a]:hover:underline [&_a]:text-fuchsia-300 [&_h2]:text-2xl *:[&_h2]:text-2xl">
        {aboutSections?.[aboutDisplay] || aboutSections.intro}
      </article>
    </>
  );
}
