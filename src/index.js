import * as React from "react";
import * as ReactDOM from "react-dom/client";

const createRootPromise = new Promise((resolve) => {
  const reactContainer = document.getElementById("root");

  resolve(reactContainer);
}).then((reactContainer) => {
  console.log(
    "------------------------------【一、createRoot】-------------------------------",
    reactContainer
  );
  const root = ReactDOM.createRoot(reactContainer);
  console.log(
    "------------------------------【一、createRoot结束】-------------------------------",
    reactContainer,
    root
  );
  return root;
});

createRootPromise
  .then((root) => {
    console.log(
      "------------------------------【二、createElement】-------------------------------"
    );
    const reactEl = React.createElement(
      React.Fragment,
      null,
      React.createElement(
        "div",
        null,
        "123",
        React.createElement("div", null, "1456")
      )
    );
    console.log(
      "------------------------------【二、createElement结束】-------------------------------",
      reactEl
    );
    // ==等于
    // const reactEl = (
    //   <div>
    //     123
    //     <span>321</span>
    //     <span>abc</span>
    //   </div>
    // );
    return { reactEl, root };
  })
  .then(({ reactEl, root }) => {
    console.log(
      "-----------------------------------【三、render】---------------------------------"
    );
    root.render(reactEl);
    console.log(
      "-----------------------------------【三、render结束】---------------------------------"
    );
    // const root = ReactDOM.hydrateRoot(reactContainer, reactEl);
  });
