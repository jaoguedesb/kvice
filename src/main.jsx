import React from "react";
import { createRoot } from "react-dom/client";
import SimulacaoToracica3D from "./App.jsx";
import "./styles.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <SimulacaoToracica3D />
  </React.StrictMode>
);
