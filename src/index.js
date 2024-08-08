import * as React from "react";
import * as ReactDOM from "react-dom/client";

const createRootPromise = new Promise((resolve) => {
  const reactContainer = document.getElementById("root");

  resolve(reactContainer);
}).then((reactContainer) => {
  console.log(
    "--------------------------------【一、执行createRoot函数】---------------------------------"
  );
  console.log(
    "【一、执行createRoot函数】createRoot(container)执行开始",
    reactContainer
  );
  const root = ReactDOM.createRoot(reactContainer);
  console.log(
    "【一、结束createRoot函数】createRoot(container)执行结束",
    reactContainer,
    root
  );

  return root;
});

createRootPromise
  .then((root) => {
    // const reactEl = React.createElement(
    //   React.Fragment,
    //   null,
    //   React.createElement(
    //     "div",
    //     null,
    //     "123",
    //     React.createElement("div", null, "1456")
    //   )
    // );
    const reactEl = (
      <div>
        123
        <span>321</span>
        <span>abc</span>
      </div>
    );
    return { reactEl, root };
  })
  .then(({ reactEl, root }) => {
    // const reactEl = React.createElement("div", null, "123");
    console.log(
      "-----------------------------------【二、执行render函数】---------------------------------"
    );
    root.render(reactEl);
    console.log(
      "-----------------------------------【二、render函数结束】---------------------------------"
    );
    // const root = ReactDOM.hydrateRoot(reactContainer, reactEl);
  });
