/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import type {MutableSource, ReactNodeList} from 'shared/ReactTypes';
import type {
  FiberRoot,
  TransitionTracingCallbacks,
} from 'react-reconciler/src/ReactInternalTypes';

import {queueExplicitHydrationTarget} from '../events/ReactDOMEventReplaying';
import {REACT_ELEMENT_TYPE} from 'shared/ReactSymbols';

export type RootType = {
  render(children: ReactNodeList): void,
  unmount(): void,
  _internalRoot: FiberRoot | null,
  ...
};

export type CreateRootOptions = {
  unstable_strictMode?: boolean,
  unstable_concurrentUpdatesByDefault?: boolean,
  identifierPrefix?: string,
  onRecoverableError?: (error: mixed) => void,
  transitionCallbacks?: TransitionTracingCallbacks,
  ...
};

export type HydrateRootOptions = {
  // Hydration options
  hydratedSources?: Array<MutableSource<any>>,
  onHydrated?: (suspenseNode: Comment) => void,
  onDeleted?: (suspenseNode: Comment) => void,
  // Options for all roots
  unstable_strictMode?: boolean,
  unstable_concurrentUpdatesByDefault?: boolean,
  identifierPrefix?: string,
  onRecoverableError?: (error: mixed) => void,
  ...
};

import {
  isContainerMarkedAsRoot,
  markContainerAsRoot,
  unmarkContainerAsRoot,
} from './ReactDOMComponentTree';
import {listenToAllSupportedEvents} from '../events/DOMPluginEventSystem';
import {
  ELEMENT_NODE,
  COMMENT_NODE,
  DOCUMENT_NODE,
  DOCUMENT_FRAGMENT_NODE,
} from '../shared/HTMLNodeType';

import {
  createContainer,
  createHydrationContainer,
  updateContainer,
  findHostInstanceWithNoPortals,
  registerMutableSourceForHydration,
  flushSync,
  isAlreadyRendering,
} from 'react-reconciler/src/ReactFiberReconciler';
import {ConcurrentRoot} from 'react-reconciler/src/ReactRootTags';
import {
  allowConcurrentByDefault,
  disableCommentsAsDOMContainers,
} from 'shared/ReactFeatureFlags';

/* global reportError */
const defaultOnRecoverableError =
  typeof reportError === 'function'
    ? // In modern browsers, reportError will dispatch an error event,
      // emulating an uncaught JavaScript error.
      reportError
    : (error: mixed) => {
        // In older browsers and test environments, fallback to console.error.
        // eslint-disable-next-line react-internal/no-production-logging
        console['error'](error);
      };

/** @desc 将root挂载在内部root */
function ReactDOMRoot(internalRoot: FiberRoot) {
  this._internalRoot = internalRoot;
}

/** @desc render函数的实现 */
ReactDOMHydrationRoot.prototype.render = ReactDOMRoot.prototype.render = function(
  children: ReactNodeList,
): void {
  //获取到root
  const root = this._internalRoot;

  console.log('【初次渲染1】zono1.createRoot工作做完后，调用root.render实则是调用updateContainer(children, root, null, null)，children是编译好的<App />根组件，root是我们创建好的FiberRoot')
  console.log('【打印】children, root对应结构：',children, root)
  updateContainer(children, root, null, null);
};

ReactDOMHydrationRoot.prototype.unmount = ReactDOMRoot.prototype.unmount = function(): void {
  if (__DEV__) {
    if (typeof arguments[0] === 'function') {
      console.error(
        'unmount(...): does not support a callback argument. ' +
          'To execute a side effect after rendering, declare it in a component body with useEffect().',
      );
    }
  }
  const root = this._internalRoot;
  if (root !== null) {
    this._internalRoot = null;
    const container = root.containerInfo;
    if (__DEV__) {
      if (isAlreadyRendering()) {
        console.error(
          'Attempted to synchronously unmount a root while React was already ' +
            'rendering. React cannot finish unmounting the root until the ' +
            'current render has completed, which may lead to a race condition.',
        );
      }
    }
    flushSync(() => {
      updateContainer(null, root, null, null);
    });
    unmarkContainerAsRoot(container);
  }
};

