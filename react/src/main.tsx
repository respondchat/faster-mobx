import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// @ts-ignore
globalThis.setImmediate = setTimeout;

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(<App />);
