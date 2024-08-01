import * as React from "react";
import * as ReactDOM from "react-dom/client";

const createRootPromise = new Promise((resolve) => {
  const reactContainer = document.getElementById("root");
  console.log("createRoot(container)执行开始", reactContainer);
  resolve(reactContainer);
}).then((reactContainer) => {
  const root = ReactDOM.createRoot(reactContainer);
  console.log("createRoot(container)执行结束", reactContainer, root);
  return root;
});

// const reactEl = React.createElement(
//   React.Fragment,
//   null,
//   React.createElement("div", null, "123")
// );

createRootPromise.then((root) => {
  console.log("Promise resolved, rendering React component");
  // root.render(reactEl);
});