/** @desc creatRoot的具体实现 */
export function createRoot(
  container: Element | DocumentFragment,
  options?: CreateRootOptions,
): RootType {
  console.log('【校验】zono2.1 createRoot会先校验传入的container是否为一个有效的DOM节点，如果是开发环境还会做一些其他校验如是否为body等')
  warnIfReactDOMContainerInDEV(container);

  /** @desc 是否为严格模式 */
  let isStrictMode = false;
  /** @desc 是否默认开启并发模式 */
  let concurrentUpdatesByDefaultOverride = false;
  /** @desc 标识符前缀，默认为空字符串（MPA项目中适合使用） */
  let identifierPrefix = '';
  /** @desc 可恢复错误的默认处理函数，默认为defaultOnRecoverableError */
  let onRecoverableError = defaultOnRecoverableError;
  /** @desc 过渡回调函数，默认为null */
  let transitionCallbacks = null;
  // 第二个参数不为空时
  if (options !== null && options !== undefined) {
    if (__DEV__) {
      if ((options: any).hydrate) {
        console.warn(
          'hydrate through createRoot is deprecated. Use ReactDOMClient.hydrateRoot(container, <App />) instead.',
        );
      } else {
        if (
          typeof options === 'object' &&
          options !== null &&
          (options: any).$$typeof === REACT_ELEMENT_TYPE
        ) {
          console.error(
            'You passed a JSX element to createRoot. You probably meant to ' +
              'call root.render instead. ' +
              'Example usage:\n\n' +
              '  let root = createRoot(domContainer);\n' +
              '  root.render(<App />);',
          );
        }
      }
    }
    if (options.unstable_strictMode === true) {
      isStrictMode = true;
    }
    if (
      allowConcurrentByDefault &&
      options.unstable_concurrentUpdatesByDefault === true
    ) {
      concurrentUpdatesByDefaultOverride = true;
    }
    if (options.identifierPrefix !== undefined) {
      identifierPrefix = options.identifierPrefix;
    }
    if (options.onRecoverableError !== undefined) {
      onRecoverableError = options.onRecoverableError;
    }
    if (options.transitionCallbacks !== undefined) {
      transitionCallbacks = options.transitionCallbacks;
    }
  }

  const root = createContainer(
    container,
    ConcurrentRoot,
    null,
    isStrictMode,
    concurrentUpdatesByDefaultOverride,
    identifierPrefix,
    onRecoverableError,
    transitionCallbacks,
  );

  console.log('【初次渲染】zono9.创建FiberRoot、HostRootFiber后，会把FiberRoot.current（hostFiber）传给根节点');
  /** @desc HostRootFiber */
  const uninitializedFiber=root.current
  markContainerAsRoot(uninitializedFiber, container); // 在container这个DOM打上React的标记，就是在DOM上加个属性

  console.log('【流程】传入的container是注释标签，则取它的父节点，否则取本身，通过listenToAllSupportedEvents把组成事件(事件委托)')
  const rootContainerElement: Document | Element | DocumentFragment =
    container.nodeType === COMMENT_NODE
      ? (container.parentNode: any)
      : container; //判断传入的container是不是注释标签，是就去它父元素

  console.log(`【解释】总结React事件，初始化时，React把所有浏览器事件绑定到传入的container上，绑定的事件是一个带有优先级包装过的listenr。
    若传入的是注释标签就绑定在它父元素上，并定义一个map映射表，把原生和react事件相对应，当触发一个事件时，实际是触发初始化时绑定的listenr，
    执行这个listenr时会从触发的target向上到root递归收集相同react事件，放在一个listenrs数组中，React事件函数是通过优先级封装了一层，
    React事件有不同的优先级，不同事件对应不同优先级，也对应着不同的事件对象syntheticBaseEvent，把收集到的事件通过batchUpdate触发`)
  listenToAllSupportedEvents(rootContainerElement);
  console.log(`【初次渲染】zono13.至此createRoot工作基本做完，主要就是根据传入的DOM创建FiberRoot和HostRootFiber，初始化HostRootFiber的状态以及更新队列
  并把HostRootFiber.stateNode指向FiberRoot，把FiberRoot.current指向HostRootFiber，用于更新。
  并通过所有浏览器事件名创建对应的带有更新优先级的listener绑定在传入的DOM节点上`)
  return new ReactDOMRoot(root);
}

// -----------------------------------------------------------------
function ReactDOMHydrationRoot(internalRoot: FiberRoot) {
  this._internalRoot = internalRoot;
}
function scheduleHydration(target: Node) {
  if (target) {
    queueExplicitHydrationTarget(target);
  }
}
ReactDOMHydrationRoot.prototype.unstable_scheduleHydration = scheduleHydration;

