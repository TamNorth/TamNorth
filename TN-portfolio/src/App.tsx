import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import UnderConstructionPage from "./components/pages/UnderConstructionPage";

function App() {
  const [count, setCount] = useState(0);

  return <UnderConstructionPage />;
}

export default App;
