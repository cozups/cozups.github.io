---
title: "[JS] ==와 ==="
date: "2023-05-24"
description: "동등/일치 비교 연산자"
category: "JavaScript"
tags: ["Javascript"]
---

==와 ===는 모두 비교 연산자이다.

다만 ==은 동등 비교 연산자이고, ===는 일치 비교 연산자이다. 비교하는 엄격성의 정도가 다르다.

# 1. 동등 비교 연산자

동등 비교 연산자는 좌항과 우항의 피연산자를 비교할 때 먼저 **암묵적 타입 변환**을 통해 타입을 일치시킨 후 **같은 값**인지 비교한다.

```jsx
5 == 5; // true

5 == "5"; // true
```

동등 비교 연산자는 편리하지만 결과를 예측하기 어렵다.

```jsx
"0" == ""; // false
0 == ""; // true
0 == "0"; // true
false == "false"; // false
false == "0"; // true
false == null; // false
false == undefined; // false
```

# 2. 일치 비교 연산자

일치 비교 연산자는 좌항과 우항의 피연산자가 타입도 같고 값도 같은 경우에 한하여 true를 반환한다.

```jsx
5 === 5; // true

5 === "5"; // false
```

일치 비교 연산자에서 주의해야 할 것은 NaN이다. NaN은 자신과 일치하지 않는 유일한 값이다.

```jsx
NaN === NaN; // false
```

따라서 숫자가 NaN인지 조사하려면 Number.isNaN을 사용한다.

```jsx
Number.isNaN(NaN); // true
Number.isNaN(10); // false
Number.isNaN(1 + undefined); // true
```

숫자 0도 양의 0과 음의 0을 비교하면 true를 반환하므로 주의해야 한다.

```jsx
0 === -0; // true
0 == -0; // true
```
