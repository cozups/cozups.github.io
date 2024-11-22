---
title: "커스텀 이벤트"
date: "2023-07-18"
description: "모던 자바스크립트 Deep Dive [31장]"
category: "Frontend"
tags: ["Javascript"]
---

개발자는 기본 이벤트가 아닌 커스텀 이벤트를 생성하여 원하는 작업을 수행할 수 있다.

# 1. 커스텀 이벤트 생성

커스텀 이벤트는 두 가지 방법으로 만들 수 있다.

- `Event()` 생성자
- `CustomEvent()` 생성자

## 1. Event() 생성자

```js
const event = new Event(type, options);
```

- type: 이벤트의 이름을 나타내는 문자열
- options
  - bubbles
    - 이벤트의 버블링 여부
    - default: `false`
  - cancelable
    - 이벤트를 취소할 수 있는지
    - default: `false`
  - composed
    - 이벤트가 섀도 루트(shadow root) 바깥의 이벤트 핸들러로도 전달될지
    - default: `false`
    - 섀도 루트?
      Shadow root(Shadow DOM)은 웹 요소 내부에 캡슐화된 DOM 트리를 생성하는 데 사용된다. 일반적인 HTML 문서의 DOM은 하나의 트리 구조로 표현되지만 Shadow Root를 사용하면 요소 내에 독립적인 DOM 서브 트리를 만들 수 있다. Shadow Root 내부에서 발생한 이벤트는 외부로 전파되지 않고, 독립적인 이벤트 흐름을 가진다. 이를 통해 웹 컴포넌트 내부에서 발생한 이벤트를 외부에서 감지하지 못하게 할 수 있다.

```js
// 버블링 가능하고 취소 불가능한 look 이벤트 생성

const evt = new Event("look", { bubbles: true, cancelable: false });
document.dispatchEvent(evt);

// document 외의 다른 요소에서도 이벤트 발송 가능
myDiv.dispatchEvent(evt);
```

## 2. CustomEvent() 생성자

```js
const customEvent = new CustomEvent(type, options);
```

- type: 이벤트의 이름을 나타내는 문자열
- options
  - detail
    - 이벤트 내에 포함할 이벤트의 세부 정보
    - default: `null`
  - Event() 생성자의 옵션들(bubbles, cancelable, composed)

### 커스텀 이벤트 전달

커스텀 이벤트를 사용하기 위해서 `dispatchEvent()` 메서드를 사용해야 한다.

```js
EventTarget.dispatchEvent(event);
```

```js
// EventTarget 인스턴스를 생성합니다. 이벤트가 발생할 요소를 나타냅니다.
const targetElement = document.getElementById("myElement");

// 커스텀 이벤트를 생성합니다.
const customEvent = new CustomEvent("myCustomEvent", {
  detail: {
    message: "Hello, custom event!",
  },
});

// 이벤트를 발생시킵니다.
targetElement.dispatchEvent(customEvent);

// 이벤트를 수신하는 함수를 정의합니다.
function handleCustomEvent(event) {
  console.log(event.detail.message);
}

// 이벤트를 수신할 요소에 이벤트 핸들러를 등록합니다.
targetElement.addEventListener("myCustomEvent", handleCustomEvent);
```
