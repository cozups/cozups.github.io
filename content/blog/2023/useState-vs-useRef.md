---
title: "useState vs useRef"
date: "2023-02-28"
description: "useState와 useRef"
category: "Frontend"
tags: ["React"]
---

둘 다 리액트에서 동적으로 상태를 관리할 수 있도록 해주는 훅이다.

다만, useRef를 사용하는 경우 컴포넌트 리렌더링을 하지 않는다.

> \*Keep in mind that `useRef` doesn’t notify you when its content changes. **Mutating the `.current` property doesn’t cause a re-render**. If you want to run some code when React attaches or detaches a ref to a DOM node, you may want to use a [callback ref](https://reactjs.org/docs/hooks-faq.html#how-can-i-measure-a-dom-node) instead.

cr:\* [https://reactjs.org/docs/hooks-reference.html#useref](https://reactjs.org/docs/hooks-reference.html#useref)

>

반면, useState는 setState 함수를 통해 상태를 업데이트하는 경우 리렌더링을 발생시킨다.

> \*The `setState` function is used to update the state. **It accepts a new state value and enqueues a re-render of the component.**

cr:\* [https://reactjs.org/docs/hooks-reference.html#useState](https://reactjs.org/docs/hooks-reference.html#useState)

>

따라서, 무엇을 사용할 지는 리렌더링의 필요 여부에 따라 결정하면 된다.

- 리렌더링이 필요한 경우 → useState
- 리렌더링이 필요하지 않은 경우 → useRef
