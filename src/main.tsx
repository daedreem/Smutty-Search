import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.scss";
import App from "./App.tsx";

import "@fontsource/libre-baskerville/700.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/600.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