/** @desc hydrateRoot的具体实现 */
export function hydrateRoot(
  container: Document | Element,
  initialChildren: ReactNodeList,
  options?: HydrateRootOptions,
): RootType {


  warnIfReactDOMContainerInDEV(container);

  if (__DEV__) {
    if (initialChildren === undefined) {
      console.error(
        'Must provide initial children as second argument to hydrateRoot. ' +
          'Example usage: hydrateRoot(domContainer, <App />)',
      );
    }
  }

  // For now we reuse the whole bag of options since they contain
  // the hydration callbacks.
  const hydrationCallbacks = options != null ? options : null;
  // TODO: Delete this option
  const mutableSources = (options != null && options.hydratedSources) || null;

  let isStrictMode = false;
  let concurrentUpdatesByDefaultOverride = false;
  let identifierPrefix = '';
  let onRecoverableError = defaultOnRecoverableError;
  if (options !== null && options !== undefined) {
    if (options.unstable_strictMode === true) {
      isStrictMode = true;
    }
    if (
      allowConcurrentByDefault &&
      options.unstable_concurrentUpdatesByDefault === true
    ) {
      concurrentUpdatesByDefaultOverride = true;
    }
    if (options.identifierPrefix !== undefined) {
      identifierPrefix = options.identifierPrefix;
    }
    if (options.onRecoverableError !== undefined) {
      onRecoverableError = options.onRecoverableError;
    }
  }

  const root = createHydrationContainer(
    initialChildren,
    null,
    container,
    ConcurrentRoot,
    hydrationCallbacks,
    isStrictMode,
    concurrentUpdatesByDefaultOverride,
    identifierPrefix,
    onRecoverableError,
    // TODO(luna) Support hydration later
    null,
  );
  markContainerAsRoot(root.current, container);
  // This can't be a comment node since hydration doesn't work on comment nodes anyway.
  listenToAllSupportedEvents(container);

  if (mutableSources) {
    for (let i = 0; i < mutableSources.length; i++) {
      const mutableSource = mutableSources[i];
      registerMutableSourceForHydration(root, mutableSource);
    }
  }

  return new ReactDOMHydrationRoot(root);
}


// -----------------------------------------------------------------
/** @desc 校验container是否有效 */
export function isValidContainer(node: any): boolean {
  return !!(
    node &&
    (node.nodeType === ELEMENT_NODE ||
      node.nodeType === DOCUMENT_NODE ||
      node.nodeType === DOCUMENT_FRAGMENT_NODE ||
      (!disableCommentsAsDOMContainers &&
        node.nodeType === COMMENT_NODE &&
        (node: any).nodeValue === ' react-mount-point-unstable '))
  );
}

// TODO: Remove this function which also includes comment nodes.
// We only use it in places that are currently more relaxed.
export function isValidContainerLegacy(node: any): boolean {
  return !!(
    node &&
    (node.nodeType === ELEMENT_NODE ||
      node.nodeType === DOCUMENT_NODE ||
      node.nodeType === DOCUMENT_FRAGMENT_NODE ||
      (node.nodeType === COMMENT_NODE &&
        (node: any).nodeValue === ' react-mount-point-unstable '))
  );
}

/** @desc 检查container是否在DEV环境下 */
function warnIfReactDOMContainerInDEV(container: any) {
  if (__DEV__) {
    if (
      container.nodeType === ELEMENT_NODE &&
      ((container: any): Element).tagName &&
      ((container: any): Element).tagName.toUpperCase() === 'BODY'
    ) {
      console.error(
        'createRoot(): Creating roots directly with document.body is ' +
          'discouraged, since its children are often manipulated by third-party ' +
          'scripts and browser extensions. This may lead to subtle ' +
          'reconciliation issues. Try using a container element created ' +
          'for your app.',
      );
    }
    if (isContainerMarkedAsRoot(container)) {
      if (container._reactRootContainer) {
        console.error(
          'You are calling ReactDOMClient.createRoot() on a container that was previously ' +
            'passed to ReactDOM.render(). This is not supported.',
        );
      } else {
        console.error(
          'You are calling ReactDOMClient.createRoot() on a container that ' +
            'has already been passed to createRoot() before. Instead, call ' +
            'root.render() on the existing root instead if you want to update it.',
        );
      }
    }
  }
}
