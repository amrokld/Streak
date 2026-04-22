import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import ThemeProvider from "./Context/ThemeProvider.jsx";
import "./index.css";

import { TourProvider } from "./tour/TourProvider";

ReactDOM.createRoot(document.getElementById("root")).render(
  <TourProvider>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </TourProvider>
);
