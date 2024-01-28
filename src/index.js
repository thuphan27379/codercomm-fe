import React from "react";
import ReactDOM from "react-dom";
import App from "./App"; //
import { Provider } from "react-redux"; //
import store from "./app/store"; //
// import {createRoot} from "react-dom/client"
// vai cho khac so voi video

//
ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById("root")
);
