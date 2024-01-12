import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { PlenaWalletProvider } from "plena-connect-dapp-sdk";

const config = {
  dappToken:
    "91651531fc0ff6f89808b72c7ca0fcda6a9816a225e33f4b226e5bfdadccf776007dee0a61aa8bfd8f32ceed5c3374da4b820f51b1dd1829c441aaa4eee83891",
  dappId: "cm61ds5dotv8m80olbig",
  bridgeUrl: "connect.plena.finance",
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <PlenaWalletProvider config={config}>
      <App />
    </PlenaWalletProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
