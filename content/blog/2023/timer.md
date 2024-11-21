---
title: "14. 타이머"
date: "2023-01-25"
description: "모던 자바스크립트 Deep Dive [41장]"
category: "Study"
tags: ["Javascript", "모던 자바스크립트 Deep Dive"]
---

# 호출 스케줄링

함수를 명시적으로 호출하지 않고 일정 시간이 경과된 이후에 호출되도록 호출을 예약하려면 타이머 함수를 사용한다.

이를 호출 스케줄링이라 한다.

타이머 함수는 호스트 객체이다.

- 브라우저 환경과 Node.js 환경에서의 전역 객체의 메서드
- setTimeout, setInterval

---

# 타이머 함수

## 1. setTimeout / clearTimeout

전달 받은 시간으로 단 한 번 동작하는 타이머를 생성한다.

타이머가 만료되면 첫 번째 인수로 전달받은 콜백 함수가 호출된다.

### 매개변수

```jsx
const timeoutId = setTimeout(func|code[, delay, param1, param2, ...]);
```

- func
  - 타이머가 만료된 뒤 호출될 콜백 함수
- delay
  - 타이머 만료 시간(ms)
  - 기본 값 0
- param1, param2, …
  - 호출 스케줄링 된 콜백 함수에 전달해야 할 인수가 존재하는 경우 전달

setTimeout 함수는 생성된 타이머를 식별할 수 있는 고유한 타이머 id를 반환한다.

이 id를 clearTimeout 함수의 인수로 전달하여 타이머를 취소할 수 있다.

## 2. setInterval / clearInterval

전달받은 시간으로 반복 동작하는 타이머를 생성한다.

이후 타이머가 만료될 때마다 첫 번째 인수로 전달받은 콜백 함수가 반복 호출된다.

```jsx
const timerId = setInterval(func|code[, delay, param1, param2, ... ]);
```

setInterval 함수는 생성된 타이머를 식별할 수 있는 고유한 타이머 id를 반환한다.

이 id를 clearInterval 함수의 인수로 전달하여 타이머를 취소할 수 있다.

---

# 디바운스와 스로틀
