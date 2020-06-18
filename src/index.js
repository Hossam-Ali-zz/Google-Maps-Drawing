import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import GoogleDrawingManager from "./components/Google/GoogleDrawingManager";
import * as serviceWorker from "./serviceWorker";

ReactDOM.render(<GoogleDrawingManager />, document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
