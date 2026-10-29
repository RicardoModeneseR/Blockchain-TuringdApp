import React from "react";
import ReactDOM from "react-dom/client";
import { Dapp } from "./components/Dapp";

import "./styles.css";

// This is the entry point of your application, but it just renders the Dapp
// react component. All of the logic is contained in it.

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <Dapp />
  </React.StrictMode>
);

// npx hardhat node
// npx hardhat run scripts/deploy.js --network localhost
// cd frontend && npm start
