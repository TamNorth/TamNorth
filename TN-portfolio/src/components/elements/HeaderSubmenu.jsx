export default function HeaderSubmenu() {
  return (
    <button
      type="button"
      onClick={() => {
        setShowLinks(!showLinks);
      }}
    ></button>
  );
}
