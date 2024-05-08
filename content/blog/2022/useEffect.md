---
title: useEffect
date: "2022-09-06"
description: "useEffect 분명 한 번 배웠는데 이것저것 헷갈린다.
그래서 다시 공부해봤다!"
tags: ["React"]
---

# useEffect ?

useEffect를 사용하면 `side effect`를 컴포넌트에서 수행할 수 있다.

## side effect가 뭔데...

side effect라고 하는 것은 렌더링 후에 부수적으로 실행되어야 하는 작업들이다.
예를 들어 데이터 가져오기나 구독(subscription) 설정하기 같은 것들.
그냥 줄여서 `effect`라고 부르기도 한다.

## useEffect가 하는 일

useEffect 훅은 우리가 넘긴 함수를 기억해놓고 DOM 렌더링 후에 함수를 실행시켜준다.

## useEffect를 왜 컴포넌트 안에서 부를까?

useEffect 훅을 컴포넌트 내에 둠으로써 특별한 API 없이 prop이나 state에 쉽게 접근할 수 있다.

## useEffect는 렌더링 이후에 매번 실행된다.

기본적으로 첫번째 렌더링과 그 이후에 일어나는 업데이트 때마다 실행된다.
필요에 따라 실행될 수 있도록 만들 수 있다.
effect함수가 실행되는 시점에는 DOM 렌더링이 완료되었다는 것을 보장할 수 있다.

## clean-up 함수

말 그대로 정리 함수

```jsx
import React, { useState, useEffect } from "react";

function FriendStatus(props) {
  const [isOnline, setIsOnline] = useState(null);

  useEffect(() => {
    function handleStatusChange(status) {
      setIsOnline(status.isOnline);
    }
    ChatAPI.subscribeToFriendStatus(props.friend.id, handleStatusChange);

    // effect 이후에 어떻게 정리(clean-up)할 것인지 표시합니다.
    return function cleanup() {
      ChatAPI.unsubscribeFromFriendStatus(props.friend.id, handleStatusChange);
    };
  });

  if (isOnline === null) {
    return "Loading...";
  }
  return isOnline ? "Online" : "Offline";
}
```

이 함수가 호출되는 시점은 **컴포넌트가 unmount될 때**이다.
다음의 effect를 실행하기 전에 이전의 effect를 정리한다.
일관성을 유지해주기 때문에 버그를 방지할 수 있다.
