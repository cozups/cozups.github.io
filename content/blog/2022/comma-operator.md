---
title: 쉼표 (,) 연산자
date: "2022-09-19"
description: "쉼표 연산자에 대하여"
category: "JavaScript"
tags: ["JavaScript"]
---

자바스크립트로 알고리즘 문제를 풀다가 다른 사람의 풀이에서 쉼표 연산자를 발견했다.
처음 보는 연산자였기 때문에 쉼표 연산자에 대해서 찾아 보았다.

> 쉼표 연산자는 각각의 피연산자를 왼쪽에서 오른쪽 순서로 평가하고, 마지막 연산자의 값을 반환한다.

쉽게 말해

```
변수 = (a, b, c);
```

위 형태의 코드가 있을 때 a 실행 → b 실행 → c 반환의 형태로 실행된다.

그러므로,

```js
let a = (obj, value) => {
  obj += value;
  obj += value;
  return obj;
};

a(1, 2); // 5
```

이 코드는 곧

```js
let a = (obj, value) => ((obj += value), (obj += value), obj);

a(1, 2); // 5
```

이러한 형태로 쓸 수 있다.

이는 `map`, `reduce` 함수 등에서 요긴하게 쓰일 수 있다.

```js
let arr = [1, 2, 3, 4, 5];

let aa = arr.reduce((obj, value) => {
  obj += value;
  return obj;
}, 0);

let bb = arr.reduce((obj, value) => ((obj += value), obj), 0);

console.log(aa); // 15
console.log(bb); // 15
```

쉼표 연산자에 대한 이해는 아래 블로그를 통해 공부하였습니다.
[https://inpa.tistory.com/entry/JS-📚-콤마연산자-a-b-c](https://inpa.tistory.com/entry/JS-%F0%9F%93%9A-%EC%BD%A4%EB%A7%88%EC%97%B0%EC%82%B0%EC%9E%90-a-b-c)
