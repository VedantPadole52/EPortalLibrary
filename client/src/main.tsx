import { createRoot } from "react-dom/client";
import App from "./App";
import { LanguageProvider } from "./lib/LanguageContext";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <LanguageProvider>
    <App />
  </LanguageProvider>
);
