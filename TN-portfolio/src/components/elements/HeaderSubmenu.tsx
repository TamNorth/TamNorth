import { useEffect, useRef, useState } from "react";

export default function HeaderSubmenu({
  title,
  visibility,
  buttonStyle,
  headerOpacityStyle,
  children,
}: {
  title: string;
  visibility: boolean;
  buttonStyle: string;
  headerOpacityStyle: string;
  children?: any;
}) {
  const [show, setShow] = useState(false);
  const buttonRef = useRef<null | HTMLButtonElement>(null);
  const dropdownRef = useRef<null | HTMLDivElement>(null);

  const subMenuStyle =
    "font-montserrat text-white/90 mt-6 text-left rounded-2xl bg-black/20 backdrop-blur-sm p-5 inset-ring inset-ring-black/20 shadow-[0_-1px_0_rgba(0,0,0,0.5)_inset]";

  useEffect(() => {
    document.body.addEventListener("click", (event: MouseEvent) => {
      if (
        buttonRef.current &&
        !event.composedPath().includes(buttonRef.current) &&
        dropdownRef.current &&
        !event.composedPath().includes(dropdownRef.current)
      ) {
        setShow(false);
      }
    });
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setShow(!show);
        }}
        ref={buttonRef}
        className={`${buttonStyle} ${visibility || show || headerOpacityStyle}`}
      >
        {title}
      </button>
      {show && (
        <div
          className={`fixed left-1/2 -translate-x-1/2 w-[90vw] m-3 grid gap-10 grid-cols-[1fr_5fr] ${subMenuStyle}`}
          ref={dropdownRef}
        >
          {children}
        </div>
      )}
    </>
  );
}
