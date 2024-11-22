---
title: "React의 렌더링 과정"
date: "2023-11-01"
description: "React의 render phase와 commit phase"
category: "Frontend"
tags: ["React"]
---

[Render and Commit – React](https://react.dev/learn/render-and-commit)

[Understanding Reconciliation: React Rendering Phases](https://dev.to/thee_divide/reconciliation-react-rendering-phases-56g2)

# UI를 보여주는 3가지 단계

1. 렌더링 트리거
2. 컴포넌트 렌더링 하기
3. DOM에 commit 하기

# Step 1. 렌더링 트리거

렌더링을 해야 하는 2가지 경우

- 초기 렌더링
- state 업데이트에 따른 리렌더링

## 초기 렌더링

타겟 DOM 노드에 `createRoot` 메서드를 호출하고 `render` 메서드를 호출하여 렌더링을 시작한다.

```js
import Image from "./Image.js";
import { createRoot } from "react-dom/client";

const root = createRoot(document.getElementById("root"));
root.render(<Image />);
```

## State 업데이트에 따른 리렌더링

`useState`의 setter 함수나 `useReducer`의 dispatch 함수에 의해 상태가 변경되어 업데이트가 필요한 경우 리렌더링을 발생시킨다.

# Step 2. 컴포넌트 렌더링

> **“Rendering” is React calling your components.**

렌더링은 리액트가 컴포넌트를 화면에 출력하기 위해 호출하는 것을 의미한다.

- 초기 렌더링을 할 때, root 컴포넌트를 호출한다.
- 리렌더링을 할 때, 렌더링을 트리거한 함수 컴포넌트를 호출한다.

렌더링 과정은 재귀적이다. 컴포넌트가 다른 컴포넌트를 리턴한다면 리액트는 그 컴포넌트들을 렌더링할 것이다. 중첩되는 컴포넌트가 없을 때까지 리액트는 계속해서 이 과정을 반복한다.

```js
// index.js
import Gallery from "./Gallery.js";
import { createRoot } from "react-dom/client";

const root = createRoot(document.getElementById("root"));
root.render(<Gallery />);
```

```js
// Gallery.js
export default function Gallery() {
  return (
    <section>
      <h1>Inspiring Sculptures</h1>
      <Image />
      <Image />
      <Image />
    </section>
  );
}

function Image() {
  return (
    <img
      src="https://i.imgur.com/ZF6s192.jpg"
      alt="'Floralis Genérica' by Eduardo Catalano: a gigantic metallic flower sculpture with reflective petals"
    />
  );
}
```

- 초기 렌더링 단계에서는 `<section>`, `<h1>`, `<img>` 태그에 대한 DOM 노드를 생성한다.
- 리렌더링을 할 때, React는 이전 렌더링과 비교하여 어떤 프로퍼티가 변경되었는지 확인한다. **commit phase로 넘어가기 전까지 이 정보로 아무 작업도 하지 않는다.**
  - 모든 컴포넌트를 체크하지 않고 state나 props가 변경되는 경우 flag를 사용하여 컴포넌트에 표시한다.
  - 실제 DOM에 적용해야 하는 변경 사항 리스트를 생성한다.

# Step 3. 변경 사항을 DOM에 commit 하기

컴포넌트를 호출한 이후에 React는 DOM을 수정시킨다.

- 초기 렌더링을 할 때, 모든 DOM 노드를 스크린에 표시하기 위하여 `appendChild()` DOM API를 실행한다.
- 리렌더링을 할 때, DOM 노드에 변경 사항을 반영하기 위해 필요한 최소한의 작업을 실행한다.
  - 렌더링 과정에서 생성된 변경 사항 리스트를 바탕으로 부분적으로가 아니라 한 번에 신속하게 변경한다. **(batch update)**

**React는 이전 렌더링 결과와 다음 렌더링 결과 사이에 차이점이 존재할 때만 DOM 노드를 변경한다.**

```js
export default function Clock({ time }) {
  return (
    <>
      <h1>{time}</h1>
      <input />
    </>
  );
}
```

매 초마다 time prop이 바뀌어 리렌더링을 일으키는 컴포넌트를 생각해보자.

이 경우에 input에 값을 입력해도 input에 담긴 값이 사라지지 않는다. 그 이유는 React가 time을 표시하는 `<h1>`태그에 대한 업데이트만 진행하기 때문이다.

# Step 4. 브라우저에 표시하기

React가 DOM을 변경한 후에 브라우저는 스크린을 리페인트한다.
