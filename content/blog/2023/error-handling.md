---
title: "21. 에러 처리"
date: "2023-02-15"
description: "모던 자바스크립트 Deep Dive [47장]"
category: "Study"
tags: ["Javascript", "모던 자바스크립트 Deep Dive"]
---

# 에러 처리의 필요성

에러가 발생하지 않는 코드를 작성하는 것은 불가능하다.

에러에 대해 대처하지 않고 방치하면 프로그램은 강제 종료 된다.

```jsx
console.log("[Start]");

foo(); // ReferenceError: foo is not defined
// 발생한 에러를 방치하면 프로그램은 강제 종료된다.

// 에러에 의해 프로그램이 강제 종료되어 아래 코드는 실행되지 않는다.
console.log("[End]");
```

`try...catch`문을 사용해 발생한 에러에 적절하게 대응하면 프로그램이 강제 종료되지 않고 계속해서 코드를 실행시킬 수 있다.

```jsx
console.log("[Start]");

try {
  foo();
} catch (error) {
  console.error("[에러 발생]", error);
  // [에러 발생] ReferenceError: foo is not defined
}

// 발생한 에러에 적절한 대응을 하면 프로그램이 강제 종료되지 않는다.
console.log("[End]");
```

직접적으로 에러를 발생시키지 않는 예외적인 상황에 적절하게 대응하지 않으면 에러로 이어질 가능성이 크다.

에러나 예외적인 상황은 너무나 다양하기 때문에 아무런 조치 없이 프로그램이 종료되면 원인을 찾기 힘들어진다.

따라서 언제나 에러나 예외적인 상황이 발생할 수 있다는 것을 인지하고 이에 대응하는 코드를 작성하는 것이 중요하다.

---

# try … catch … finally문

```jsx
console.log("[Start]");

try {
  // 실행할 코드(에러가 발생할 가능성이 있는 코드)
  foo();
} catch (err) {
  // try 코드 블록에서 에러가 발생하면 이 코드 블록의 코드가 실행된다.
  // err에는 try 코드 블록에서 발생한 Error 객체가 전달된다.
  console.error(err); // ReferenceError: foo is not defined
} finally {
  // 에러 발생과 상관없이 반드시 한 번 실행된다.
  console.log("finally");
}

// try...catch...finally 문으로 에러를 처리하면 프로그램이 강제 종료되지 않는다.
console.log("[End]");
```

`try ... catch ... finally` 문으로 에러를 처리하면 프로그램이 강제 종료되지 않는다.

---

# Error 객체

Error 생성자 함수는 에러 객체를 생성한다.

Error 생성자 함수에는 에러를 상세히 설명하는 에러 메시지를 인수로 전달할 수 있다.

```jsx
const error = new Error("invalid");
```

- message 프로퍼티
  - Error 생성자 함수에 인수로 전달한 에러 메시지
- stack 프로퍼티
  - 에러를 발생시킨 콜 스택의 호출 정보를 나타내는 문자열 (디버깅 목적)

### Error 생성자 함수 7가지와 인스턴스

- Error
  - 일반적 에러 객체
- SyntaxError
  - 자바스크립트 문법에 맞지 않는 문을 해석할 때 발생하는 에러 객체
- ReferenceError
  - 참조할 수 없는 식별자를 참조했을 때 발생하는 에러 객체
- TypeError
  - 피연산자 또는 인수의 데이터 타입이 유효하지 않을 때 발생하는 에러 객체
- RangeError
  - 숫자값의 허용 범위를 벗어났을 때 발생하는 에러 객체
- URIError
  - encodeURI 또는 decodeURI 함수에 부적절한 인수를 전달했을 때 발생하는 에러 객체
- EvalError
  - eval 함수에서 발생하는 에러 객체

---

# throw 문

Error 생성자 함수로 에러 객체를 생성한다고 에러가 발생하는 것은 아니다.

에러를 발생시키려면 try 코드 블록에서 `throw` 문으로 에러 객체를 던져야 한다.

```jsx
throw 표현식;
```

에러를 던지면 catch 문의 에러 변수가 생성되고 던져진 에러 객체가 할당된다.

```jsx
try {
  // 에러 객체를 생성한다고 에러가 발생하는 것은 아니다.
  new Error("something wrong");
} catch (error) {
  console.log(error);
}
```

---

# 에러의 전파

에러는 호출자(caller) 방향으로 전파된다.

즉, 콜 스택의 아래 방향으로 전파된다.

```jsx
const foo = () => {
  throw Error("foo에서 발생한 에러"); // ④
};

const bar = () => {
  foo(); // ③
};

const baz = () => {
  bar(); // ②
};

try {
  baz(); // ①
} catch (err) {
  console.error(err);
}
```

![Untitled](./images/error1.png)

이 때 throw 된 에러를 캐치하여 적절히 대응하면 프로그램이 종료되지 않고 코드의 실행 흐름을 복구할 수 있다.

에러를 어디에서도 캐치하지 않으면 프로그램이 종료된다.

주의할 것은 setTimeout이나 프로미스 후속 처리 메서드의 콜백 함수는 호출자가 없다는 것이다.

태스크 큐나 마이크로 태스크 큐에 일시 저장되었다가 콜 스택이 비면 이벤트 루프에 의해 콜 스택에 푸시되기 때문에 에러를 전파할 호출자가 존재하지 않는다.
