---
title: "[원티드] 상태 관리가 rendering에 미치는 영향"
date: "2023-04-10"
description: "원티드 프리온보딩 프론트엔드 챌린지 두번째 강의"
category: "Frontend"
tags: ["React", "원티드 프리온보딩 챌린지"]
---

# useState vs useReducer

## 1. useState

- 간단한 상태 관리
  - 값이 하나인 경우
  - 상태들이 서로 관련이 없는 경우
- 컴포넌트 내에서 사용하는 경우

```jsx
const [state, setState] = useState(initialState);
```

```jsx
import { useState } from "react";

function FavoriteColor() {
  const [color, setColor] = useState("");
}
```

### 사용 시 주의 사항

[State as a Snapshot](https://react.dev/learn/state-as-a-snapshot)

```jsx
import { useState } from "react";

export default function Counter() {
  const [number, setNumber] = useState(0);

  return (
    <>
      <h1>{number}</h1>
      <button
        onClick={() => {
          setNumber(number + 1);
          setNumber(number + 1);
          setNumber(number + 1);
        }}
      >
        +3
      </button>
    </>
  );
}
```

위 코드에서 +3 버튼을 눌러도 1씩 증가한다. 그 이유는 상태 업데이트는 다음 렌더링에서 이루어지고 현재의 렌더링 상태에서는 number값이 여전히 0이므로 `setNumber(0 + 1)`이 3번 실행되는 것이나 마찬가지이기 때문이다.

React의 state는 **사용자가 상호 작용한 시점의 상태 스냅샷을 사용**한다.

이를 해결하기 위해 setState 함수 내에 화살표 함수를 이용하여 이전 상태를 기반으로 상태를 업데이트 시킬 수 있다.

```jsx
import { useState } from "react";

export default function Counter() {
  const [number, setNumber] = useState(0);

  return (
    <>
      <h1>{number}</h1>
      <button
        onClick={() => {
          setNumber(prevNumber => prevNumber + 1);
          setNumber(prevNumber => prevNumber + 1);
          setNumber(prevNumber => prevNumber + 1);
        }}
      >
        +3
      </button>
    </>
  );
}
```

## 2. useReducer

- 복잡한 상태관리
  - 상태들이 서로 관련이 있거나, 참조가 필요한 경우
  - 로그인 된 사용자의 권한을 확인해서 다른 화면에 보여주기
- 여러 컴포넌트에서 상태가 공유되어야 할 때
  - context API 사용 시 사용하는 것이 일반적
- reducer를 따로 선언하는 것이 일반적

```jsx
const [state, dispatch] = useReducer(reducer, initialState);
```

```jsx
import { useReducer } from "react";
import ReactDOM from "react-dom/client";

const initialTodos = [
  {
    id: 1,
    title: "Todo 1",
    complete: false,
  },
  {
    id: 2,
    title: "Todo 2",
    complete: false,
  },
];

const reducer = (state, action) => {
  switch (action.type) {
    case "COMPLETE":
      return state.map(todo => {
        if (todo.id === action.id) {
          return { ...todo, complete: !todo.complete };
        } else {
          return todo;
        }
      });
    default:
      return state;
  }
};

function Todos() {
  const [todos, dispatch] = useReducer(reducer, initialTodos);

  const handleComplete = todo => {
    dispatch({ type: "COMPLETE", id: todo.id });
  };

  return (
    <>
      {todos.map(todo => (
        <div key={todo.id}>
          <label>
            <input
              type="checkbox"
              checked={todo.complete}
              onChange={() => handleComplete(todo)}
            />
            {todo.title}
          </label>
        </div>
      ))}
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Todos />);
```

보통 useState만 써서 충분한 경우가 대부분이다.

useReducer를 사용하는 것이 효율적인 경우는 다음과 같다.

- 관리해야 하는 상태가 많은 경우
- 상태들이 서로 관련이 있는 경우
- 비즈니스 로직 분리
- Immutability

---

# useMemo vs useCallback

## 1. useMemo

- 함수의 결과를 cache하기 위해 사용 (렌더링할 때마다 계산되지 않도록)
  - expensive computation을 하는 경우
    - 1ms 이상 걸리면 expensive
- 조건에 따를 컴포넌트를 리턴할 때 사용하거나 특정 변수를 계산할 때
- 초기 렌더링보다는 re-rendering에 유리함 (cache 되기 때문)
  - 시간복잡도를 n으로 칭할 때, n > 5000일 때 훨씬 유리함
  - [https://github.com/yeonjuan/dev-blog/blob/master/JavaScript/should-you-really-use-usememo.md?utm_source=substack&utm_medium=email](https://github.com/yeonjuan/dev-blog/blob/master/JavaScript/should-you-really-use-usememo.md?utm_source=substack&utm_medium=email)
  - 처리량이 많을 때 사용해야 함. 아닌 경우 오히려 추가 오버헤드가 생김

```jsx
import React, { useMemo } from 'react';

function MyComponent({ data }) {
  const expensiveFunction = (data) => {
    // Some expensive computation here
    return result;
  };

  const memoizedValue = useMemo(() => expensiveFunction(data), [data]);

  return (
    // Render using memoizedValue
  );
}
```

- arguments
  - 실행할 함수: 값을 반환하는 수
  - dependency 배열

## 2. useCallback

- 함수 자체를 cache하기 위해 사용 (렌더링 할 때마다 다시 생성되지 않도록)
- dependency를 확인해야 하는 함수일 때
- ChildComponent에 prop으로 넘겨주는 함수일 때

```jsx
import React, { useCallback } from "react";

function MyComponent({ onClick }) {
  const memoizedOnClick = useCallback(
    () => {
      // Do something on click
    },
    [
      /* Dependencies */
    ]
  );

  return <button onClick={memoizedOnClick}>Click me</button>;
}
```

- arguments
  - function
  - dependency 배열

---

# React 18에서 추가된 Hook

## 1. useId

- 클라이언트 사이드와 서버 사이드에서 unique ID를 생성을 돕는 훅
  - hydration mismatch를 방지
- useId 훅이 생성한 unique ID는 accessibility attribute에 전달될 수 있다.

## 2. useTransition

- UI를 blocking하지 않고 state를 변경할 수 있도록 하는 훅
- state 변경 시 UI를 즉시 업데이트 하지 않고 현재 UI 상태를 일시적으로 유지할 수 있게 개발자가 컨트롤 할 수 있도록 한다.
- urgent state updates (ex. text input 업데이트)가 non-urgent state updates (ex. 검색 결과를 렌더링)를 중단시킨다.
- React가 렌더링을 중단, 일시 중지, 재개 또는 포기할 수 있도록 하여 사용자의 기기 성능과 네트워크 속도에 맞춰 렌더링을 더욱 반응성 있게 조정할 수 있다.
- UI의 갑작스러운 변경을 방지하고 애플리케이션의 여러 상태 간에 더 부드러운 전환을 제공하여 사용자 경험을 개선할 수 있다.

## 3. useDeferredValue

- DOM tree의 non-urgent part가 리렌더링 되는 것을 지연시키는 훅
- state 변경을 반영하기 위해 DOM이 업데이트될 때까지 state 값의 업데이트를 연기할 수 있도록 하는 훅
- 개발자가 setState 호출에 대해 직접 컨트롤할 수 없는 경우 유용하다.
- urgent update가 먼저 이루어지고 덜 중요한, 시간이 오래걸리는 이벤트는 나중에 실행된다.
- 디바운스와 비슷하지만 정해진 지연 시간이 없으므로 첫 번째 렌더링이 화면에 반영된 직후에 지연된 렌더링을 시도한다.

## 4. useSyncExternalStore

- 스토어에 대한 업데이트를 강제로 동기화하여 외부 스토어가 동시 읽기를 지원할 수 있도록 하는 훅
- 외부 데이터 소스에 대한 구독을 구현할 때 useEffect가 필요하지 않다.
- React 외부 상태와 통합되는 모든 라이브러리에 권장된다.

## 5. useInsertionEffect

- CSS-in-JS 라이브러리가 렌더링에서 스타일을 입힐 때 발생하는 성능 문제를 해결할 수 있는 훅
- concurrent rendering 중 리액트가 레이아웃을 한 번 더 계산할 수 있다.

사실 아직 완벽히 이해하진 못했다.😅😅😅

---

# 기타 hook들

간단히만 정리하고 자세한 건 따로 포스트를 작성하겠습니다.

## useEffect

- 컴포넌트에서 사이드 이펙트를 수행할 수 있도록 하는 훅
  - fetching data, direct updating the DOM, timer

```jsx
import { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";

function Timer() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setTimeout(() => {
      setCount(count => count + 1);
    }, 1000);
  });

  return <h1>I've rendered {count} times!</h1>;
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Timer />);
```

## useLayoutEffect

- useEffect와 비슷한 훅이지만 DOM 변형이 적용되고 브라우저에 그려지기 전에 실행된다.
  - DOM 변형 → useLayoutEffect → 브라우저

```jsx
import { useState, useLayoutEffect } from "react";

function MeasureElement() {
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const ref = useRef(null);

  useLayoutEffect(() => {
    if (ref.current) {
      setWidth(ref.current.offsetWidth);
      setHeight(ref.current.offsetHeight);
    }
  }, []);

  return (
    <div ref={ref}>
      This element is {width}px wide and {height}px tall.
    </div>
  );
}
```

## useRef

- 변경 가능한 ref 객체를 반환하는 훅
  - current 프로퍼티를 반환함.
    - 어떤 값도 저장될 수 있고 렌더링 간 유지된다.

```jsx
import { useRef } from "react";

function MyComponent() {
  const myRef = useRef(null);

  const handleClick = () => {
    myRef.current.style.backgroundColor = "red";
  };

  return (
    <div ref={myRef}>
      <button onClick={handleClick}>Change color</button>
    </div>
  );
}
```

---

# 전역 상태 툴

## 1. Context API

- React 기본 제공 툴
- Provider를 이용해 컴포넌트들에 state를 provide하는 방식
- props drilling을 해결할 수 있다.

### 장점

1. 매우 간단하다.
2. 추가 패키지를 설치하지 않아도 된다.
3. props drilling을 해결한다.
   1. 컴포넌트 간 전달해야할 prop의 개수도 줄어들어 가독성이 높아진다.

### 단점

1. 비즈니스 로직에 따라서 Provider를 생성해야 함
   1. 코드가 복잡해질 수 있다.
2. 렌더링 효율에 좋지 않다.
3. 디버깅하기 힘들다.

## 2. Redux

- 모든 상태를 store에 저장한다.
  - Context API: context별로 reducer를 따로 사용
- read-only states
  - dispatch를 통해서만 상태를 업데이트
  - store를 직접적으로 mutate할 수 없음

### 장점

- 모든 상태를 store에 저장하므로 상태를 관리하고 업데이트하기 용이하다.
- 직접적으로 연결되지않은 컴포넌트 간에도 상태를 쉽게 공유할 수 있다.
- 상태 관리 로직을 UI 컴포넌트와 분리하여 코드를 정리할 수 있고 가독성이 향상된다.
- Redux DevTools를 활용한 비교적 쉬운 디버깅
- saga, thunk, persistent와 같은 미들웨어가 존재

### 단점

- 구조가 복잡하다.
- 애플리케이션 사이즈가 작을 경우 불필요한 오버헤드 발생

## 3. Recoil

- facebook에서 만든 라이브러리
- atoms and selectors 개념
  - 내가 필요한 값만 subscribe
  - atom은 state와 유사한 개념
  - selector는 atom을 조작해야하는 경우 사용

### 장점

- 구조가 간단해서 적용하기 쉽다.
- Context API의 rendering 비효율을 개선한다.
- concurrent mode를 지원하므로 높은 성능과 반응성을 요구하는 애플리케이션에 좋다.

### 단점

- 사용자가 비교적 적음
- 미들웨어가 없음

---

# 수업 외 TIP

- 네트워크 잘 정리된 글 [https://yozm.wishket.com/magazine/detail/1875/](https://yozm.wishket.com/magazine/detail/1875/)
- 운영체제 강의 추천 [http://www.kocw.net/home/search/kemView.do?kemId=1046323](http://www.kocw.net/home/search/kemView.do?kemId=1046323)
