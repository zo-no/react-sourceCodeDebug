// import "./index.css";
// import App from "./App";

// import reportWebVitals from "./reportWebVitals";
import * as React from "react";
import * as ReactDOM from "react-dom/client";
// import { BrowserRouter } from "react-router-dom";
const reactContainer = document.getElementById("root");
console.log("createRoot(container)执行开始", reactContainer);
const root = ReactDOM.createRoot(reactContainer);
console.log("createRoot(container)执行结束", reactContainer, root);
console.log(root);

const reactEl = React.createElement(
  React.Fragment,
  null,
  React.createElement("div", null, "123")
);
import AppTest from "./AppTest";
root.render(
  <>
    {/* <BrowserRouter> */}
    {/* <App /> */}

    {/* </BrowserRouter> */}
    {/* 最主要的内容 */}
    {/* <AppTest /> */}

    {/* <span>state1：{state}</span>
      <span>state2：{state2}</span>
      <button onClick={click}>react事件</button> */}
    {/* <button id="but">原生事件</button> */}

    {/* <button onClick={time}>延迟事件</button> */}
  </>
);

root.render(reactEl);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
